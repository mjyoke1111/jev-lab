"""Run the locked dependent-decision set with Laya on CPU.

Laya's published card says the root checkpoint is near chance zero-shot on its
own typed-decisions benchmark and ships over-confident. This runner preserves
its probabilities as model output, not calibrated truth. The shared evaluator
keeps Brier/ECE withheld until the protocol has at least 50 locked labels.
"""
import argparse,json,time
from datetime import datetime,timezone
from pathlib import Path
import laya

def laya_schema(fields):
 out={}
 for name,field in fields.items():
  if field['type']=='boolean': out[name]={'type':'noul','instructions':field['description']}
  else: out[name]={'type':'choice','instructions':field['description'],'criteria':field.get('choice_descriptions') or {c:c for c in field['choices']}}
 return out

def main():
 p=argparse.ArgumentParser();p.add_argument('--cases',default='harness/consistency/cases.json');p.add_argument('--model',default='convaiinnovations/laya');p.add_argument('--subfolder');p.add_argument('--out',default='harness/results/consistency-laya.json');a=p.parse_args()
 protocol=json.loads(Path(a.cases).read_text());agent=laya.load(a.model,device='cpu',subfolder=a.subfolder);schema=laya_schema(protocol['fields']);predictions=[]
 for case in protocol['cases']:
  started=time.perf_counter();result=agent.predict(case['context'],schema);fields={}
  for name,field in protocol['fields'].items():
   answer=result['answers'][name]
   if field['type']=='boolean':
    probability=float(answer['noul']);fields[name]={'value':probability>=.5,'scores':{'false':1-probability,'true':probability}}
   else: fields[name]={'value':answer['choice'],'scores':answer['probabilities']}
  predictions.append({'id':case['id'],'fields':fields,'telemetry':{'latencyMs':round((time.perf_counter()-started)*1000),'usage':result.get('usage')}})
 artifact={'protocol':protocol['protocol'],'backend':'laya-cpu','model':a.model,'subfolder':a.subfolder,'layaVersion':getattr(laya,'__version__','unknown'),'createdAt':datetime.now(timezone.utc).isoformat(),'runtime':{'device':'cpu','probabilityCaveat':'Laya probabilities are preserved but not assumed calibrated.'},'predictions':predictions}
 out=Path(a.out);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(artifact,indent=2)+'\n');print(out)
if __name__=='__main__':main()
