# Verification Report

The fixed shape of a "done" report for an animated component. Fill it in as you
work, not afterwards — a report written from memory is a report of your own
summary, which is exactly what dropped the value you are now claiming.

## Scope

- Component or section:
- Files touched:
- Engine and motion binding:
- Viewports checked:

## Layer 1 — mechanical

Commands actually run, with their real result.

| Check | Command | Result |
|---|---|---|
| Motion audit | `node <skill>/scripts/audit-motion.mjs <path>` | FAIL count / WARN count / SKIP count |
| Lint | `<project lint command>` | pass / fail / not available |
| Typecheck | `<project typecheck command>` | pass / fail / not available |
| Build | `<project build command>` | pass / fail / not available |

Every FAIL is fixed. Every remaining WARN is listed in "Consciously kept" below.
Every SKIP is listed, with whether it is a genuine non-applicability or a gap.

## Layer 2 — judgement

| Area | Finding |
|---|---|
| Initial state understandable before any animation runs | |
| Primary interaction (desktop / mobile) | |
| Keyboard and focus visibility | |
| Touch parity with hover | |
| Reduced motion — content present, readable, final position | |
| Semantics — one `h1`, no skipped levels, real `button` / `a`, semantic element on every wrapper | |
| Responsive — 320px with no horizontal overflow, 44px targets | |
| Contrast — 4.5:1 body, 3:1 large | |
| Performance — one loop, transform/opacity only, offscreen work gated | |
| SEO — content in the DOM regardless of motion state | |
| Interruption — every reversible state resolves from where it is | |

## Measurements

Numbers taken before and after, on the same footing (production build, same
device or throttle).

| Quantity | Before | After |
|---|---|---|
| | | |

A quantity measured only after the change is an opinion, not a measurement.

## Consciously kept

WARNs or design choices left as they are, each with a one-line reason.

## Not verified

Anything that could not be checked, and why — no design available, no device,
no browser tooling, no production build.

> Never report a clean pass you did not achieve. One honest "not verified" line
> costs nothing; discovering it in production costs the client.