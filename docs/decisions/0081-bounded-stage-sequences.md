# ADR0081: bounded image/pose sequences

Add a standard stage.sequence task for finite frame/pose schedules and loops.
Each schedule has at most 128 duration-bearing steps and 64 existing targets,
an optional initial delay, a required image identity and replace/reject policy.
Only targets currently using that image are projected, so explicitly declared
front/back targets keep one phase when ordinary stage.clone copies their image.
Changing an image suspends projection on that target; it does not rewrite the
new image or infer a story action. Explicit stop/removal cancels the task.

Core owns the active-time origin, phase and final completion. Snapshot retains
the exact source, schedule and clock; restore verifies both task and projected
frame/pose without restarting the sequence. No Host timers, animated-image
decoder side effects or work-specific Core branches are introduced. All input,
snapshot, stage-object, task and resident-resource limits stay unchanged.

The converter may prepare sprite atlases or sampled presentation schedules from
data-only source definitions. It must report sampling/random-sequence fidelity
limits separately. Unsupported schedule bodies and malformed clocks fail.
Verify variable durations, delay, loop/stop, page copy, asset replacement,
modular cold restore and actual Canvas/WebGL pixels/capture.

Sampled additive motion also accepts `step-end` easing on existing bounded
MotionTrack segments. It holds the previous sample until the boundary, then
applies the next one. Existing 32-segment, offset and duration limits remain;
converters can fold redundant hold samples while preserving their boundaries.

Pose samples contain only their declared numeric channels. Every step must use
the same frame/pose channel set, so a large tick and a sequence of small ticks
project the same result; omitted historical channels cannot make phase depend
on device tick granularity. Unmentioned transforms remain unchanged.
