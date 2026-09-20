# Dependent decision consistency harness

This protocol tests whether one multi-field judgment is correct as a whole. It does not treat four individually plausible answers as a successful decision when they contradict each other.

## Locked metrics

- **Per-field accuracy:** accuracy for each output field and micro-accuracy across fields.
- **Strict joint accuracy:** a case passes only when every field matches its locked label.
- **Constraint-violation rate:** violated declared cross-field rules divided by all rule checks.
- **Calibration:** Brier score and 10-bin ECE stay withheld until at least 50 labeled cases are locked. The 12-case sanity set is too small for a publishable calibration claim.

`cases.json` is the source of truth for the schema, labels, and machine-checked constraints. It contains obvious outage, degraded, and no-impact cases. It is a plumbing and sanity set, not a benchmark.

## Score any result artifact

An artifact contains `predictions[]`, each with a case `id`, then `fields.<name>.value` and optional `fields.<name>.scores` probabilities.

```sh
npm run consistency:score -- \
  --predictions harness/results/consistency-nimble.json \
  --out harness/results/consistency-nimble-report.json
```

The evaluator fails closed on missing cases or fields and malformed probability distributions.

## Jev runner

```sh
TYPESAFE_API_KEY=... npm run consistency:jev -- harness/results/consistency-jev.json
```

The runner pins `jev-1.13.0` by default and asks every dependent question in the same request. It emits no placeholder result when the key or a request is missing.

## Nimble runner

Use Bespoke's documented model preparation first. The Hugging Face release is a LoRA adapter, so the pinned Qwen3.5-9B base must be downloaded and merged. Linux execution needs a CUDA GPU; BF16 is the default validated path.

From an environment where the official `nimble` package is importable:

```sh
python harness/consistency/run-nimble.py \
  --model-config .cache/nimble-model.json \
  --out harness/results/consistency-nimble.json
```

The runner imports Bespoke's `CudaCandidateScorer`; it does not imitate Nimble or substitute a local heuristic. Run the 12 sanity cases and inspect every miss before expanding to a publishable comparison.

## Evidence rules

Bespoke's reported holdout scores are vendor evidence, not Lab measurements. A Lab comparison is publishable only after the exact model revision, runtime, raw prediction artifact, evaluator report, and case-set commit are recorded. Nimble probabilities are not assumed calibrated.
