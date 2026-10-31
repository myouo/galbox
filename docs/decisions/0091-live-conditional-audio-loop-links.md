# ADR0091: live conditional loop links on element audio

An audio.source.loop-region instruction binds a named, active looping audio.track
invocation to a finite backward link (fromFrame > toFrame, sampleRate 8–192kHz,
maximum two hours) and a boolean enabled flag. Parameters are static integers.
This is element/stream audio only; buffer audio is explicitly refused. New opcode
83 and audio.loop-region capability make older engines reject these semantics.

The track keeps its invocation, gain, fades, start request and current playback
position when the link changes. It checks forward crossings of the link point;
enabling after that point does not rewind immediately. Overshoot is carried into
the linked region. Turning the link off restores the original track loop policy.

MediaTaskState.loopRegion stores the last writer, signature and full definition.
Restore verifies that source and keeps its code in the module closure, including
returned writers. Existing restore=replay policy still restarts from zero; this
change does not claim saved media positions or sample-accurate seamless mixing.
Element timeupdate plus normal host frames service crossings; callback cadence,
codec seek granularity and native Smooth crossfades remain device limitations.
Candidate preparation validates actual duration before replacing the live head.
No new logical task, source-script VM, full audio decoding or input budget increase.
