# Engine Selection

## What each engine is actually good at

| Need | Preferred approach | Notes |
|---|---|---|
| Button, card, menu state | CSS transition | lowest overhead; `transform` / `opacity` where possible |
| Reveal on viewport entry | IntersectionObserver + CSS, or the installed motion library | trigger once unless repeat is genuinely wanted |
| Coordinated React transitions | the installed Motion / Framer Motion | check the installed version first |
| Complex timeline / scroll choreography | GSAP | scope and clean up contexts and ScrollTriggers |
| Vector line drawing | SVG + CSS/JS | keep paths optimised |
| Particle field / many sprites | Canvas | never one DOM node per particle |
| Real-time 3D scene | WebGL / three.js | only when 3D is essential to the message |

## What qualifies as an engine here

Before recommending anything, check it against the job — not against
familiarity.

| Job | It must be able to |
|---|---|
| State transition | resolve from the current value when interrupted mid-flight |
| Scroll-driven motion | accept an external progress number, not only its own trigger |
| Continuous output | write `transform` / `opacity` without forcing layout |
| Content reveal | change appearance without controlling presence |
| All of the above | run inside the project's render boundary and be tree-shakeable |

An engine that can only play fixed-duration changes is a fine choice for a
one-shot entrance and a bad choice for anything a user can interrupt. That is a
scope statement, not a verdict on the library.

## Decision rules

1. **Read the manifest first.** `package.json` and the lockfile, before forming
   an opinion.
2. **An engine already in the project wins**, even when it is not your
   preference. Consistency beats preference: two motion libraries in one
   codebase means two motion languages, two debugging models, two bundle costs,
   and a reviewer who cannot say which one is authoritative.
3. **Prefer browser-native APIs** for simple needs. `IntersectionObserver` and
   CSS transitions are free.
4. **One engine per job.** A timeline library and a declarative component
   library can coexist only when they genuinely do different jobs, and that
   split is written down. The auditor FAILs two DOM-animation families.
5. **Ask before installing.** Say what the package is, what it costs (bundle
   size, peer dependencies, what it changes about the existing code) and what
   the alternative is. Do not install first and report after.
6. **Add a dependency only when it materially reduces complexity** or enables a
   capability that cannot reasonably be hand-built.

## Verify the API against the installed version

The animation ecosystem renames things between majors — a package that was
`framer-motion` becomes `motion`, a helper moves, a hook gains a required
argument. Training data lags all of it.

Before writing animation code against a library, confirm the API against the
version actually installed: its own README or `types` in `node_modules`, the
official docs, or a quick local test. Writing last year's API with confidence is
the most common failure in this area, and it fails at runtime, not at review.

## Record the decision

A non-trivial engine choice gets a short decision record using
[the decision record template](../templates/decision-record.md): context, what
was chosen, what was rejected and why, and what would reopen it. The next person
should not have to re-derive it from the code.

## Related

[Motion vocabulary](motion-vocabulary.md) ·
[Per-frame architecture](per-frame-architecture.md) ·
[Performance budget](perf-budget.md)
