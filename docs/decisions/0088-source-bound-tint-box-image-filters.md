# ADR0088: source-bound tint/box image filters

Add stage.image.filtered as one atomic image instruction. Its literal RGBA8 tint
and clipped rectangular box kernel are image-space operations before pose/group
filters. Snapshot imageFilter retains source asset, configuration, instruction
address/signature; clone shares its verified origin. Asset/image replacement
clears it. A returned writer is part of the cold module closure. No extra logical
task, tick, frame or story interpreter is introduced.

The finite alpha8 arithmetic follows the published KRKR2 color-on-alpha and box
reference rules: destination-aware 8-bit tint, premultiplied channel sums, clipped
edge windows, integer averaging/unpremultiplication. Portable reference and actual
native SIMD/runtime pixel certification remain distinct evidence. Image filters
are literal, at most 1280x720 with radii 0..32 and opacity 0..255.

Web preparation shares one surface per source/config across copies, works on
private candidates, yields/checks cancellation by bounded row batches and commits
only with the existing Host preparation. Buffers/surfaces/texture overlap count
against the unchanged workspace budget. Existing Pixi Canvas/WebGL display paths
consume the same output. Old instruction variants and wire tags stay unchanged;
old decoders reject the new opcode. It uses the stage.raster capability.

Verify small independent numeric/reference goldens including alpha/edges, source
and state tampering, returned module writers, actual Canvas/WebGL cold capture,
cancellation/failure cleanup, and the independent original-image heartbeat slice.
