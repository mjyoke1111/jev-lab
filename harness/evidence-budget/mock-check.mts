// Control-flow and validation checks with a stubbed Jev. NOT Jev evidence.
// Run: npx tsx harness/evidence-budget/mock-check.mts   (writes harness/evidence-budget/mock-run.json for layout captures)
import{writeFileSync}from'node:fs';import handler,{allow,limiterSize}from'../../api/_evidence-budget.ts';
process.env.TYPESAFE_API_KEY='mock';process.env.EVIDENCE_BUDGET_LIVE='1';let ipn=0;
const call=async(body:any,method='POST')=>{let out:any={};const res:any={status(c:number){out.code=c;return res},json(j:any){out.body=j;return res},setHeader(){}};await handler({method,body,headers:{'x-vercel-forwarded-for':`10.0.0.${++ipn}`},socket:{}} as any,res);return out};
const levels=(lv:number)=>({type:'score',score:lv,probabilities:Object.fromEntries([0,1,2,3].map(i=>[String(i),i===Math.round(lv)?1:0]))});
type Stub={score?:(text:string)=>any;enough?:(round:number)=>any;view?:()=>any;fail?:'http'|'timeout'};
const stub=(s:Stub)=>{let round=0;(globalThis as any).fetch=async(_u:string,init:any)=>{round++;if(s.fail==='http')return{ok:false,status:503};if(s.fail==='timeout'){const e:any=Error('t');e.name='TimeoutError';throw e}const b=JSON.parse(init.body);const ans:any={enough:s.enough?s.enough(round):{choice:'more',probabilities:{enough:.1,more:.9}},view:s.view?s.view():{choice:'causal',probabilities:{causal:.6,semantic:.2,temporal:.1,entity:.1}}};Object.keys(b.questions).filter(k=>/^c\d/.test(k)).forEach(k=>{ans[k]=(s.score||(()=>levels(0)))(b.questions[k].instructions)});return{ok:true,json:async()=>({answers:ans,model:'MOCK-not-jev',usage:{input_tokens:400}})}}};
const Q='When does Harbor launch now, and why did the date change?';let n=0;const results:any[]=[];
const expect=async(name:string,s:Stub,want:{stop:string,complete:boolean,q?:string})=>{stub(s);const r=await call({question:n++===0?Q:(want.q||Q)+` [t${n}]`});const o=r.body.outcome;const pass=o.stopReason===want.stop&&o.complete===want.complete;results.push(pass);console.log(pass?'PASS':'FAIL',name.padEnd(34),o.stopReason.padEnd(34),'complete',o.complete,'kept',o.evidencePacket.map((x:any)=>x.id).join(',')||'-');return r.body};
const g=await call(undefined,'GET');console.log('GET',g.code,g.body.memory.length,'notes cohort',g.body.cohortSha256.slice(0,12));console.log('400 short question',(await call({question:'hi'})).code);
const good=await expect('stop on validated enough',{score:t=>levels(/October 6/.test(t)?3:0),enough:r=>({choice:r>=2?'enough':'more',probabilities:r>=2?{enough:.88,more:.12}:{enough:.21,more:.79}})},{stop:'controller_enough',complete:true});
await expect('background-only never kept',{score:()=>levels(1),enough:()=>({choice:'enough',probabilities:{enough:.95,more:.05}})},{stop:'graph_exhausted',complete:false});
await expect('never enough, links run out',{score:t=>levels(/Harbor/.test(t)?3:0)},{stop:'graph_exhausted',complete:false});
await expect('never enough, kept-note cap',{score:()=>levels(3),view:()=>({choice:'temporal',probabilities:{temporal:.7,semantic:.1,causal:.1,entity:.1}})},{stop:'kept_cap',complete:false});
await expect('score 9 out of range',{score:()=>({score:9})},{stop:'invalid_score_fail_closed',complete:false});
await expect('score -3 out of range',{score:()=>({score:-3})},{stop:'invalid_score_fail_closed',complete:false});
await expect('score missing',{score:()=>({})},{stop:'invalid_score_fail_closed',complete:false});
await expect('pEnough 5',{score:()=>levels(3),enough:()=>({choice:'enough',probabilities:{enough:5,more:0}})},{stop:'invalid_enough_fail_closed',complete:false});
await expect('choice-only enough',{score:()=>levels(3),enough:()=>({choice:'enough'})},{stop:'invalid_enough_fail_closed',complete:false});
await expect('bad view choice',{score:t=>levels(/October 6/.test(t)?3:0),view:()=>({choice:'vibes',probabilities:{semantic:.25,temporal:.25,causal:.25,entity:.25}})},{stop:'invalid_view_fail_closed',complete:false});
const mm=await expect('score/probability mismatch recorded',{score:t=>/October 6/.test(t)?{score:3,probabilities:{0:1,1:0,2:0,3:0}}:levels(0),enough:()=>({choice:'enough',probabilities:{enough:.9,more:.1}})},{stop:'controller_enough',complete:true});{const m=mm.rounds.flatMap((r:any)=>r.scores).some((x:any)=>x.mismatch);console.log(m?'PASS':'FAIL','mismatch flag present in receipt');results.push(m)}
await expect('probabilities-only score path',{score:t=>({probabilities:/October 6/.test(t)?{0:0,1:0,2:.2,3:.8}:{0:.9,1:.1,2:0,3:0}}),enough:()=>({choice:'enough',probabilities:{enough:.9,more:.1}})},{stop:'controller_enough',complete:true});
await expect('jev http 503',{fail:'http'},{stop:'controller_unavailable_fail_closed',complete:false});
await expect('jev timeout',{fail:'timeout'},{stop:'controller_unavailable_fail_closed',complete:false});
const firstOnly=(t:string)=>{const id=(t.match(/note (m[0-9]+)/)||[])[1];return levels(['m01','m02','m03','m04'].includes(id)?3:0)};
await expect('round cap (one new keep per round)',{score:firstOnly,view:()=>({choice:'temporal',probabilities:{temporal:.7,semantic:.1,causal:.1,entity:.1}})},{stop:'round_cap',complete:false});
process.env.EVIDENCE_BUDGET_MAX_TOKENS='600';await expect('per-request token ceiling',{score:t=>levels(/Harbor/.test(t)?3:0)},{stop:'token_ceiling',complete:false});delete process.env.EVIDENCE_BUDGET_MAX_TOKENS;
await expect('no seed match',{},{stop:'no_seed_match',complete:false,q:'Zebra quantum xylophone?'});
stub({score:()=>levels(3),enough:()=>({choice:'enough',probabilities:{enough:.9,more:.1}})});const a=await call({question:'Is the Harbor security blocker resolved, and what fixed it?'});const b=await call({question:'Is the Harbor security blocker resolved, and what fixed it?'});console.log(b.body.cached===true&&a.body.evidence.replayCoreSha256===b.body.evidence.replayCoreSha256?'PASS':'FAIL','cache returns identical receipt, cached:true');results.push(b.body.cached===true);
const lim=async(headers:any,q:string)=>{let code=0;const res:any={status(c:number){code=c;return res},json(){return res},setHeader(){}};await handler({method:'POST',body:{question:q},headers,socket:{}} as any,res);return code};
let limited=0;for(let i=0;i<8;i++)if(await lim({'x-vercel-forwarded-for':'9.9.9.9'},`Who covers Harbor decisions ${i}?`)===429)limited++;console.log(limited===2?'PASS':'FAIL','per-client limit: 6 allowed, 2 rejected ->',limited);results.push(limited===2);
let spoof=0;for(let i=0;i<8;i++)if(await lim({'x-vercel-forwarded-for':'8.8.8.8','x-forwarded-for':`1.2.3.${i}`},`Who owns Harbor launch ${i}?`)===429)spoof++;console.log(spoof===2?'PASS':'FAIL','rotating x-forwarded-for does not bypass x-vercel-forwarded-for ->',spoof,'rejected');results.push(spoof===2);
const before=limiterSize();allow('evict-probe',Date.now()+2*3600e3);const after=limiterSize();console.log(after===1?'PASS':'FAIL',`stale limiter entries evicted: ${before} -> ${after}`);results.push(after===1);
process.env.EVIDENCE_BUDGET_LIVE='0';const off=await lim({'x-vercel-forwarded-for':'7.7.7.7'},'Kill switch Harbor question?');console.log(off===503?'PASS':'FAIL','kill switch off -> 503, no Jev call');results.push(off===503);process.env.EVIDENCE_BUDGET_LIVE='1';
writeFileSync(new URL('./mock-run.json',import.meta.url),JSON.stringify({cohort:g.body,run:good},null,1));
console.log(`${results.filter(Boolean).length}/${results.length} checks pass`);if(results.some(x=>!x))process.exit(1);
