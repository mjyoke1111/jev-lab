# Antislop rule review

Reviewed against Jev Lab conventions on 2026-09-22 using all 38 rules from `antislop-ai` 3.2.12. This is a conventions review, not an audit of frozen kit/audit funnel pages. `/offer` and `/scorecard` were not inspected or changed.

| Rule | Jev Lab convention | Status |
| --- | --- | --- |
| R-01 Color & Gradients | Restrained blue gradient only for state, flow, or depth; no generic page wash. | Purpose recorded in `DESIGN.md` |
| R-02 Copywriting | Direct evidence language; no filler, em dashes, fake quotes, or AI slogans. | Hard gate |
| R-03 Mobile Responsiveness | 390x844 pixel check plus geometry and 44px target check. | Hard gate |
| R-04 Icons | Existing Lucide control icons retained only for recognition and labeled when ambiguous. | Purpose recorded |
| R-05 Layout & Page Structure | Mechanism determines composition; do not force a landing-page template. | Quality lock |
| R-06 Typography | Humanist sans for reading; mono only for machine state and provenance. | Purpose recorded |
| R-07 Background | Light neutral foundation; route-specific dark canvases only when focus/contrast benefits. | Purpose recorded |
| R-08 Button Arrows | Arrows only when they communicate direction/navigation. | Purpose gate |
| R-09 Badges | Badges represent real state, provenance, model, or run type. | Purpose gate |
| R-10 Glassmorphism | Blue glass marks live controls/evidence over context; one hierarchy layer per view. | Purpose recorded |
| R-11 Border Radius | Small, consistent radius scale; avoid excessive nested rounding. | Quality lock |
| R-12 Shadow | Shadow communicates elevation or focus, not decoration. | Purpose gate |
| R-13 Glow | Reserved for current live signal/state, never ambient decoration. | Purpose gate |
| R-14 Feature Cards | Cards group related interactive state; prose does not become a uniform card wall. | Purpose gate |
| R-15 CTA | One clear primary action per state; secondary actions stay visually secondary. | Quality lock |
| R-16 Copywriting & Buzzwords | Evidence-first, specific claims; no buzzword stack. | Quality lock |
| R-17 Data & Numbers | Only source-backed run data; units, cohorts, hashes, and provenance stay visible. | Hard gate |
| R-18 Testimonials | No testimonials unless real, sourced, and approved for publication. | Hard gate |
| R-19 Animations | Motion explains simulation or state transitions, is interruptible, and ends in a stable hold. | Purpose recorded |
| R-20 Visual Identity | Calm decision-systems lab; route-specific metaphors serve each mechanism. | Quality lock |
| R-21 Dark Mode | General pages are light-first; dark simulation canvases must independently pass contrast/state checks. | Quality lock |
| R-22 Illustrations | No generic AI illustrations; assets must explain a mechanism and follow explicit asset approval. | Purpose gate + hard asset gate |
| R-23 Clarification & Visual Assets | Ask before creating new visual assets; honest placeholder otherwise. | Hard gate |
| R-24 Navigation | Every route and control target must exist and work. | Hard gate |
| R-25 Color Contrast | Test text, state colors, controls, and glass surfaces in every shipped theme. | Hard gate |
| R-26 Interactive Elements | No dead controls or decorative controls that imply an action. | Hard gate |
| R-27 UI States | Show applicable empty, loading, error, result, review, and escalation states. | Hard gate |
| R-28 FAQ | FAQ only for real recurring decision friction, never as a default landing section. | Hard gate |
| R-29 Color Palette | Blue=system, amber=uncertainty/review, red=failure/block, green=verified pass. | Quality lock |
| R-30 Do Not Clone Popular Products | Apple-style means material qualities and restraint, not copying Apple layouts/assets. | Quality lock |
| R-31 Every Decision Must Have a Reason | Purpose-gated choices live in `DESIGN.md`; run-specific reasons live in the gate report. | Quality lock |
| R-32 Keyboard Accessibility | Visible focus, logical order, reachable controls, and escape paths where applicable. | Hard gate |
| R-33 No File/CSS Patching via Scripts | Product source is edited directly; no regex patch helper is shipped. | Hard gate |
| R-34 Every Theme You Ship Must Work | Light-first and any dark route are each validated, not assumed. | Hard gate |
| R-35 Verify Before You Deliver | Build plus desktop/390px pixel inspection and production/preview verification. | Hard gate |
| R-36 No Fabricated Claims | No invented Jev result, counter, testimonial, benchmark, or evidence. | Hard gate |
| R-37 Design Direction Required | `DESIGN.md` is the settled project direction for future work. | Hard gate |
| R-38 Real Content or Honest Placeholder | Real replay artifacts and source-backed copy; clearly label unavailable/pending data. | Hard gate |

## Deliberate conventions retained

The current project keeps selective blue gradients, one-layer glass, Lucide control icons, mono evidence labels, and app-specific dark simulation identities. Each has a one-line functional reason in `DESIGN.md`; none is a license to stack effects or bypass the hard gates.
