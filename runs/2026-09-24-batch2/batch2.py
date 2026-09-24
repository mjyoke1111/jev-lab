import csv, json, random, time, hashlib, urllib.request
KEY=open('/tmp/.tsk').read().strip(); URL='https://api.typesafe.ai/v1/systemone'
LABELS={
 "card_arrival":"Asking where their new card is / it has not arrived yet",
 "card_delivery_estimate":"Asking how long card delivery takes in general",
 "lost_or_stolen_card":"Card is lost or stolen",
 "compromised_card":"Card details may be compromised or used fraudulently",
 "card_not_working":"Card does not work at all / is broken",
 "declined_card_payment":"A specific card payment was declined",
 "activate_my_card":"How to activate a card",
 "card_payment_fee_charged":"An unexpected fee was charged on a card payment",
}
rows=[r for r in csv.DictReader(open('b77_test.csv')) if r['category'] in LABELS]
random.seed(20260924)
sample=[]
for lab in LABELS:
    sample+=random.sample([r for r in rows if r['category']==lab],8)
random.shuffle(sample)
Q={"intent":{"type":"choice","instructions":"Which intent best matches this bank customer's message?","criteria":LABELS}}
out=open('batch2.jsonl','a')
for i,r in enumerate(sample):
    body=json.dumps({"model":"jev-1.13.0","state":r['text'],"questions":Q}).encode()
    req=urllib.request.Request(URL,data=body,headers={"Authorization":"Bearer "+KEY,"Content-Type":"application/json"})
    t=time.time()
    try:
        with urllib.request.urlopen(req,timeout=30) as resp: raw=resp.read(); code=resp.status; rid=resp.headers.get('x-typesafe-request-id')
    except urllib.error.HTTPError as e: raw=e.read(); code=e.code; rid=e.headers.get('x-typesafe-request-id')
    out.write(json.dumps({"i":i,"gold":r['category'],"code":code,"ms":int((time.time()-t)*1000),"request_id":rid,"req_sha":hashlib.sha256(body).hexdigest(),"resp_sha":hashlib.sha256(raw).hexdigest(),"request":json.loads(body),"response":json.loads(raw or b'{}')})+"\n")
    if i==0 and code!=200: print("first call failed",code,raw[:300]); break
print("done")
