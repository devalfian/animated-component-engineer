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
- Selects appropriate CSS, Framer Motion, GSAP, Canvas, SVG, or WebGL techniques.
- Builds reusable React components with clear props and composition boundaries.
- Accounts for responsive behavior, reduced motion, accessibility, and performance.
- Provides a visual QA checklist and acceptance criteria.

## Repository layout

- `skills/animated-component-engineer/` — installable skill package.
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
