import fs from 'node:fs';
import path from 'node:path';

type Scalar=string|boolean;
type Predicate={field:string;equals:Scalar};
type Constraint={id:string;kind:'implies';if:Predicate;then:Predicate};
type Field={type:'enum'|'boolean';choices?:string[]};
type Protocol={protocol:string;calibrationMinimumCases:number;fields:Record<string,Field>;constraints:Constraint[];cases:{id:string;context:string;expected:Record<string,Scalar>}[]};
type FieldPrediction={value:Scalar;scores?:Record<string,number>};
type Prediction={id:string;fields:Record<string,FieldPrediction>};

const args=process.argv.slice(2);const value=(flag:string)=>{const i=args.indexOf(flag);return i<0?undefined:args[i+1]};
const root=process.cwd();
const protocolPath=path.resolve(root,value('--cases')||'harness/consistency/cases.json');
const predictionPath=value('--predictions');
if(!predictionPath)throw new Error('Usage: npm run consistency:score -- --predictions <artifact.json> [--cases <cases.json>] [--out <report.json>]');
const protocol:Protocol=JSON.parse(fs.readFileSync(protocolPath,'utf8'));
const raw=JSON.parse(fs.readFileSync(path.resolve(root,predictionPath),'utf8'));
const predictions:Prediction[]=Array.isArray(raw)?raw:raw.predictions;
if(!Array.isArray(predictions))throw new Error('Prediction artifact must be an array or contain predictions[].');
const byId=new Map(predictions.map(p=>[p.id,p]));
const fieldNames=Object.keys(protocol.fields);let fieldCorrect=0,totalFields=0,jointCorrect=0,totalViolations=0,totalChecks=0;
const perField=Object.fromEntries(fieldNames.map(f=>[f,{correct:0,total:0,accuracy:0}]));
const caseRows:any[]=[];const calibration:{confidence:number;correct:boolean;brier:number}[]=[];
const key=(v:Scalar)=>String(v);
for(const c of protocol.cases){const p=byId.get(c.id);if(!p)throw new Error(`Missing prediction for ${c.id}`);const actual=Object.fromEntries(fieldNames.map(f=>[f,p.fields?.[f]?.value]));const fieldMatches:Record<string,boolean>={};let all=true;
 for(const f of fieldNames){if(!(f in p.fields))throw new Error(`Missing field ${f} for ${c.id}`);const match=actual[f]===c.expected[f];fieldMatches[f]=match;all&&=match;fieldCorrect+=Number(match);totalFields++;perField[f].correct+=Number(match);perField[f].total++;
  const scores=p.fields[f].scores;if(scores){const choices=protocol.fields[f].type==='boolean'?['false','true']:(protocol.fields[f].choices||[]);const vals=choices.map(x=>Number(scores[x]??0));const sum=vals.reduce((a,b)=>a+b,0);if(vals.some(x=>!Number.isFinite(x)||x<0)||Math.abs(sum-1)>.02)throw new Error(`Invalid probability distribution for ${c.id}.${f}`);const expectedKey=key(c.expected[f]);const confidence=Number(scores[key(actual[f])]??0);const brier=vals.reduce((acc,prob,i)=>acc+(prob-(choices[i]===expectedKey?1:0))**2,0);calibration.push({confidence,correct:match,brier});}}
 const violations=protocol.constraints.filter(rule=>actual[rule.if.field]===rule.if.equals&&actual[rule.then.field]!==rule.then.equals).map(x=>x.id);totalViolations+=violations.length;totalChecks+=protocol.constraints.length;jointCorrect+=Number(all);caseRows.push({id:c.id,expected:c.expected,actual,fieldMatches,jointCorrect:all,constraintViolations:violations});}
for(const f of fieldNames)perField[f].accuracy=perField[f].correct/perField[f].total;
const report:any={protocol:protocol.protocol,createdAt:new Date().toISOString(),cases:protocol.cases.length,fieldsPerCase:fieldNames.length,metrics:{perField,fieldAccuracy:fieldCorrect/totalFields,strictJointAccuracy:jointCorrect/protocol.cases.length,constraintViolations:totalViolations,constraintChecks:totalChecks,constraintViolationRate:totalViolations/totalChecks},calibration:{status:'withheld',minimumCases:protocol.calibrationMinimumCases,labeledCases:protocol.cases.length,reason:`Brier score and ECE are withheld until at least ${protocol.calibrationMinimumCases} labeled cases are locked.`},caseRows};
if(protocol.cases.length>=protocol.calibrationMinimumCases&&calibration.length===totalFields){const brier=calibration.reduce((a,x)=>a+x.brier,0)/calibration.length;const bins=10;let weighted=0;for(let i=0;i<bins;i++){const lo=i/bins,hi=(i+1)/bins;const rows=calibration.filter(x=>x.confidence>=lo&&(i===bins-1?x.confidence<=hi:x.confidence<hi));if(rows.length){const acc=rows.filter(x=>x.correct).length/rows.length;const conf=rows.reduce((a,x)=>a+x.confidence,0)/rows.length;weighted+=rows.length/calibration.length*Math.abs(acc-conf)}}report.calibration={status:'reported',minimumCases:protocol.calibrationMinimumCases,labeledCases:protocol.cases.length,brier,ece10:weighted};}
const out=value('--out');if(out){fs.mkdirSync(path.dirname(path.resolve(root,out)),{recursive:true});fs.writeFileSync(path.resolve(root,out),JSON.stringify(report,null,2)+'\n')}console.log(JSON.stringify(report,null,2));
