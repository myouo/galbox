# ADR0100: Thumbnail-sized rasterization and a short narrative freeze

Capture DOM geometry, computed styles and embedded fonts synchronously at the
authoritative cut. Give the SVG an intrinsic size bounded by 320×180, preserving
its aspect ratio and original viewBox/foreignObject coordinate system. Avoid
rasterizing a full-screen foreignObject merely to shrink it to the thumbnail.
Contain-fit still uses that aspect ratio; custom TextCapture SVGs remain accepted.

The host copies stage pixels before its first async await. Once immutable stage,
text and scripted UI captures are owned, release the narrative freeze. SVG decode,
PNG encoding and durable flush may finish asynchronously while activation fencing
still prevents a half-prepared takeover. The saved snapshot, summary and image
remain one cut. Failed/cancelled captures never manufacture a successful save.
