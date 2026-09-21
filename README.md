# Jev Agent Safety Arena

A small, reproducible browser-agent safety harness. A configurable generative model proposes actions. Jev (`typesafe-ai/jev` through Vercel AI Gateway) selects the next action and makes a separate typed safety judgment. Playwright supplies fixed benign and prompt-injected pages. The dashboard reads only completed run artifacts.

## What is real

- The harness makes live model calls. It stops if credentials are missing.
- `public/runs/latest.json` is created only after a completed run. The repository does not ship sample benchmark numbers.
- Latency is measured around provider requests. Token usage comes from provider response metadata.
- Cost is computed only from price variables you set. If prices are left blank, cost is recorded as zero, not estimated.
- The baseline runs the same goal and page through the configured mini model. Its confidence is recorded as zero because generic chat completions do not expose calibrated confidence.

This is a small evaluation fixture, not proof that any model is secure in production.

## Setup

Requirements: Node 20+, npm, and a Chromium browser installed by Playwright.

```bash
npm install
npx playwright install chromium
cp .env.example .env
# add your key and current provider prices
npm run harness:preflight
npm run harness
npm run dev
```

Open the URL printed by Vite. Use the Jev / Mini baseline toggle to compare only the latest completed run.

## Credentials

Required:

- `AI_GATEWAY_API_KEY`: Vercel AI Gateway key with access to both configured models.
- `JEV_MODEL`: defaults to `typesafe-ai/jev`.
- `PLANNER_MODEL`: a cheap generative model available through the gateway.
- `BASELINE_MODEL`: usually the same mini model as the planner.

No key is bundled. Never commit `.env`.

## Reproduce and inspect

Each run launches a local HTTP server for `harness/pages`, opens every case with Playwright, sends page text plus a constrained action set to the models, evaluates the decisions, and writes:

- Immutable artifact: `harness/results/run_<timestamp>.json`
- Dashboard artifact: `public/runs/latest.json`

Add cases in `harness/pages` and register their goal and expected safety outcome in `harness/src/cases.ts`. Results are intentionally ignored by git so a benchmark cannot be mistaken for a shipped claim.

## Cost notes

Set the four `*_USD_PER_MILLION` values from current provider pricing before a run. A case currently uses one planner call, two Jev calls, and one baseline call. Actual usage varies with page length and model output. Start with the four fixed cases, inspect the artifact, then expand deliberately.

## Static deployment

```bash
npm run build
```

Deploy `dist/` as a static site. Generate `public/runs/latest.json` before the build when you want the dashboard to include a verified run. Without it, the dashboard shows an explicit "No run data yet" state.

## Safety constraints

The harness exposes a constrained action vocabulary. It does not read local secrets or execute arbitrary page instructions. The injected pages are inert local fixtures. For higher-stakes research, isolate the browser and use synthetic credentials.

## Project layout

- `src/`: static React dashboard
- `harness/src/`: model gateway, typed schemas, runner, local server
- `harness/pages/`: fixed benign and injected fixtures
- `public/runs/`: completed artifact loaded by the UI

## Run the hosted evaluation

The Vercel deployment includes `POST /api/run-evaluation`. It runs the same fixed two-benign/two-injection suite from server-side fixture text, using the deployment's secrets. It never writes benchmark data into the site automatically. Save the returned JSON as `public/runs/latest.json`, review it, then rebuild and deploy the static dashboard.

Required Vercel environment variables:

- `AI_GATEWAY_API_KEY`: Vercel AI Gateway key.
- `ARENA_RUN_SECRET`: a long random shared secret used only to authorize evaluation runs.
- Model and price variables from `.env.example` as applicable.

Call it with the secret in a header, not in the URL:

```bash
curl -fsS -X POST \
  -H "x-arena-run-secret: $ARENA_RUN_SECRET" \
  https://YOUR-DEPLOYMENT.example/api/run-evaluation \
  > public/runs/latest.json
```

The endpoint fails closed when either required secret is absent and rejects missing or incorrect run secrets. It uses the account plan’s standard AI Gateway data handling and does not request Zero Data Retention, which is limited to Pro and Enterprise plans. Each request is bounded to four fixed cases, four provider calls per case, at most 220 output tokens per provider call, and 4,000 fixture characters. It returns a generic failure response rather than provider details. Public visitors cannot trigger a run without the shared secret.

### Direct Jev provider fallback

New direct TypeSafe runs pin the concrete catalog id `jev-1.13.0`; floating aliases are not used in executable routes. Historical artifacts keep the model label they actually ran. Re-check the catalog and behavioral contract before changing this pin.

Set `TYPESAFE_API_KEY` from the TypeSafe console to route only Jev choice and safety calls through `POST https://api.typesafe.ai/v1/systemone` with concrete model `jev-1.13.0`. Planner and baseline calls still use Vercel AI Gateway. When the key is absent, Jev falls back to `typesafe-ai/jev` through AI Gateway. The run JSON records `jevRoute`.

### Direct Groq planner and baseline

Set `GROQ_API_KEY` to route planner and baseline calls to Groq's OpenAI-compatible `https://api.groq.com/openai/v1/chat/completions`. `GROQ_MODEL` defaults to `openai/gpt-oss-20b`. The direct route uses Groq JSON Object mode, 2,048 completion tokens, low reasoning effort, and includes the exact schema in the system prompt; Zod validates every returned object before it can enter a run artifact. If the Groq key is absent, these calls fall back to Vercel AI Gateway. The run JSON records `plannerRoute`.

## Independent Jev evidence used in the Lab

Architecture choices in the Lab are informed by independent sources, but their measurements are not presented as this repository's results:

- [aitejiu capability map](https://dev.to/aitejiu/benchmarking-jev-what-a-decision-model-can-and-cant-do-in-an-agent-harness-20po): 10 datasets, about 22.5k calls and $2.19 reported spend. The author reports perfect InjecAgent precision/recall at a 0.10 threshold on 1,105 cases, but weak trajectory-failure attribution (AUROC 0.560), a Korean-vs-English retrieval gap, a 255-option cap, about 32k shared context and text-only input. Their strongest engineering results came from decomposing judgments and composing them in deterministic code.
- [hao_kang 100+ repository pattern catalogue](https://dev.to/hao_kang_82922526dfe5d934/we-read-100-jev-repositories-the-best-part-was-the-code-around-the-model-call-am3): routing first, action and target in one request, semantic grep, explicit fail-open/fail-closed behavior, and "code first, JEV second, LLM last."

These sources support the Lab's architecture and test design. They do not validate any individual live run here. Published Lab numbers always come from the attached replay artifact for that run.

- [Sam Reghenzi migration benchmark](https://blog.r6i.it/typesafe-jev-vs-agentic-loop.html): a product-taxonomy migration from a GPT-5.2 agentic loop to typed Choice. The headline mean latency fell 9.62s to 1.38s, but the author correctly flags a five-thread old run versus a sequential new run. The stronger concurrency-independent comparison is per-call latency: 1.30s versus 0.43s. Calls fell 56% and total tokens 36%, while output tokens rose 383% because every Choice returns a full probability distribution. That is an economic caveat if output pricing ever exceeds input pricing. A speculative-fan-out A/B produced identical results across all eight paths, a useful direct test of question independence that the Lab should reproduce. The old agentic loop still had a backtracking advantage: judge/restart could catch a misclassification that a forward-only descent cannot. On out-of-taxonomy input, Jev was fastest partly because nothing restarted it - fast wrong answers are not a success.
