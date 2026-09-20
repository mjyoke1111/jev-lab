"""Run the locked consistency set with Bespoke Nimble's official local scorer.

Run from a checkout of bespokelabsai/nimble, with that repo importable and the
merged model config produced by its documented download step.
"""
import argparse,json
from datetime import datetime,timezone
from pathlib import Path
from nimble.scoring.cuda_scorer import CudaCandidateScorer

def main():
 p=argparse.ArgumentParser();p.add_argument('--cases',default='harness/consistency/cases.json');p.add_argument('--model-config',required=True);p.add_argument('--out',default='harness/results/consistency-nimble.json');a=p.parse_args()
 protocol=json.loads(Path(a.cases).read_text());config=json.loads(Path(a.model_config).read_text());scorer=CudaCandidateScorer(**config);predictions=[]
 for case in protocol['cases']:
  result=scorer.score(case['context'],protocol['fields']);predictions.append({'id':case['id'],'fields':{name:{'value':field['value'],'scores':field['scores']} for name,field in result['fields'].items()},'telemetry':result['metrics']})
 artifact={'protocol':protocol['protocol'],'backend':'nimble','model':config['model_id'],'revision':config['revision'],'createdAt':datetime.now(timezone.utc).isoformat(),'predictions':predictions}
 out=Path(a.out);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(artifact,indent=2)+'\n');print(out)
if __name__=='__main__':main()
