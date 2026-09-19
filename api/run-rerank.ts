import type {VercelRequest,VercelResponse} from '@vercel/node';

const fixtures={
 leave:{id:'leave',query:'having a baby soon, how many weeks can I take off?',expected:'parental-leave',candidates:[
  {id:'annual-leave',title:'Annual leave',excerpt:'Four weeks of paid annual leave each year.'},
  {id:'parental-leave',title:'Parental leave entitlement',excerpt:'Birth parents may take up to 18 weeks paid leave, followed by unpaid leave.'},
  {id:'bereavement',title:'Bereavement leave',excerpt:'Paid time away after the death of an immediate family member.'},
  {id:'flex-work',title:'Flexible work requests',excerpt:'Eligible employees may request changed hours or work location.'},
  {id:'sick-leave',title:'Personal and carers leave',excerpt:'Paid absence for illness or caring responsibilities.'},
  {id:'jury-duty',title:'Community service leave',excerpt:'Leave for jury duty and emergency service activities.'}]},
 remote:{id:'remote',query:'can I work from another country for a couple of months?',expected:'international-remote',candidates:[
  {id:'hybrid',title:'Hybrid office schedule',excerpt:'Teams agree on two anchor days in the office.'},
  {id:'home-office',title:'Home office equipment',excerpt:'Allowance and security requirements for a home workspace.'},
  {id:'international-remote',title:'International remote work',excerpt:'Approval, tax and security rules for working outside your employing country.'},
  {id:'travel',title:'Business travel',excerpt:'Booking and expense policy for company travel.'},
  {id:'relocation',title:'Permanent relocation',excerpt:'Support for employees changing their primary work location.'},
  {id:'vpn',title:'Remote access and VPN',excerpt:'How to connect securely to internal systems.'}]},
 incident:{id:'incident',query:'a customer says their card was charged twice',expected:'duplicate-charge',candidates:[
  {id:'refunds',title:'General refunds',excerpt:'Standard refund windows and eligibility.'},
  {id:'duplicate-charge',title:'Duplicate card charge',excerpt:'Verify settlement status, preserve both transaction ids, and route duplicate captures.'},
  {id:'fraud',title:'Card fraud report',excerpt:'Handle transactions the customer does not recognize.'},
  {id:'pending',title:'Pending authorization',excerpt:'Explain temporary card holds that have not settled.'},
  {id:'invoice',title:'Invoice correction',excerpt:'Fix legal entity, address or tax details on an invoice.'},
  {id:'payment-failed',title:'Failed payment',excerpt:'Troubleshoot declined or incomplete payments.'}]}
} as const;

type Fixture=(typeof fixtures)[keyof typeof fixtures];
export default async function handler(req:VercelRequest,res:VercelResponse){
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 res.setHeader('Cache-Control','no-store');
 const id=typeof req.body?.fixtureId==='string'?req.body.fixtureId:'';
 const f=(fixtures as Record<string,Fixture>)[id];if(!f)return res.status(400).json({error:'unknown_fixture'});
 const key=process.env.TYPESAFE_API_KEY;if(!key)return res.status(503).json({error:'jev_not_configured'});
 const started=performance.now();
 const r=await fetch('https://api.typesafe.ai/v1/systemone',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'jev-latest',state:{query:f.query,candidates:f.candidates},questions:{best:{type:'choice',instructions:'Which candidate best answers the query? Choose only from the supplied candidate ids.',criteria:Object.fromEntries(f.candidates.map(c=>[c.id,`${c.title}: ${c.excerpt}`]))}}})});
 if(!r.ok){console.error('rerank_jev_failed',r.status,(await r.text()).slice(0,500));return res.status(503).json({error:'jev_unavailable'})}
 const b:any=await r.json();const latencyMs=Math.round(performance.now()-started);const pick=String(b.answers?.best?.choice||'');const probs=b.answers?.best?.probabilities||b.answers?.best?.distribution||{};const inputTokens=Number(b.usage?.input_tokens||0);const costUsd=inputTokens*0.042/1_000_000;
 return res.json({runId:`rerank_${Date.now()}`,createdAt:new Date().toISOString(),fixture:{id:f.id,query:f.query,expected:f.expected,candidates:f.candidates},decision:{pick,correct:pick===f.expected,confidence:Number(b.answers?.best?.confidence||probs[pick]||0),probabilities:probs},telemetry:{latencyMs,inputTokens,outputTokens:Number(b.usage?.output_tokens||0),costUsd,requests:1,model:String(b.model||'jev-latest'),route:'direct-typesafe'},limits:['three authored fixtures','one live call is not a benchmark','cost uses the console-listed $0.042 per million input tokens; output is free','candidate retrieval is frozen; this experiment measures only reranking']});
}
