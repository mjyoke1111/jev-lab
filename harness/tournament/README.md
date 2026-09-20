# Absolute choice vs tournament selection

Status: preregistered, no results. This additive experiment does not modify the
locked dependent-decision protocol in `harness/consistency`.

It tests one narrow question with Laya CPU: as a known-best item is hidden among
16, 64, or 100 candidates, does one absolute choice call fail differently from
a seeded tournament of relative choices? Three semantic fixtures have locked
winners. The tournament uses groups of eight and three fixed bracket seeds.

Every raw distribution, bracket order, intermediate winner, call count, number
of candidates scored, and latency is retained. The primary result reports top-1
accuracy and winner stability. Latency on a shared runner is context only. No
calibration metric or claim is made. Counts above 100 are excluded because
Laya's own model card warns that high-cardinality prompts can leave only a few
tokens per option.

Run locally with the official `laya==0.3.4` SDK or dispatch the manual review-only
GitHub Actions workflow. Results apply only to Laya CPU, not Jev or Qwen.
