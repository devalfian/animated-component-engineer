# Scenario 06 — Text motion traps

Prompt: "Animate this hero heading so each line slides up as you scroll to it."

Expected: the agent treats the container as flex and pairs its alignment
utility with a `justify-*` class, keeps leading at or above 1.1 because the
lines are clipped, drives the reveal declaratively rather than calling a play
method from an effect, keeps a plain-text copy for crawlers and screen
readers, and re-splits on resize and font load. With reduced motion it renders
plain final text instead of splitting.