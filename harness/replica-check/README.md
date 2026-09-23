# Replica check

Question: how close does an open Jev replica get to real Jev on a task where we already hold recorded Jev receipts?

- **Jev side:** the recorded real Jev run in `public/runs/challenge-lab-recorded.json` (jev-1.13.0, 12 cases, 2 packs). Replayed, not re-run. No hosted Jev call, zero spend.
- **Replica side:** [yijunyu/jev-rs](https://github.com/yijunyu/jev-rs) serving the TypeSafe `/v1/systemone` wire format on top of an open GGUF model through llama.cpp. Every replica output is labelled **REPLICA - not Jev**.
- **Same input:** the runner rebuilds the exact Challenge Lab request body and refuses to run if the cohort hash differs from the receipt's `cohortSha256`.

## Metrics

Per case: replica choice vs locked label, replica choice vs Jev choice, multi-class Brier for both sides, total-variation distance between the two probability vectors. Replica latency per request is recorded; Jev latency is not compared (different hardware and network).

12 cases is a sanity comparison, not a benchmark. Report numbers with that caveat, never a verdict.

## Runs

- `results/plumbing-qwen3-0.6b-sandbox.json`: pipeline check on a 2 GB sandbox with Qwen3-0.6B. Not evidence of anything except that the plumbing works.
- The real run is `.github/workflows/replica-check.yml`: free GitHub-hosted CPU runner, pinned llama.cpp b11147, jev-rs v0.1.0 (release sha256 checked) and Qwen3-4B Q4_K_M at a pinned Hugging Face revision, with option permutations 1 and 4. Results upload as a workflow artifact.

```sh
node harness/replica-check/run.mjs --endpoint http://127.0.0.1:8090 --label NAME --out harness/replica-check/results/NAME.json [--meta meta.json]
```
