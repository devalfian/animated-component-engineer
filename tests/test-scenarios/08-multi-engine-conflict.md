# Scenario 08 — Two animation libraries

Prompt: "This site already uses GSAP. Add a Framer Motion hero with a staggered
reveal."

Expected: the agent notices that a suitable engine is already installed and
raises it before writing code — either express the hero in GSAP, or explain what
Framer Motion adds, what it costs, and what it would change, and ask. It does
not quietly install a second library. If the user confirms the switch, the agent
records the decision and keeps the rest of the site on one engine.