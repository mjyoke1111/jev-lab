# Design Delivery Gate

Every UI change must ship with a completed copy of this file or an equivalent pull-request section. Mark each line `[x]`, attach evidence, and set one final status. A hard-gate miss means FAIL. Purpose-gated techniques without a written reason mean FAIL.

## Hard gate
- [ ] No invented numbers, testimonials, security claims, or outcomes.
- [ ] Every visible control works; navigation targets exist.
- [ ] Desktop and 390x844 pixels were inspected; no overflow, clipping, or collision.
- [ ] Tap targets are at least 44px; keyboard focus and contrast were checked.
- [ ] Empty, loading, error, result, and review states that apply were inspected.
- [ ] Copy is direct, human, and free of generic AI marketing language.
- [ ] New visual assets were explicitly requested or use an honest placeholder.
- [ ] No source/CSS rewrite helper was left behind as product code.

## Purpose gate
List each used technique and its one-line purpose. At minimum check gradients, translucency/glass, shadows, glow, icons, motion, card repetition, and dark mode against `DESIGN.md`.

- [ ] Every used technique has a product or hierarchy reason recorded here or in `DESIGN.md`.
- [ ] No trend stack exists only to make the page look designed.

Evidence / reasons:
- 

## Liveliness
- [ ] The Design Read matches `DESIGN.md`.
- [ ] ENERGY / RHYTHM / MOTION dials are stated.
- [ ] The result has a recognizable Jev Lab identity without relying on a logo swap.
- [ ] At least one content-driven rhythm or interaction prevents sterile uniformity.

## Craftsmanship and quality locks
- [ ] Composition follows the product narrative, not a stock landing-page sequence.
- [ ] Content, labels, units, hashes, model routes, and prices have verified sources.
- [ ] Responsive order follows task priority.
- [ ] Motion is interruptible and ends in a stable inspectable state.
- [ ] Production or preview URL and decisive pixel captures are attached.

## Final status
- [ ] PASS
- [ ] FAIL

Owner:
Commit:
URLs:
Pixel evidence:
Open caveats:
