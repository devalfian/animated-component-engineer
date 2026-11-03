# Motion Vocabulary

A shared vocabulary is what makes an animated component reviewable, reusable,
and replaceable. Without one, every section invents its own trigger, its own
prop names and its own way of undoing itself on unmount, and a review has
nothing to check against.

This is a **naming and behaviour contract, not a library.** Implement each role
once, in the project's own idiom, on whatever engine the project already uses.
Then every section that follows is consistent by construction.

## The four roles

| Role | Trigger | Use for |
|---|---|---|
| `Reveal` | element enters the viewport | fade / rise / clip-in entrances |
| `ScrollProgress` | scroll position across a range | parallax, scrubbing, snap-at-a-point |
| `Hover` | pointer enter / leave | hover motion — never on touch |
| `Swap` | children or content change | smooth enter / exit on a replacement |

Anything else is a composition of these four. If a component needs a fifth
role, that is a design conversation, not a new prop surface.

## Shared props

Names are fixed. Do not rename them per component or per engine — the contract
is the point.

| Prop | Meaning |
|---|---|
| `as` | the semantic element to render: `section`, `h2`, `li`, `figure`. **Never defaults to `div`** |
| `from` / `to` | start and end visual state. Animatable values only — never class names |
| `transition` | physics or timing for this instance: spring config, or duration + easing plus token reference |
| `mode` | `once`, `always`, `forward` for reveals; `scrub`, `toggle` for scroll |
| `delayIn` / `delayOut` | milliseconds before enter / exit. Staggers are increments of these, not hand-timed values |
| `disableOnMobile` | opt this instance out below the mobile breakpoint |
| `className` | styling stays in classes, never in `from` / `to` |

## Modes

| Role | Mode | Behaviour |
|---|---|---|
| `Reveal` | `once` | plays in, stays. The default for content |
| `Reveal` | `always` | plays in on enter, reverses on exit |
| `Reveal` | `forward` | plays in on downward scroll only |
| `ScrollProgress` | `scrub` | maps scroll position continuously onto the value |
| `ScrollProgress` | `toggle` | snaps at the trigger point |

Prefer `once`. Repeated entrance animation on the same content is a distraction
that costs frames every time the user scrolls.

## Scroll position grammar

One small grammar, instead of a builder API. `"<element-edge> <viewport-edge>"`
with an optional offset:

| Value | Progress 0 | Progress 1 |
|---|---|---|
| `top bottom` | element top reaches viewport bottom | — |
| `bottom top` | — | element bottom reaches viewport top |
| `top bottom+=200` | the same, 200px later | — |
| `center center` | element centre meets viewport centre | — |

`ScrollProgress` takes `start` and `end` in this grammar and exposes a 0–1
progress value. Everything derived from scroll is a function of that number.

## The value-type rule

Both ends of an animated value must be the **same type**. All numbers, or all
unit strings.

```ts
{ from: { y: 0 }, to: { y: 60 } }          // fine
{ from: { y: '0%' }, to: { y: '100%' } }   // fine
{ from: { y: 0 }, to: { y: '60px' } }      // runtime error in most engines
```

This is the most common cause of "the animation does nothing" that is not a
styling bug.

## Rules that hold for every role

1. **Animate `transform` and `opacity`.** Animating `width`, `height`, `top`,
   `left`, `margin` or `padding` runs layout on every frame. See
   [per-frame architecture](per-frame-architecture.md).
2. **Content exists regardless of motion state.** Motion changes appearance,
   never presence. Do not unmount, `display: none` or `visibility: hidden` the
   content a reveal is about to show — that hides it from crawlers and screen
   readers, and leaves it missing if the animation never runs.
3. **A semantic element on every wrapper.** Pass the real tag through `as`.
   Animated headings and landmarks must not become `div`s.
4. **One render loop for the page.** Every per-frame subscriber joins the
   shared ticker; a component never starts its own.
5. **Interruptible beats finite.** If a state can change mid-animation, the
   motion must resolve from wherever it currently is — which is why spring
   physics is usually the right `transition` for interactive state, and a fixed
   duration is usually right for a one-shot entrance.
6. **Reduced motion jumps to the end state.** Final position, final opacity,
   content readable. Never mid-transition, never hidden.

## Mapping the roles onto an engine

| Engine | `Reveal` | `ScrollProgress` | `Hover` | `Swap` |
|---|---|---|---|---|
| CSS only | IntersectionObserver toggles a class | scroll listener writes a CSS variable | `:hover` / `:focus-visible` transition | CSS transition on enter, or a view transition |
| Motion / Framer Motion | `whileInView` with `viewport` once | `useScroll` + `useTransform` | `whileHover` | `AnimatePresence` |
| GSAP | ScrollTrigger with toggle actions | ScrollTrigger with scrub | `gsap.to` on pointer events | timeline in / out |
| Canvas / WebGL | uniform or per-sprite alpha from the shared loop | scroll progress read once per frame | pointer-normalised uniform | state machine inside the render pass |

The mapping changes. The props, the modes and the grammar do not.

## Anti-patterns

| Anti-pattern | Why it hurts |
|---|---|
| A `useEffect` that calls `play()` for scroll-driven motion | Re-introduces the timing bugs the declarative modes exist to avoid, and fights the user's scroll |
| Hand-timed stagger, e.g. `delay: index * 137` | Drifts the moment content changes length; use `delayIn` increments |
| A `div` wrapping a heading "just for the animation" | Erases semantics; screen readers lose the outline |
| Passing class names into `from` / `to` | Mixes styling with motion and makes interruption unrepresentable |
| Two libraries doing the same job in one project | Three motion languages, three debugging models, three bundle costs |

## Related

[Engine selection](engine-selection.md) · [Text motion](text-motion.md) ·
[Per-frame architecture](per-frame-architecture.md) ·
[Visual QA](visual-qa.md)