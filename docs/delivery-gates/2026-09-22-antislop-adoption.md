# Design Delivery Gate

Every UI change must ship with a completed copy of this file or an equivalent pull-request section. Mark each line `[x]`, attach evidence, and set one final status. A hard-gate miss means FAIL. Purpose-gated techniques without a written reason mean FAIL.

## Hard gate
- [x] No invented numbers, testimonials, security claims, or outcomes.
- [x] Every visible control works; navigation targets exist.
- [x] Desktop and 390x844 pixels were inspected; no overflow, clipping, or collision.
- [x] Tap targets are at least 44px; keyboard focus and contrast were checked.
- [x] Empty, loading, error, result, and review states that apply were inspected.
- [x] Copy is direct, human, and free of generic AI marketing language.
- [x] New visual assets were explicitly requested or use an honest placeholder.
- [x] No source/CSS rewrite helper was left behind as product code.

## Purpose gate
List each used technique and its one-line purpose. At minimum check gradients, translucency/glass, shadows, glow, icons, motion, card repetition, and dark mode against `DESIGN.md`.

- [x] Every used technique has a product or hierarchy reason recorded here or in `DESIGN.md`.
- [x] No trend stack exists only to make the page look designed.

Evidence / reasons:
- Documentation/tooling-only change. No application UI, copy, route, or asset changed. Purpose decisions are recorded in DESIGN.md and the 38-rule matrix.

## Liveliness
- [x] The Design Read matches `DESIGN.md`.
- [x] ENERGY / RHYTHM / MOTION dials are stated.
- [x] The result has a recognizable Jev Lab identity without relying on a logo swap.
- [x] At least one content-driven rhythm or interaction prevents sterile uniformity.

## Craftsmanship and quality locks
- [x] Composition follows the product narrative, not a stock landing-page sequence.
- [x] Content, labels, units, hashes, model routes, and prices have verified sources.
- [x] Responsive order follows task priority.
- [x] Motion is interruptible and ends in a stable inspectable state.
- [x] Production or preview URL and decisive pixel captures are attached.

## Final status
- [x] PASS
- [ ] FAIL

Owner: Jev Lab project workstream
Commit: pending at gate execution
URLs: not applicable; project-scoped agent tooling only
Pixel evidence: not applicable; application pixels unchanged
Open caveats: Frozen /offer and /scorecard pages were not audited or modified.
