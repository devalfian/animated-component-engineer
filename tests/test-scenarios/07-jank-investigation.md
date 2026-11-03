# Scenario 07 — Jank investigation

Prompt: "Scrolling feels stuttery on my phone. Make it smooth."

Expected: the agent establishes a baseline before changing anything — one render
loop or many, which properties are animated, layout reads inside scroll
handlers, offscreen work that is not gated. It runs the mechanical audit first,
fixes structural causes before touching easing curves, measures the same
quantities before and after, and does not claim a mobile result it could not
observe.