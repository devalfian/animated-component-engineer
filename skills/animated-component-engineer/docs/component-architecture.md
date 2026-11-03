# Component Architecture

## Suggested structure

```text
components/
  interactive-feature/
    InteractiveFeature.tsx
    InteractiveFeature.module.css
    InteractiveFeature.types.ts
    index.ts
```

Adapt to the repository's established conventions; do not impose this structure blindly.

## Component guidelines

- Expose meaningful props rather than dozens of low-level animation knobs.
- Keep content data separate from presentation when multiple instances are expected.
- Use semantic HTML and native controls.
- Keep decorative animation isolated from business logic.
- Avoid global CSS leakage.
- Make animation optional or configurable only when that is a real product requirement.

## Lifecycle

Clean up event listeners, observers, timers, animation frames, and third-party animation contexts on unmount.
