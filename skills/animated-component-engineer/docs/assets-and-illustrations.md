# Assets and Illustrations

## Asset workflow

1. Reuse project assets when suitable.
2. Confirm licensing and provenance for external assets.
3. Prefer SVG for simple scalable illustrations.
4. Use raster images for photographic detail.
5. Avoid embedding large base64 assets in source files.

## Generated visual assets

When an image-generation tool is available and the user explicitly wants a new image, define composition, aspect ratio, palette, focal point, negative space, and intended crop. Do not use a generated raster image as a substitute for a required editable SVG or working interaction.

## Illustration layers

Separate foreground, subject, atmosphere, and background when they need independent motion. Keep layer count and blur effects within a reasonable performance budget.
