# Per-Frame Architecture

Most animation jank is not an easing problem. It is too many loops, too many
layout reads, or too much React state — each individually reasonable, fatal
together on a mid-range phone.

This note is the structural half of the skill. Read it before optimising a
curve.

## One render loop for the whole page

Every per-frame subscriber goes through **one** `requestAnimationFrame` loop. A
page with twenty scroll-driven elements runs one rAF, not twenty.

Contract:

```ts
subscribe(cb: (frame: Frame) => void, options?: { framerate?: number }): () => void

type Frame = { time: number; delta: number; frame: number }
```

Rules for the implementation:

- **Reference counted.** Starts on the first subscriber, stops when the last
  one unsubscribes. An idle page costs nothing.
- **Paused while the tab is hidden**, via `visibilitychange`. A background tab
  renders nothing.
- **One debounced `resize` listener**, shared the same way. Never one per
  component.
- **Per-subscriber throttling** through `framerate`, so a canvas scene can run
  at 30fps without slowing the springs beside it.
- **A smooth-scroll library is driven from the loop**, not the other way round.
  If the project uses one, call its `raf(time)` from the tick and never let it
  start its own loop.

Sketch:

```ts
type Frame = { time: number; delta: number; frame: number }

const subs = new Set<Sub>()
let raf = 0
let last = 0

const tick = (time: number) => {
  const delta = Math.min(50, time - last)  // clamp: a returned tab hands us seconds
  last = time
  for (const sub of subs) {
    if (sub.every > 0 && time - sub.since < sub.every) continue
    sub.since = time
    sub.cb({ time, delta, frame })
  }
  raf = requestAnimationFrame(tick)
}

export const subscribe: Subscribe = (cb, options) => {
  const sub: Sub = {
    cb,
    every: options?.framerate ? 1000 / options.framerate : 0,
    since: 0,
  }
  subs.add(sub)
  if (subs.size === 1) {
    last = performance.now()
    raf = requestAnimationFrame(tick)
    document.addEventListener('visibilitychange', onVisibility)
  }
  return () => {
    subs.delete(sub)
    if (subs.size === 0) {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }
}
```

`delta` must be clamped. A tab backgrounded for two minutes returns a delta
measured in seconds, and everything with velocity teleports.

## Read layout once per frame, in the loop

Reading layout (`getBoundingClientRect`, `offsetHeight`, `scrollY`,
`getComputedStyle`) forces the browser to flush pending style and layout. Doing
it inside a scroll or pointer handler **that also writes styles** produces a
forced reflow on every event — the classic read-write-read-write thrash.

| Wrong | Right |
|---|---|
| each component measures itself on `scroll` | the loop measures shared geometry once per frame |
| write styles in the handler that just read them | collect reads, then all writes |
| `window.innerWidth` read per component per frame | one viewport width, passed down |

Practically: subscribe to the ticker, read geometry once at the top of the
callback, then write. Never interleave.

## Do not put per-frame values in component state

`setState` per frame schedules a React render per frame. With three such
components the page is re-rendering 180 times a second for no benefit.

| Value | Where it lives |
|---|---|
| Continuously changing transform / opacity | written directly to the element's `style` or a CSS custom property from the loop |
| Scroll progress driving CSS | a CSS custom property on a container, consumed by `calc()` |
| Discrete thresholds (entered, crossed, done) | state — it changes a handful of times, not sixty |

The rule: **state for discrete transitions, refs and CSS variables for
continuous values.**

## Interruption and velocity

An animation that can be reversed mid-flight must resolve from where it
currently is, with the velocity it has. Fixed-duration keyframes cannot: they
either jump or restart. That is the real argument for physics-based transitions
on interactive state — not aesthetics.

If you use durations, at minimum make the reverse path continuous: read the
current computed value as the new start instead of re-declaring the original.

## Cleanup contract

Every component that touches a timer or an observer returns cleanup. On unmount:

- unsubscribe from the ticker
- `cancelAnimationFrame` for anything it started itself
- `removeEventListener` for every listener it added
- `disconnect()` every `IntersectionObserver`, `ResizeObserver`,
  `MutationObserver`
- kill animation-library contexts — a GSAP `ScrollTrigger` or timeline, a Motion
  playback control, a Lottie instance
- for a canvas scene: stop the loop, dispose geometries, materials, textures

An animation that keeps running after unmount is a leak. It surfaces as CPU
burn on a long session, not as a visible bug.

## Offscreen and hidden-tab gating

- Do not animate what is not visible. Gate continuous loops on an
  `IntersectionObserver`, so a section four screens down costs nothing.
- Do not keep drawing a settled canvas. WebGL keeps the last frame; freezing
  after the entrance animation is free.
- Do not `will-change` everything. It promotes layers permanently and costs
  memory. Apply it around the animation, then remove it.

## Checklist

- [ ] One rAF loop for the page; no per-component loops
- [ ] The loop pauses when the tab is hidden
- [ ] One debounced resize listener
- [ ] Layout read once per frame, never interleaved with writes
- [ ] No `setState` in the per-frame path
- [ ] `delta` clamped
- [ ] Every subscription, listener and observer disposed on unmount
- [ ] Offscreen work gated

## Related

[Motion vocabulary](motion-vocabulary.md) ·
[Performance budget](perf-budget.md) · [Engine selection](engine-selection.md)