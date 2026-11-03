# Text Motion

Animated text is where most implementations break, and they break the same way
every time. Three traps account for nearly all of it. This note exists so you
meet them on paper instead of in production.

## How split-text works

The text is split into **line / word / letter** slots, and each slot animates
independently with a stagger between them. Layers nest:

```
wrapLine > line > wrapWord > word > wrapLetter > letter
```

Each layer has an **in** state (visible destination) and an **out** state
(hidden resting position). The `wrap*` layers are the **clip boxes**: they carry
`overflow: hidden` so a slot can slide in from outside its own box.

Build this **once**, as one shared component. A per-section bespoke text
animator is the single most common source of inconsistent typography.

## Trap 1 — never drive scroll text imperatively

Use declarative modes. A `play()` call from an effect re-introduces exactly the
timing bugs the modes exist to prevent: it fires before layout settles, it
double-fires on re-render, and it fights the scroll position instead of
following it.

| Mode | Behaviour |
|---|---|
| `once` | plays in once, never replays |
| `always` | plays in on enter, out on leave |
| `forward` | plays in on downward scroll only |
| `progress` | driven by scroll position between `start` and `end` |

## Trap 2 — the container is flex, so `text-align` does nothing

Slots are flex items with wrapping. `text-align` does not position flex items;
`justify-content` does. A lone `text-center` silently does nothing, and the
heading stays left-aligned while the designer's file says otherwise.

Always set **both**: `justify-*` does the real work, `text-*` keeps plain-text
fallbacks, the hidden crawler copy and nested inline content aligned.

| Intent | Class pair |
|---|---|
| Left (default) | `text-left justify-start` |
| Centre | `text-center justify-center` |
| Right | `text-right justify-end` |

Because the container wraps, `justify-content` applies **per wrapped line** —
which is what you want for a multi-line heading.

> Never `justify-between` here. The flex items are **words**, not lines, so it
> spreads every line's words edge to edge, including the last one. That reads as
> broken justified text.

## Trap 3 — clipping cuts to the line-height box, so keep leading at or above 1.1

With clipping on, each wrap layer is an inline-block box whose height comes from
`line-height`. Tight leading makes that box shorter than the glyphs, so
descenders (`g`, `y`, `p`, `j`) and accented capitals get shaved off.

The clip is required — it is what hides the text before it slides in — so the
fix is the leading, not the clip.

- **Never `leading-none` (1) with clipping.** This is the single most common
  cause of shaved text.
- **Treat 1.1 as the floor.** Many type scales above the 4xl step ship
  `line-height: 1` and clip.
- Set it **on the container**; line-height inherits into every wrap layer.

If a design genuinely needs tighter visual leading, do not shrink the
container. Give the clip box room and pull the layout back with a matching
negative margin on the wrap layer, e.g. `py-[0.15em] -my-[0.15em]`.

## The copy crawlers and screen readers actually get

Split text is a pile of spans to a screen reader and to a crawler. Both need a
plain copy.

- Render a **visually hidden, textually complete** copy of the string. Not
  `display: none` — that is removed from the accessibility tree.
- Mark the animated slots `aria-hidden="true"` so the text is read once, not
  twice in fragments.
- **Reduced motion**: render the plain text at its final state and skip the
  split entirely. It is the cheapest correct path and the fastest render.

## Implementation checklist

1. **Split** into slots, preserving nested inline elements (`strong`, `em`,
   links, inline icons) rather than flattening to a string. Splitting into
   *lines* requires measuring after layout, so re-split on resize **and** on
   font load.
2. **Wrap** each slot in a clip box when the motion slides in.
3. **Animate per slot**, staggered by index as an increment of the base delay —
   not a hand-tuned constant.
4. **Drive** from the shared render loop, not one loop per slot.
5. **Trigger** with the modes above.
6. **Restore on unmount** so the DOM is left as it was found.
7. **Match value types** across in and out states: `y: '0%'` with `y: '100%'`,
   or `y: 0` with `y: 60` — never one of each.

## Annotation and emphasis

- Split the text, never the meaning. Do not split inside a word a screen reader
  would read differently.
- Do not animate every paragraph. One animated headline per view is a design
  choice; ten is a performance problem and a readability problem.
- Never let an animation be the only way content becomes readable. If the text
  is invisible until an in-view trigger fires, it is invisible when the trigger
  fails.

## Common patterns

| Pattern | Settings |
|---|---|
| Line-by-line heading reveal | lines slide up from their clip box, stagger ~100ms, `once`, leading 1.1 or looser, `justify-*` matched to `text-*` |
| Word-by-word fade-up for body copy | words rise a few px with opacity, stagger ~60ms. No clipping, so leading is free |
| Scroll-resolved text | `progress` mode between `start` and `end`, `scrub` for smooth, `toggle` for snap |
| Character stagger for a short display line | letters only, short strings only — a 60-character sentence split per letter is 60 animated nodes |

## Related

[Motion vocabulary](motion-vocabulary.md) ·
[Per-frame architecture](per-frame-architecture.md) ·
[Performance budget](perf-budget.md) · [Visual QA](visual-qa.md)