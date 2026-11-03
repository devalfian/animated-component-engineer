# Performance Budget

"Feels smooth on my laptop" is not a measurement. This note gives numbers to
work against and the shape of the module that holds them, so a review can say
"this is outside budget" instead of "this feels heavy".

## Device tiers

Read the tier **once**, at mount. A device does not change tier mid-session, and
rebuilding buffers on resize costs more than the mismatch is worth.

```ts
export type DeviceTier = 'mobile' | 'tablet' | 'desktop'

const MOBILE_MAX = 768
const TABLET_MAX = 1180

export const deviceTier = (): DeviceTier => {
  if (typeof window === 'undefined') return 'desktop'
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  if (window.innerWidth < MOBILE_MAX || coarse) return 'mobile'
  if (window.innerWidth < TABLET_MAX) return 'tablet'
  return 'desktop'
}
```

The pointer query matters more than the width: a phone in landscape is wider
than a tablet in portrait and still has a coarse pointer and a weak GPU.

## Pixel ratio

Cap what you render, not what the user bought.

| Tier | Clamp | Why |
|---|---|---|
| mobile | `min(dpr, 0.85)` | decorative scenes are fill-bound; 0.85 is invisible and cuts roughly a third of the fragments |
| tablet | `min(max(dpr, 0.75), 1.5)` | |
| desktop | `min(max(dpr, 0.75), 1.5)` | uncapped DPR is the most common cause of a 3D scene dying on a Retina laptop |

Do not lower the ratio below 1.0 for hard-edged work — thin lines, warp streaks,
in-shader text aliases visibly. Lower it for soft, decorative, photographic
content.

## Frame budget per tier

| Tier | Target | Frame budget |
|---|---|---|
| mobile | 30fps for continuous scene work | 33ms |
| tablet | 45fps | 22ms |
| desktop | every rAF tick | 16ms |

A decorative scene at 30fps on a phone is the single largest win available, and
a throttled subscriber costs nothing to the springs sharing the same loop — the
throttle is per subscriber, not global.

## Energy saver

iOS Low Power Mode has no API. The nearest web-exposed proxies:

```ts
export const isEnergySaver = (): boolean => {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean }
    deviceMemory?: number
  }
  if (nav.connection?.saveData === true) return true
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory > 0) {
    return nav.deviceMemory <= 2
  }
  return false
}
```

When it trips, play the entrance once and then freeze on a settled frame rather
than looping. A frozen scene costs nothing on scroll or idle.

## The budget itself

Work down this list. The upper rows are almost always the real cause.

| Cost | Budget | Notes |
|---|---|---|
| Elements animated simultaneously | a handful, not a section | every animated layer is a compositor layer |
| Large animated areas | one per viewport | a full-bleed blurred layer is the most expensive thing on the page |
| `filter: blur()` animated | avoid entirely | animate a pre-blurred image's transform instead |
| Simultaneous continuous loops | 1 | one ticker, gated per section |
| DOM nodes added for animation | 0 | animation does not need wrapper elements |
| Particle count | tier it — high hundreds on desktop, low hundreds on mobile | one DOM node per particle is never acceptable |
| `will-change` | only around the animation | permanent promotion costs memory |
| Third-party animation bundle | justified by a measured need | see [engine selection](engine-selection.md) |

If a section is over budget, the answer is usually to animate fewer things, not
to optimise more things.

## Compositor hygiene

- `transform` and `opacity` only, for anything continuous.
- Promote a canvas or a heavy animated wrapper deliberately:
  `transform: translateZ(0)`, `backface-visibility: hidden`,
  `will-change: transform`. Without it, a neighbouring repaint can invalidate a
  WebGL composite on WebKit and the scene flickers.
- All scroll and pointer listeners `{ passive: true }` unless they genuinely
  need to prevent default.
- Clamp `delta` in the loop, otherwise a returning tab teleports everything.
- Never animate `box-shadow` or `filter` continuously. Animate a pseudo-element's
  opacity instead.

## iOS and WebKit gotchas

These are not edge cases on a client site. They are the mobile web.

- **Size the canvas against the largest viewport** (`100lvh` / `100lvw`), not
  `100vh`, so a collapsing URL bar never re-allocates the framebuffer. The
  extra bleed is clipped and invisible.
- **The content uses `dvh`, the canvas uses `lvh`.** Applying `lvh` to layout
  is a different bug: the bottom of the page hides behind the URL bar.
- **No `resize` listener on touch.** iOS fires `resize` every time the URL bar
  collapses during scroll; rebuilding a framebuffer mid-scroll reads as a
  whole-scene flash. Size once on load; keep a desktop-only rAF-coalesced
  resize.
- Sticky positioning, scroll-driven CSS, in-page find and smooth-scroll libraries
  fight each other. When a section breaks, the fix is usually to stop
  overriding scroll for that section, not to add a workaround.

## Measuring honestly

| Measure | Not |
|---|---|
| counted quantities: draws, vertices, listener count, DOM nodes, long tasks | fps from a headless browser (SwiftShader is not a GPU) |
| the production build, fresh server | the dev server, which double-mounts and serves eagerly |
| a throttled CPU (4x / 6x slowdown) across a full scroll | a desktop profiler snapshot alone |
| a real mid-range phone | the laptop |

Re-measure the same quantities after the change and report the delta. A number
you did not take before and after is an opinion.

## Accessibility numbers worth memorising

| Check | Value |
|---|---|
| Narrowest layout without horizontal overflow | 320px |
| Minimum touch target | 44 by 44px |
| Body text contrast | 4.5:1 |
| Large text contrast (18.66px bold or 24px) | 3:1 |
| Focus indicator | visible at all times, never removed without a replacement |
| Reduced motion | content present, readable, in its final position |

## Related

[Per-frame architecture](per-frame-architecture.md) ·
[Engine selection](engine-selection.md) · [Visual QA](visual-qa.md)