# Jev Lab design direction

## Identity
Jev Lab is an independent decision-systems laboratory. It should feel calm, exact, modern, and alive: a place where software decisions can be watched, challenged, and replayed. The visual language must make evidence easier to inspect, never decorate weak evidence into authority.

## Direction
- Modern Apple-style light foundation: warm white and very pale cool-gray surfaces, dark ink, generous whitespace, crisp type, and careful alignment.
- Blue glass is a functional layer for live state, evidence, and controls. Use translucent cards only where seeing hierarchy or background context through the surface helps orientation.
- Restrained blue gradients may mark motion, active state, or depth. Never use a full-page blue-purple wash, a decorative orb, or a gradient on every card.
- Cards are translucent only when they represent an inspectable layer over live state. Ordinary prose and static evidence use solid surfaces.
- Blue is the system signal. Amber means uncertainty or review. Red is reserved for a verified failure or blocked action. Green means a verified pass or completed action, not generic decoration.
- Whitespace carries hierarchy. The first viewport still needs a complete film chain: premise, live mechanism, and primary action. Empty space may not push the product below the fold.

## Typography
- Use a clean humanist sans for reading and headings. Large headings are compact and confident, not oversized for spectacle.
- Use monospace only for hashes, model routes, probabilities, latency, rules, and provenance.
- Sentence case for human copy. Uppercase is limited to short machine-state labels.
- Copy is direct and specific. Avoid sales filler, machine-sounding slogans, invented superlatives, and decorative punctuation.

## Composition
- Content dictates layout. A simulator may use an environment plus control rail; an evidence tool may use an input/output split; a benchmark may use a scoreboard. Do not force every project into the same card grid.
- Keep the active mechanism visible from frame one on desktop and 390px phone. Controls are at least 44px high.
- Results keep their uncertainty, provenance, replay control, and failure state near the result rather than in a distant methodology section.
- Responsive layouts reorder by task priority, not desktop source order. No clipped controls, half-visible text areas, or horizontal overflow.

## Motion
Dial: ENERGY 2 / RHYTHM 3 / MOTION 2

Motion explains a transition: a marble settling into a lane, a vote landing, a route changing, or evidence resolving. Use short, interruptible motion and provide a stable final hold for capture. No ambient floating, universal fade-up, bounce, or motion that hides latency.

## Purpose-gated techniques and project decisions
These are deliberate uses, not blanket exceptions to honesty, function, accessibility, or mobile rules.

| Technique | Project purpose |
| --- | --- |
| Blue gradient | Marks active decision flow or depth between state and evidence. It is restrained and never the page background by default. |
| Glassmorphism | Distinguishes live controls or evidence overlays from the environment beneath. Limit it to one hierarchy layer per view. |
| Translucent cards | Preserve spatial context in simulations and live control rooms. Static reports stay solid for legibility. |
| Lucide icons | Existing project convention for compact control affordances. Keep only when the icon adds recognition; always pair ambiguous icons with text. New decorative sparkle, robot, cube, or magic icons are not allowed. |
| Monospace labels | Separate machine-readable state and provenance from human explanation. Never use monospace as the whole brand voice. |
| Dark canvases | Allowed for simulation/control-room routes when darkness improves focus and contrast with live state. The hub and general product pages remain light-first. |
| Existing route-specific identities | Parkour, Marbles, Arena, Gate, and Challenge retain distinct color metaphors because each expresses a different mechanism. Future work converges on the light blue-glass system unless its product mechanism needs a stronger identity. |

No design direction overrides the hard gates for real data, real functionality, contrast, keyboard access, mobile fit, or verification.

## Required visual evidence
Before ship, inspect actual pixels at desktop and 390x844. Capture initial, active/loading, result, error, and review/escalation states that exist. Record element geometry for overflow and touch targets. A successful build or DOM query is not visual verification.
