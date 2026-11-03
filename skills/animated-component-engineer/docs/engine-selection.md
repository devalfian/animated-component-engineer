# Engine Selection

| Need | Preferred approach | Notes |
|---|---|---|
| Button, card, menu transitions | CSS | Lowest overhead; use transform/opacity where possible |
| Reveal on viewport entry | CSS + IntersectionObserver, or existing motion library | Trigger once unless repeated behavior is required |
| Coordinated React transitions | Existing Motion/Framer Motion library | Check installed package and version first |
| Complex timeline / scroll choreography | GSAP | Scope and clean up contexts and ScrollTriggers |
| Vector line drawing | SVG + CSS/JS | Keep paths optimized |
| Particle field / many sprites | Canvas | Avoid one DOM node per particle |
| Real-time 3D scene | WebGL / Three.js | Use only when 3D is essential |

## Decision rules

1. Inspect `package.json` and lockfile.
2. Prefer existing dependencies.
3. Prefer browser-native APIs for simple needs.
4. Add a dependency only when it materially reduces complexity or enables a required capability.
5. Document the reason for a non-trivial engine choice.
