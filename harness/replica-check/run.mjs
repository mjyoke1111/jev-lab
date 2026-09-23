// Replica check: replays the exact Challenge Lab request (same state + questions that were sent to hosted Jev)
// against a local Jev-compatible replica, then compares with the recorded REAL Jev receipts.
// No hosted Jev calls. Replica output is REPLICA - not Jev.
// Usage: node harness/replica-check/run.mjs --endpoint http://127.0.0.1:8090 --label qwen3-4b-q4km --out harness/replica-check/results/x.json [--meta meta.json]
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {createHash} from 'node:crypto';import {dirname} from 'node:path';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:undefined};
const endpoint=arg('endpoint')||'http://127.0.0.1:8090',label=arg('label'),out=arg('out'),metaPath=arg('meta');
if(!label||!out){console.error('need --label and --out');process.exit(2)}
const sha=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const here=new URL('.',import.meta.url);const root=new URL('../../',import.meta.url);
const cohort=JSON.parse(readFileSync(new URL('cohort.json',here),'utf8'));
const receiptsRaw=readFileSync(new URL('public/runs/challenge-lab-recorded.json',root),'utf8');const receipts=JSON.parse(receiptsRaw);
const packs=[];
for(const id of ['support','inbox']){const pack=cohort.packs[id],rec=receipts[id];
  const cohortSha256=sha({pack:id,criteria:pack.criteria,cases:pack.cases});
  if(cohortSha256!==rec.cohortSha256)throw Error(`cohort hash mismatch for ${id}: refusing to compare`);
  // Identical to api/run-challenge-lab.ts request body (model name is ignored by the replica).
  const questions=Object.fromEntries(pack.cases.map(x=>[x[0],{type:'choice',instructions:`Classify this item for the ${pack.title} task: ${x[1]}`,criteria:pack.criteria}]));
  const body={model:'jev-1.13.0',state:{task:pack.title,items:pack.cases.map(x=>({id:x[0],text:x[1]}))},questions};
  const t0=performance.now();const r=await fetch(endpoint.replace(/\/$/,'')+'/v1/systemone',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer local'},body:JSON.stringify(body)});
  const latencyMs=Math.round(performance.now()-t0);if(!r.ok)throw Error(`replica ${r.status}: ${await r.text()}`);
  const resp=await r.json();const labels=Object.keys(pack.criteria);
  const rows=pack.cases.map(x=>{const a=resp.answers?.[x[0]];if(!a||!a.probabilities)throw Error(`missing replica answer ${x[0]}`);
    const j=rec.results.find(y=>y.id===x[0]);if(!j)throw Error(`missing Jev receipt row ${x[0]}`);
    const norm=p=>{const s=labels.reduce((t,l)=>t+Number(p[l]||0),0);return Object.fromEntries(labels.map(l=>[l,s>0?Number(p[l]||0)/s:0]))};
    const rp=norm(a.probabilities),jp=norm(j.jev.probabilities);
    const brier=p=>labels.reduce((t,l)=>t+(p[l]-(l===x[2]?1:0))**2,0);
    const tv=labels.reduce((t,l)=>t+Math.abs(rp[l]-jp[l]),0)/2;
    return {id:x[0],text:x[1],expected:x[2],jev:{choice:j.jev.choice,probabilities:jp,correct:j.jev.choice===x[2],brier:brier(jp)},replica:{choice:a.choice,probabilities:rp,confidence:a.confidence??null,correct:a.choice===x[2],brier:brier(rp)},agree:a.choice===j.jev.choice,totalVariation:tv}});
  packs.push({pack:id,title:pack.title,cohortSha256,jevReceipt:{model:rec.model,createdAt:rec.createdAt,runSha256:rec.evidence?.runSha256},request:{sha256:sha(body)},replicaResponseSha256:sha(resp),replicaUsage:resp.usage??null,latencyMs,rows});}
const all=packs.flatMap(p=>p.rows),n=all.length,mean=f=>all.reduce((t,r)=>t+f(r),0)/n;
const summary={cases:n,jevCorrect:all.filter(r=>r.jev.correct).length,replicaCorrect:all.filter(r=>r.replica.correct).length,agreement:all.filter(r=>r.agree).length,meanBrierJev:+mean(r=>r.jev.brier).toFixed(4),meanBrierReplica:+mean(r=>r.replica.brier).toFixed(4),meanTotalVariation:+mean(r=>r.totalVariation).toFixed(4),replicaLatencyMsPerRequest:packs.map(p=>p.latencyMs)};
const meta=metaPath?JSON.parse(readFileSync(metaPath,'utf8')):{};
const core={schema:'jev-replica-check-v1',label:'REPLICA - not Jev',replica:{name:label,engine:'yijunyu/jev-rs',...meta},jevSide:'Recorded real Jev receipts (public/runs/challenge-lab-recorded.json), replayed. No hosted Jev call in this run.',receiptsFileSha256:sha(receiptsRaw),cohortFileSha256:sha(readFileSync(new URL('cohort.json',here),'utf8')),runnerSha256:sha(readFileSync(new URL('run.mjs',here),'utf8')),createdAt:new Date().toISOString(),caveats:['12 cases in 2 packs: a sanity comparison, not a benchmark.','Replica outputs come from an open model through a Jev-compatible wrapper. They say nothing about hosted Jev quality or speed.','Jev latency is not compared: receipts hold one end-to-end hosted request per pack, measured on different hardware and network.'],summary,packs};
const artifact={...core,artifactSha256:sha(core)};mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(artifact,null,1)+'\n');
console.log(JSON.stringify({out,...summary}));
