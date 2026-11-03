# Changelog

## [1.2.0] - 2026-11-03

- Added `scripts/audit-motion.mjs` — a zero-dependency, cross-platform mechanical auditor for the host project, reporting FAIL / WARN / SKIP and exiting non-zero on any FAIL.
- Added `docs/motion-vocabulary.md`: the four shared primitive roles (`Reveal`, `ScrollProgress`, `Hover`, `Swap`) with fixed prop names, scroll-position grammar and a value-type rule.
- Added `docs/per-frame-architecture.md`: one shared render loop, read-layout-once, cleanup contract, offscreen gating.
- Added `docs/text-motion.md`: split-text model and its three traps, crawler copy, DOM restore, reduced-motion path.
- Added `docs/perf-budget.md`: device tiers, DPR clamping, per-tier frame budgets, compositor hygiene, iOS/WebKit gotchas, measuring honestly, accessibility numbers.
- Rewrote `docs/visual-qa.md` as two layers — mechanical then judgement — with the fix-and-re-run loop and an explicit reporting rule.
- Extended `docs/engine-selection.md` with an engine qualification rubric, the "an installed library wins" rule, "ask before installing", and "verify the API against the installed version".
- Added `templates/verification-report.md` and `templates/decision-record.md`.
- Added three test scenarios: text-motion traps, jank investigation, two animation libraries.
- SKILL.md now lists the five highest-frequency traps inline, a reference map, and the mechanical audit in its verification step.
- Validation now checks the new required files, the auditor's contract, and the test-scenario count.

## [1.1.0] - 2026-11-03

- Restructured repository as a public, discoverable Agent Skill under `skills/animated-component-engineer/`.
- Added cross-agent installation instructions using the Skills CLI.
- Updated local Cline installer and release packaging for the nested skill directory.
- Added validation for skill metadata, required docs/templates, internal links, and version/changelog consistency.

## [1.0.0] - 2026-11-02

- Initial Animated Component Engineer Manager package.
- Added implementation guidance, templates, validation, and PowerShell helper scripts.
