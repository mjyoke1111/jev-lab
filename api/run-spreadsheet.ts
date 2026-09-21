import type {VercelRequest,VercelResponse} from '@vercel/node';
import {createHash} from 'node:crypto';
const sha=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
type Row={id:string;text:string;hash:string};
export default async function handler(req:VercelRequest,res:VercelResponse){
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});res.setHeader('Cache-Control','no-store');
 const policy=typeof req.body?.policy==='string'?req.body.policy.trim():'';const rows=Array.isArray(req.body?.rows)?req.body.rows as Row[]:[];
 if(policy.length<8||policy.length>800||!rows.length||rows.length>20)return res.status(400).json({error:'invalid_request'});
 if(rows.some(r=>typeof r.id!=='string'||typeof r.text!=='string'||r.text.length>2500||typeof r.hash!=='string'))return res.status(400).json({error:'invalid_rows'});
 const key=process.env.TYPESAFE_API_KEY;if(!key)return res.status(503).json({error:'jev_not_configured'});
 const questions=Object.fromEntries(rows.map((row,i)=>[`row_${i}`,{type:'choice',instructions:`Apply this policy only to \`state.rows.row_${i}\`. Policy: ${policy}`,criteria:{keep:'The row clearly satisfies the policy and should be kept.',review:'The row is ambiguous, incomplete, or needs human review under the policy.',drop:'The row clearly violates the policy and should be dropped.'}}]));
 const state={rows:Object.fromEntries(rows.map((r,i)=>[`row_${i}`,r.text]))};const started=performance.now();
 const r=await fetch('https://api.typesafe.ai/v1/systemone',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'jev-1.13.0',state,questions})});
 if(!r.ok){console.error('spreadsheet_jev_failed',r.status);return res.status(503).json({error:'jev_unavailable'})}const body:any=await r.json();
 const decisions=rows.map((row,i)=>{const a=body.answers?.[`row_${i}`]||{};const probabilities=a.probabilities||a.distribution||{};const modelPick=String(a.choice||'review');const winningProbability=Number(probabilities[modelPick]||0);const decision=winningProbability<0.60?'review':modelPick;return{id:row.id,rowHash:row.hash,decision,modelPick,winningProbability,policyOverride:decision!==modelPick?'LOW_PROBABILITY_REVIEW':null,probabilities,distributionConcentration:Number(a.confidence||0)}});
 const core={schema:'jev-lab-spreadsheet-trajectory-v1',policy,policyHash:sha(policy),rowCount:rows.length,model:String(body.model||'jev-1.13.0'),route:'direct-typesafe',decisions,usage:body.usage||{},latencyMs:Math.round(performance.now()-started),createdAt:new Date().toISOString()};
 return res.json({...core,evidence:{trajectorySha256:sha(core),replay:'Rejoin decisions to input rows by rowHash. Deterministic filters run in the browser before this trajectory and must be preserved in the downloaded bundle.'}})
}
