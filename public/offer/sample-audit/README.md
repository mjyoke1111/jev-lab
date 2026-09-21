# Sample audit - what an Agent Eval Audit delivers

This folder is a real agentproof run against a deliberately simple mock
agent (the same mock in `examples/demo.py`). A paid audit runs the same
way against YOUR agent's endpoint.

## What the run found

- 100 executable cases, 82 failures (18% pass rate)
- Weakest categories: extraction/JSON formatting (11 failures),
  regression (7), code (6), data analysis (6), long context (6),
  multi-turn (6), multilingual (6)
- Every failure includes the case, the expected check, and what the
  agent actually returned

## What a $149 audit adds on top of this report

1. A prioritized failure list: which categories fail, ranked by user
   impact, with the exact prompts that expose them
2. A CI gate wired into your repo (GitHub Actions template included)
   so the failures can't silently come back
3. A 30-minute async Q&A over email about the findings

Delivery: 48h from receiving your endpoint URL. You get the HTML report
(like `report.html` here), the raw JSON, and the prioritized summary.
