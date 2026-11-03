# Design — Paket B "Kontrak + Gate" (v1.2.0)

**Status:** approved
**Date:** 2026-11-03
**Scope:** `skills/animated-component-engineer/**` plus repository metadata.
**Source of ideas:** `0. reference skill ai-design-vault` (Unlicense).

## Problem

The skill is currently all advice and no machinery. It tells an agent to
"respect the project", "avoid layout thrashing", and "verify" — but it ships
nothing executable, no shared vocabulary, and no concrete failure modes. Every
session re-derives conventions that are never written down, and "Validation" is
a seven-row manual checklist an agent can skip without anyone noticing.

The reference vault solves the same problem, but by prescribing a *way of
working* (springs only, one binding, three-tier tokens, routes delegate to
views). Most of that is out of scope here and some of it directly contradicts
this skill's engine-agnostic premise.

## Principle: take the machinery, not the opinions

| Take | Refuse |
|---|---|
| Executable gates, violation vocabulary (FAIL/WARN/SKIP) | "All motion is spring-based, `@keyframes` banned" |
| Concrete traps already paid for in production | Three-tier `--raw-*` token grammar |
| Measured numbers (DPR, frame budgets, 320px, 44px, AA) | `stack.json`, hooks, `.cursorrules`, Obsidian vault |
| A shared primitive vocabulary and prop contract | routes→views, server-first, CMS/DB/SEO/auth |
| "One motion vocabulary per project" | "One animation library, enforced globally" |

The portable version of the vault's single most opinionated rule is: **one
motion language per project** — not one library. A project with GSAP is not
wrong; a project with GSAP *and* Framer Motion *and* a hand-rolled rAF
sprinkler is.

## Deliberate deviations from the reference

1. **The auditor is Node, not Python.** `validate_skill.py` stays Python (CI
   runs it on `ubuntu-latest`). The auditor targets the *host* project, so it
   must run where host projects run. Every web project has Node; not every
   machine has Python (the authoring machine does not). Node ESM, zero
   dependencies, no build step.
2. **Primitive names are engine-neutral.** The vault's `Inview` /
   `SpringTrigger` / `Hover` / `Handle` imply springs. This skill emits CSS,
   GSAP, Canvas and WebGL too, so the roles are named for what they do:
   `Reveal`, `ScrollProgress`, `Hover`, `Swap`.
3. **Keyframes are not banned.** They are discouraged for anything
   interruptible, and `visual-qa.md` asks the question rather than failing the
   build.

## Changes

### New notes (`skills/animated-component-engineer/docs/`)

| File | Content |
|---|---|
| `motion-vocabulary.md` | The four primitive roles with fixed prop names, scroll-position grammar, mode table, value-type rule, per-engine mapping, anti-patterns |
| `per-frame-architecture.md` | The shared render loop (ref-counted, paused when hidden, one debounced resize), read-layout-once, read-after-write prohibition, refs/CSS-vars over state, interruption and velocity, cleanup contract, offscreen gating |
| `text-motion.md` | Split-text model, the three traps (imperative mode, flex + `text-align`, clipping vs leading), crawler copy, DOM restore, reduced motion, three patterns |
| `perf-budget.md` | Device tiers, DPR clamp, per-tier frame budget, energy-saver heuristics, opacity/blur/DOM/particle budgets, compositor hygiene, iOS/WebKit gotchas, how to measure, the a11y numbers (320px / 44px / AA) |

### Rewritten note

`visual-qa.md` becomes two layers. Layer 1 is mechanical and runs the auditor
plus the project's own lint/typecheck/build, reporting **FAIL** (must fix),
**WARN** (fix or justify), **SKIP** (could not apply — and a skip caused by a
missing tool is a gap, not a pass). Layer 2 is the judgement checks a script
cannot make: design fidelity against a re-fetched design, semantics, responsive
behaviour with numbers, client-JS cost. Then the loop: fix, re-run, repeat.
And the reporting rule: never report a clean pass you did not achieve.

### Extended note

`engine-selection.md` gains a qualification rubric per engine category, the
"an installed library wins" rule, "ask before installing and say what it
costs", "verify the API against the installed version's own docs", and "record
the decision".

### New executable

`skills/animated-component-engineer/scripts/audit-motion.mjs` — zero-dependency
Node ESM auditor. Conservative by design: only rules that are objectively
decidable. Ships inside the skill package so it installs with the skill.

Checks (FAIL only when unambiguous):

| Level | Rule |
|---|---|
| FAIL | Two or more distinct animation-library families imported in source |
| FAIL | More than one `requestAnimationFrame` call in the same file, excluding files that own a ticker |
| FAIL | `transition` on a layout property (width, height, top, left, margin, padding) |
| WARN | `@keyframes` animating a layout property |
| WARN | `addEventListener` with no matching `removeEventListener` in the file |
| WARN | Click handler on a non-interactive element |
| WARN | Image tag without `alt` |
| WARN | `leading-none` combined with clipped overflow |
| WARN | Bare `duration-fast` / `duration-normal` utility, only when Tailwind detected |
| WARN | `will-change` used more than five times |
| WARN | `console.log` in source |
| SKIP | Reduced-motion check when nothing animates |

Exit 1 on any FAIL, 0 otherwise. WARN never fails the run.

### New templates

| File | Purpose |
|---|---|
| `verification-report.md` | The fixed report shape: scope, Layer 1 table, Layer 2 findings, measurements before/after, what could not be verified |
| `decision-record.md` | Lightweight ADR: context, decision, alternatives rejected, consequences, how to revisit |

### `SKILL.md`

Stays lean. Gains a docs map table, a one-line list of the five highest-frequency
traps (so they are in context without opening a file), and the Layer-1 audit in
the validate step.

### Tests

Three scenarios matching the existing style: text motion (the three traps),
jank investigation (audit the loop before tuning), multi-engine conflict (a
GSAP project asking for Framer Motion).

### Metadata

`VERSION` to 1.2.0, a `CHANGELOG.md` entry, `README.md` mentioning the auditor,
and `validate_skill.py` gaining the new required-file list plus an existence
check for the auditor.

## Non-goals

- No application code, no dependencies, no framework.
- No project-profile file (that was Paket C).
- No backend, routing, SEO, CMS, auth or deployment guidance.

## Success criteria

- `node scripts/audit-motion.mjs <fixture>` catches every deliberately planted
  violation and exits non-zero; a clean fixture produces zero findings.
- Every markdown link inside the skill package resolves.
- `VERSION` and the `CHANGELOG.md` heading agree.
- `SKILL.md` stays under about 150 lines. That is more than the original 95, and
  deliberate: the five costliest traps and the reference map are inline because a
  link only helps if it gets opened. The detail still lives in `docs/`.
- The committed fixtures prove the auditor both fires and stays quiet: CI fails
  if the dirty fixture exits 0, or the clean fixture exits non-zero.

## Known limitation

Python is not installed on the authoring machine, so `validate_skill.py` cannot
be executed locally. Its rules are verified one by one with a temporary
PowerShell equivalent; CI (`validate.yml`) remains the real gate.