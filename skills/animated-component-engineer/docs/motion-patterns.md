# Motion Patterns

## Core properties

Prefer `transform` and `opacity` for frequent animation. Animate layout properties only when necessary and tested.

## Common patterns

- **Entrance:** opacity + small translate; avoid large theatrical movement for routine content.
- **Stagger:** use short, consistent offsets; preserve reading order.
- **Hover:** subtle elevation, border, color, or icon response; provide focus-visible equivalent.
- **Scroll progress:** map progress to a small number of meaningful properties; avoid hijacking native scroll.
- **Parallax:** use sparingly and disable or simplify for reduced motion and touch devices.
- **State transition:** make success/error/loading states explicit and interruptible.
- **Cursor response:** clamp movement, keep the hit target stable, and provide non-pointer alternatives.

## Timing guidance

Use timing appropriate to distance and importance. Small controls generally need shorter transitions than section-level storytelling. Avoid rigid universal durations; tune by testing the actual component.

## Reduced motion

When `prefers-reduced-motion: reduce` is active:
- Remove non-essential parallax, looping, and large transforms.
- Replace spatial movement with immediate state changes or subtle opacity.
- Never hide essential content behind an animation.
