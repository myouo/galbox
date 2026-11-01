# ADR0096: Fast playback respects authored visual wait permission

Skip mode may emit one ordinary step per tick for a group/delay only when its
wait carries the prompt validated by `wait.skippable`. It uses the same Core
input path as a click; it never supplies synthetic elapsed time. Forced waits,
media/voice gates and operations remain barriers. Auto mode keeps natural visual
timing. At the next text, existing read/unread policy still applies. There is no
snapshot or invocation ABI change; old waits without a prompt keep old behavior.
