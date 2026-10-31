# ADR0087: restorable procedural raster effects

Add stage.raster / stage.raster.stop under a new stage.raster capability. The
finite effect union covers seeded film grain/scratches/flicker and finite image
accumulation with interpolated affine/square transforms and opacity. Authors
supply one source image and numeric parameters, never pre-rendered frame images.
Core owns source identity, origin, bounded duration/loop phase and task lifetime.
Stage objects retain a raster task reference; clone shares its phase and output.
Replacing an image detaches that reference. Collection keeps referenced finished
or cancelled effects until objects detach. Restore verifies source/config/clock,
image identity, references and the original module closure before activation.

The Web Host rasterizes into one reusable surface per referenced task, shared by
all targets and displayed through the existing Pixi image graph in both backends.
Film recomputes a bounded seeded phase; accumulation advances every declared
sample without retaining a frame array. Cold/large replay is prepared privately,
with cancellation and browser task yields, before commit. Failed preparation does
not replace the current surface. Device caches are not snapshot authority.
Surfaces/textures, overlap and source-color work count against existing workspace
budgets. Stop/removal/dispose release unreferenced surfaces. No Host timers or
Math.random are used. No TJS/plugin VM or game-specific Core paths are added.

Bounds: existing 128 objects/256 tasks/32 capabilities/wire/resource limits remain.
Film has at most 128 phases, 8 lines and 64 noise marks per phase. Images fit
1280x720; accumulation lasts at most 100000 ms with samples at least 16 ms apart.
An unsupported dynamic image transition/frame crop on a raster target is rejected;
group composition and ordinary pose/filter transforms remain supported.

This reduces distribution bytes rather than converting generated frames into a
video. Rendering/source parity, random sequence choice and rounding are reported
separately. Native original RNG streams and pixel algorithms are not certified.
