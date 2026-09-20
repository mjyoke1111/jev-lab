"""Preregistered Laya-only absolute-choice vs tournament experiment."""
import argparse,hashlib,json,random,time
from datetime import datetime,timezone
from pathlib import Path
import laya

DISTRACTORS=[
 "Annual leave balance and accrual", "Bereavement leave", "Flexible office schedule", "Sick and carer leave", "Jury duty leave", "Home office equipment", "Hybrid office attendance", "Business travel booking", "Permanent relocation", "VPN troubleshooting", "General refund policy", "Card fraud report", "Pending card authorization", "Invoice detail correction", "Failed payment troubleshooting", "Expense reimbursement", "Payroll calendar", "Benefits enrollment", "Performance review cycle", "Data retention policy", "Password reset", "Account cancellation", "Shipping delay", "Tax invoice download", "Vendor onboarding", "Procurement approval", "Accessibility request", "Security incident report", "Service status", "Subscription upgrade", "Discount eligibility", "Contract renewal"
]

def corpus(fixture,count):
 items=[{"id":fixture["expectedId"],"description":fixture["expectedDescription"]}]
 for i in range(count-1):
  topic=DISTRACTORS[i%len(DISTRACTORS)]
  cycle=i//len(DISTRACTORS)+1
  items.append({"id":f"d{i+1:03d}","description":f"{topic}, reference section {cycle}: {fixture['distractorTopic']}."})
 return items

def choose(agent,query,items):
 criteria={x['id']:x['description'] for x in items};started=time.perf_counter()
 result=agent.predict({"query":query},{"best":{"type":"choice","instructions":"Which candidate directly and specifically answers the query?","criteria":criteria}})
 answer=result['answers']['best'];probs=answer['probabilities'];ordered=sorted(probs.items(),key=lambda x:x[1],reverse=True)
 return {"winner":answer['choice'],"probabilities":probs,"margin":ordered[0][1]-ordered[1][1] if len(ordered)>1 else 1.0,"latencyMs":round((time.perf_counter()-started)*1000),"usage":result.get('usage')}

def tournament(agent,query,items,group_size,seed):
 shuffled=items[:];random.Random(seed).shuffle(shuffled);rounds=[];calls=0;scored=0;started=time.perf_counter()
 while len(shuffled)>1:
  winners=[];groups=[]
  for offset in range(0,len(shuffled),group_size):
   group=shuffled[offset:offset+group_size]
   if len(group)==1: result={"winner":group[0]['id'],"probabilities":{group[0]['id']:1.0},"margin":1.0,"latencyMs":0,"usage":None,"bye":True}
   else: result=choose(agent,query,group);calls+=1;scored+=len(group)
   winners.append(next(x for x in group if x['id']==result['winner']));groups.append({"candidateIds":[x['id'] for x in group],**result})
  rounds.append(groups);shuffled=winners
 return {"winner":shuffled[0]['id'],"calls":calls,"candidatesScored":scored,"wallTimeMs":round((time.perf_counter()-started)*1000),"rounds":rounds}

def main():
 p=argparse.ArgumentParser();p.add_argument('--protocol',default='harness/tournament/protocol.json');p.add_argument('--model',default='convaiinnovations/laya');p.add_argument('--out',default='harness/results/tournament-laya.json');a=p.parse_args()
 raw=Path(a.protocol).read_bytes();protocol=json.loads(raw);agent=laya.load(a.model,device='cpu');runs=[]
 for fixture in protocol['fixtures']:
  for count in protocol['candidateCounts']:
   items=corpus(fixture,count);absolute=choose(agent,fixture['query'],items);absolute.update({'calls':1,'candidatesScored':count,'correct':absolute['winner']==fixture['expectedId']})
   brackets=[]
   for seed in protocol['tournament']['seeds']:
    row=tournament(agent,fixture['query'],items,protocol['tournament']['groupSize'],seed);row.update({'seed':seed,'correct':row['winner']==fixture['expectedId']});brackets.append(row)
   runs.append({'fixtureId':fixture['id'],'expectedId':fixture['expectedId'],'candidateCount':count,'corpusSha256':hashlib.sha256(json.dumps(items,sort_keys=True).encode()).hexdigest(),'absolute':absolute,'tournaments':brackets})
 summary=[]
 for count in protocol['candidateCounts']:
  rows=[x for x in runs if x['candidateCount']==count];all_t=[t for x in rows for t in x['tournaments']]
  summary.append({'candidateCount':count,'fixtures':len(rows),'absoluteTop1Accuracy':sum(x['absolute']['correct'] for x in rows)/len(rows),'tournamentTop1Accuracy':sum(x['correct'] for x in all_t)/len(all_t),'winnerStabilityAcrossSeeds':sum(len({t['winner'] for t in x['tournaments']})==1 for x in rows)/len(rows),'absoluteCalls':sum(x['absolute']['calls'] for x in rows),'tournamentCalls':sum(t['calls'] for t in all_t),'absoluteCandidatesScored':sum(x['absolute']['candidatesScored'] for x in rows),'tournamentCandidatesScored':sum(t['candidatesScored'] for t in all_t)})
 artifact={'protocol':protocol['protocol'],'status':'review-only','backend':'laya-cpu','model':a.model,'createdAt':datetime.now(timezone.utc).isoformat(),'protocolSha256':hashlib.sha256(raw).hexdigest(),'runtime':{'device':'cpu','layaVersion':getattr(laya,'__version__','unknown')},'summary':summary,'runs':runs}
 out=Path(a.out);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(artifact,indent=2)+'\n');print(out)
if __name__=='__main__':main()
