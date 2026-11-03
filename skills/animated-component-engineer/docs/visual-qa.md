# Visual QA

Two layers. The script decides what is decidable; you decide the rest. Never
report "done" on the script alone — it cannot see a design.

## Layer 1 — mechanical (run first, every time)

```bash
node <skill-dir>/scripts/audit-motion.mjs <path>   # whole project if path omitted
```

Then the project's own gates, read from `package.json` scripts rather than
guessed:

```bash
npm run lint      # or pnpm/yarn/bun equivalent
npm run typecheck # if it exists
npm run build
```

Read the results the same way every time:

| Level | Meaning |
|---|---|
| **FAIL** | must be fixed. No exceptions, no "later" |
| **WARN** | a judgement call. Fix it, or justify it explicitly in the report — never silently ignore |
| **SKIP** | the check could not apply. Fine when the project genuinely lacks the concept; a gap to close when it is caused by a missing tool or an unscanned path |

An honest SKIP beats a meaningless pass. If the audit reports SKIP because it
found no source files, you passed the wrong path.

## Layer 2 — judgement checks

Work section by section.

### The initial state

Does the component make sense **before** any animation runs? Content that only
appears once a trigger fires is content that disappears when the trigger fails,
when the crawler arrives, and when the user prefers reduced motion.

### Interaction states

Initial, hover, focus-visible, active, loading, success, error, disabled — as
many as the component actually has. For each: what changes, and does it change
without layout shift?

### Keyboard and touch

- Reachable and operable by keyboard alone, in a logical order.
- Focus visible at all times; never removed without a replacement.
- Every hover affordance has a touch or focus equivalent. Nothing is
  hover-only.
- Touch targets at least 44 by 44px.

### Reduced motion

With `prefers-reduced-motion: reduce`: content present, readable, in its final
position. Not mid-transition, not hidden, not waiting for a trigger.

### Semantics and SEO

- One `h1` per page; no skipped heading levels.
- Real `button` for actions, real `a` for navigation. No click-handler `div`.
- A semantic element on every animation wrapper — an animated heading must not
  become a `div`.
- Content is in the DOM regardless of motion state. A reveal changes appearance,
  never presence. Check the rendered HTML, not the devtools tree after hydration.
- Meaningful `alt`; decorative images `alt=""`.
- Contrast: 4.5:1 body, 3:1 large text.

### Responsive

- No horizontal overflow at any width down to 320px.
- Grid and flex reflow deliberately at each breakpoint; nothing cramped,
  orphaned or clipped.
- Text stays readable; no leading-plus-clipping combination shaves glyphs.
- Motion that is disabled on mobile is actually disabled, not merely smaller.

### Per-frame cost

- One render loop for the page, not one per component.
- `transform` and `opacity` only for continuous motion.
- Offscreen work gated; hidden tab renders nothing.
- Nothing animating that the user cannot see.

### Design fidelity, when a design exists

Re-fetch the design before checking against it. Never QA from memory or from
your own earlier summary — the summary is what dropped the value you are about
to check.

- Copy: character for character. Flag anything paraphrased, shortened or
  invented.
- Layout: column count, direction, alignment, order, positioning.
- Spacing and type: values against the design, not against your impression.
- Colour: resolved through tokens, not matched by eye.
- Assets: aspect ratio, crop, radius, overlap. No effects the design lacks.

If an image looks invisible or wrong, check the **container** first — an
invented wrapper background is the usual cause, not the asset.

### Token and value discipline

- Every colour, spacing, radius and type value resolves to a token or a
  documented scale value.
- No magic numbers in class names or inline styles.
- A value that had to be invented because the design has no equivalent is
  **flagged to the user for design review**, not quietly added.

## The loop

1. Run layer 1. Fix every FAIL.
2. Walk layer 2 section by section, fixing as you go.
3. Re-run layer 1 — fixes introduce violations.
4. Repeat until clean.

## Reporting

Use [the verification report template](../templates/verification-report.md).
State plainly: what failed and was fixed, which WARNs you consciously kept and
why, which values could not map to a token, and anything you could not verify —
no design, no device, no browser tooling, no production build.

**Never report a clean pass you did not achieve.** A check you did not run is not
a pass, and saying so costs nothing compared to finding it in production.

## Related

[Performance budget](perf-budget.md) · [Text motion](text-motion.md) ·
[Motion vocabulary](motion-vocabulary.md) ·
[Motion patterns](motion-patterns.md)
