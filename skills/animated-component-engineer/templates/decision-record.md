# Decision Record

For choices the next person should not have to re-derive: which engine, which
library, which structure. Keep it short. One page is plenty; a paragraph is fine
for a small call.

## Title

`DR-0001 — <the decision, stated as a decision>`

## Context

What forced a choice. The constraint that made the obvious answer wrong. Include
what already existed in the project — an installed library, an existing pattern,
a stakeholder requirement.

## Decision

What was chosen, in one or two sentences. Be specific enough that a reader can
tell whether the code matches it.

## Alternatives rejected

| Alternative | Why not |
|---|---|
| | |

If nothing was rejected, no decision was made — you just did the first thing
that came to mind, and there is nothing to record.

## Consequences

What this makes easy, and what it makes hard. Bundle cost, learning cost, what
future work now has to follow it. Include what you would have to undo to change
your mind later.

## How to revisit

The trigger that should reopen this: a measured performance problem, a bundle
budget breach, a framework upgrade, a second section that cannot be expressed in
the chosen engine.

## Common decisions worth recording

- Which motion engine, and why not the other candidate
- Whether smooth scroll is on, and why
- Whether text animation is a library or the shared split component
- Whether a section gets a canvas/WebGL scene or layered DOM
- A deliberate deviation from a documented convention