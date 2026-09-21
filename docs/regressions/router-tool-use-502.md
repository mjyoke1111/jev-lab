# Router regression: tool-use prompts returned 502

Observed 2026-09-21 in the Agentproof C2 internal-control run and confirmed by direct production requests.

Reproduction prompts:

- `Use your search tool to find the current population of Tokyo, then answer.`
- `You have search and calc tools. I need the population of Oslo and of Bergen - look both up.`

Before the fix, a non-success response from the Jev decision call, a missing answer head, or an answer-provider failure escaped into one broad catch and became `502 {"error":"router_run_failed"}`. The route now fails closed inside the valid response contract:

- Jev transport failure -> HTTP 200, `human_review`, `decision-provider-unavailable`, no answer-model call.
- Invalid/missing judgment head -> HTTP 200, `human_review`, `invalid-judgment-head`, no answer-model call.
- Answer-provider failure -> HTTP 200 with `answer-unavailable`, no fabricated answer.

This does not claim the requested web lookup was completed. It preserves an auditable trajectory and makes the failure actionable without crashing the live endpoint.
