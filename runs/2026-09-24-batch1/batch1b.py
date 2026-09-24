import json, time, hashlib, urllib.request, statistics, sys
KEY=open('/tmp/.tsk').read().strip()
URL='https://api.typesafe.ai/v1/systemone'
def call(state, questions, tag):
    body=json.dumps({"model":"jev-1.13.0","state":state,"questions":questions}).encode()
    req=urllib.request.Request(URL,data=body,headers={"Authorization":"Bearer "+KEY,"Content-Type":"application/json"})
    t=time.time()
    try:
        with urllib.request.urlopen(req,timeout=30) as r:
            raw=r.read(); code=r.status; rid=r.headers.get('x-typesafe-request-id')
    except urllib.error.HTTPError as e:
        raw=e.read(); code=e.code; rid=e.headers.get('x-typesafe-request-id')
    ms=int((time.time()-t)*1000)
    rec={"tag":tag,"code":code,"ms":ms,"request_id":rid,"req_sha":hashlib.sha256(body).hexdigest(),"resp_sha":hashlib.sha256(raw).hexdigest(),"request":json.loads(body),"response":json.loads(raw or b'{}')}
    open('batch1b.jsonl','a').write(json.dumps(rec)+"\n")
    return rec
STATES=[
 "Help! My payouts have been failing for 3 days and I'm losing sales.",
 "Hi, could you tell me how to change the email on my invoices when you get a chance?",
 "I was charged twice for order A-104. Please refund the duplicate.",
 "Your API returns 500 on every POST to /orders since this morning. Production is down.",
 "Thinking about upgrading to the team plan next quarter - what does it cost for 12 seats?",
 "This is the third time I've asked. Nobody answers. I'm cancelling today unless someone calls me.",
 "Love the new dashboard, great work team!",
 "Webhook deliveries are delayed by about 10 minutes, not urgent but wanted to flag it.",
]
Q={
 "is_urgent":{"type":"noul","instructions":"Does this request require urgent attention?"},
 "department":{"type":"choice","instructions":"Which team should handle this?","criteria":{"billing":"Payments, invoicing, refunds","technical":"Bugs, outages, integrations","sales":"Pricing, upgrades, new accounts","none":"No action needed"}},
 "frustration":{"type":"score","instructions":"How frustrated is the customer?","criteria":["Calm or positive","Mildly concerned","Clearly frustrated","Angry","Furious, threatening to leave"]},
 "churn_risk":{"type":"noul","instructions":"Is the customer at risk of cancelling?"},
}
for i,s in enumerate(STATES):
    call(s,Q,f"batched:s{i}")
    call(s,{"frustration":Q["frustration"]},f"single:s{i}:frustration")
for i in (0,5):
    for r in range(5): call(STATES[i],Q,f"repeat:s{i}:r{r}")
print("done")
