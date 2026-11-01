# ADR0099: Scripted pause of an element audio source

Add `audio.source.pause` under the existing `audio.sources` capability. It targets
one active element-backed media invocation and records a boolean plus its source
instruction address/signature in optional MediaTaskState.playback. Host pauses
only that element, leaving other sounds and the AudioContext running; resume
keeps its in-session currentTime. Buffer sources reject explicitly. New tracks
start without this state; stop/supersede and stale-attempt handling keep existing
rules. Restore validates the writer and closure; restore=replay still starts at
zero and preserves the paused flag, without claiming native seek compatibility.
No capability, task, resource or snapshot size limit is raised.
