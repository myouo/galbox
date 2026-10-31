# ADR0089: authored recording of rich text

A richPage may set recordHistory=false for displayed text excluded by an authored
history policy. The optional protobuf field is tag 9. Programs using the field
must declare text.history; older engines reject that capability. The existing
32-capability budget is unchanged. Omission preserves prior wire signatures and
behavior. The instruction source signature includes an explicit policy.

The text still advances normally, marks the read unit, confirms the text window
and applies voice-stop policy. Only the backlog/journal entry is suppressed.
There is no mutable global history switch or new snapshot state: producers lower
a source policy to each affected text instruction, including the final part of a
continuation. Restore validates that policy with the original text source.
History-only annotations and arbitrary source scripts remain outside this change.
