# Animated Component Engineer

A reusable, agent-agnostic skill for designing, implementing, and validating polished animated React components.

## Install

### Any supported agent (recommended)

```bash
npx skills add devalfian/animated-component-engineer --skill animated-component-engineer
```

### Cline, global installation

```bash
npx skills add devalfian/animated-component-engineer --skill animated-component-engineer --agent cline -g
```

## Update

```bash
npx skills update
```

## What it does

- Turns a natural-language interaction brief into a concrete motion and interaction specification.
- Selects appropriate CSS, Framer Motion, GSAP, Canvas, SVG, or WebGL techniques — and tells you when the project's existing library should win instead.
- Builds reusable React components with clear props and composition boundaries, against a shared vocabulary (`Reveal`, `ScrollProgress`, `Hover`, `Swap`).
- Accounts for responsive behavior, reduced motion, accessibility, and per-frame cost.
- Ships a mechanical auditor, so "verified" means a command ran, not a checklist was remembered.
- Provides a visual QA process and a fixed report shape.

## Audit a project

The skill includes a zero-dependency Node auditor for the project you are
working in. No install, no build step:

```bash
node <skill-dir>/scripts/audit-motion.mjs .        # whole project
node <skill-dir>/scripts/audit-motion.mjs src      # scoped
node <skill-dir>/scripts/audit-motion.mjs . --json # machine-readable
```

It reports **FAIL** (must fix), **WARN** (fix or justify) and **SKIP** (could
not apply), and exits non-zero on any FAIL. It catches the decidable rules —
two animation libraries, more than one render loop, layout properties in a
transition, listeners with no cleanup, click handlers on a `div`, images with no
`alt`, tight leading with clipping, and a few more. The judgement checks that a
script cannot make live in `docs/visual-qa.md`.

## Repository layout

- `skills/animated-component-engineer/` — installable skill package.
  - `SKILL.md` — entry point: principles, the five costliest traps, workflow, reference map.
  - `docs/` — engine selection, motion vocabulary, per-frame architecture, text motion, performance budget, visual QA, component architecture, assets, exploration, accessibility.
  - `templates/` — animation brief, acceptance checklist, prompt recipes, verification report, decision record.
  - `scripts/audit-motion.mjs` — the mechanical auditor.
- `scripts/` — validation, local installation, packaging, and release helpers.
- `tests/test-scenarios/` — manual behavior and quality scenarios.

## Validate locally

Python 3.10+:

```bash
python scripts/validate_skill.py
```

PowerShell local install for Cline:

```powershell
.\scripts\install.ps1
```

## Publish a release

1. Push this repository to GitHub.
2. Update `VERSION` and `CHANGELOG.md`.
3. Run `python scripts/validate_skill.py`.
4. Run `.\scripts\package-release.ps1`.
5. Publish a GitHub Release and attach `dist/animated-component-engineer.zip` and `dist/SHA256SUMS.txt`.

The `npx skills` installer installs the skill directly from the repository; the release ZIP is for standalone/manual distribution.
