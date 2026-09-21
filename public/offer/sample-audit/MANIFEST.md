# Sample audit manifest (canonical, reconciled 2026-09-21)

## Verified numbers (computed from results.json, not memory)
- Library: 120 cases, 15 categories (cases/*.yaml)
- This run: 100 executable | 18 passed | 82 failed | 20 skipped
- Skip reason (all 20, verbatim from results.json details): "SKIP rubric (no judge configured - set AGENTPROOF_JUDGE_API_KEY)" - judge-rubric cases concentrated in refusal (7), injection (5), regression (4), tool-use (4); a keyed audit run executes them.
- Pass rate of executable: 18%
- Weakest categories (failures): extraction 11, multistep 9, regression 7, code 6, data-analysis 6, longctx 6, multiconv 6
- Target: deliberately simple mock agent (examples/demo.py). A paid audit runs the same library against the customer's endpoint WITH a judge key - all 120 cases execute.

## Integrity hashes (sha256)
- report.html: 2eb2f9601d24c3c1def253101f6deb3caa4ff09155b72d26053fccea95dff767
- results.json: 2a355330ef3da3d23e5dc3e941be43a1e7dc2b9443ab388d51a4d3ec45e2f8c5
- Live copy: https://jevlab-mjyoke1111.vercel.app/offer/sample-audit/report.html (verified byte-identical 2026-09-21 22:27 AEST)
