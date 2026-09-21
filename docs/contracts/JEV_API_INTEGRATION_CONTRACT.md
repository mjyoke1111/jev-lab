# Jev direct API integration contract

Verified against the Jev Lab router and Parkour Director integrations on 21 September 2026.

## Endpoint and authentication

- Method and endpoint: `POST https://api.typesafe.ai/v1/systemone`
- Authentication: `Authorization: Bearer <API key>`
- Content type: `application/json`
- Runtime secret variable: `TYPESAFE_API_KEY`
- The key stays in the existing secret store / deployment environment. Never commit, log, paste, or attach it.

## Request contract

The working direct route sends:

```json
{
  "model": "jev-1.13.0",
  "state": {},
  "questions": {}
}
```

`state` is text or structured JSON. `questions` is keyed by caller-defined question IDs. Jev Lab uses typed `choice` questions with instructions and named criteria. Executable Jev Lab routes pin the concrete catalog ID `jev-1.13.0`; they do not use floating aliases.

Route naming in Jev Lab evidence:

- Direct TypeSafe route: `direct-typesafe`
- Concrete model: use the response's `model`, falling back to the requested `jev-1.13.0` only if the provider omits it.
- Historical artifacts retain the model and route that actually ran.

## Response and evidence fields

The provider response includes:

- `model`: model that evaluated the request
- `answers`: one typed answer per input question, under the same question ID
- Choice answers: selected choice plus probability distribution and confidence when returned
- `usage.input_tokens`
- `usage.output_tokens`

Latency and cost are integration-side fields, not assumed provider response fields:

- Measure wall-clock provider latency around the HTTP request and record it as `latencyMs` or the route-specific latency field.
- Current public price: **$0.042 per million input tokens; output tokens free**.
- Compute estimated Jev cost from provider-reported input tokens and the price snapshot stored in the artifact.
- Router and Parkour evidence must record the exact model, route, latency, token counts, price snapshot / estimated cost, and trajectory hash.

## Limits and failures

Observed/published contract as of 21 September 2026:

- 64k tokens total context per request
- 32k-token ceiling for state plus the longest single question
- 250,000 tokens/second
- 1,200 requests/minute
- Text / structured-text input only
- `401`: missing or invalid key
- `422`: malformed request
- `429`: rate limit exceeded; honor retry timing and use exponential backoff
- `529`: provider overloaded; use bounded exponential backoff

Jev Lab public endpoints may impose tighter product limits. For example, the router limits its prompt to 4,000 characters. Those are Lab limits, not provider limits.

## Free-window status

No public TypeSafe source or accessible team record independently confirmed an account-specific free window ending 25 September 2026. Public terms currently list $0.042/M input and free output. Treat any temporary free window as an account-specific commercial concession until its exact scope and end time are confirmed from the TypeSafe console or the original trusted team message. Do not encode temporary free access as permanent pricing.

## Evidence-logging convention

For every real run attached to repository evidence:

1. Record the exact provider-returned model and integration route.
2. Record measured latency and provider token usage.
3. Store the pricing snapshot used and computed estimated cost. Do not label estimates as charged spend.
4. Preserve typed judgments / probability distributions needed to replay the decision.
5. Compute and record a trajectory hash over the immutable run core.
6. Attach the real-run JSON to repository artifacts or the designated durable evidence location.
7. Never substitute community benchmarks or architecture references for a Lab run artifact.
8. Never include API keys, authorization headers, environment dumps, or provider secrets.

## Sources

- Working Jev Lab implementations: `api/run-router.ts`, `api/run-parkour.ts`, and `api/run-evaluation.ts`
- TypeSafe API reference: https://docs.typesafe.ai/llms-full.txt
- TypeSafe launch / pricing: https://typesafe.ai/blog/introducing-system-one-models-and-jev
