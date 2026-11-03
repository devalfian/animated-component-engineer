# Performance and Accessibility

## Performance

- Prefer transform and opacity for continuous animation.
- Avoid animating expensive shadows, filters, and large gradients continuously.
- Pause or stop offscreen loops when possible.
- Use `IntersectionObserver` for viewport awareness.
- Avoid state updates on every pointer or scroll event when refs or CSS variables suffice.
- Test on a lower-powered mobile device when feasible.

## Accessibility

- Use buttons for actions and links for navigation.
- Ensure all interactions work with keyboard and touch.
- Add visible focus states.
- Do not communicate state through color or motion alone.
- Keep meaningful text in the accessibility tree.
- Mark purely decorative elements as hidden from assistive technology.
- Honor `prefers-reduced-motion`.
