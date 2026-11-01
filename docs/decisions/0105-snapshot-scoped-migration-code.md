# ADR0105: Plan target migration code from a validated source snapshot

An optional trusted targetFunctions callback declares a bounded list of target
functions after the original snapshot has passed source restore validation. The
SDK checks IDs against the registered target ModuleProgram and prepares their
verified closure before invoking the mapper. Existing requiredFunctions remains
supported; missing mapped-result code is still prepared and fully validated.

Cancellation fences both planner and loader. No mapped snapshot or prepared code
activates a head on planner failure. The source/profile passed to the planner are
immutable; no consumer private engine imports or second narrative VM are needed.
Read-unit catalog scanning is only needed when a mapper returns read aliases.

The work-specific planner maps source snapshot writer/stack/text/UI origins using
its declared manifest and verified leaf aliases, instead of requesting all target
chapter functions. This is code selection, never a substitute for original source,
byte/ABI/link or complete candidate restore validation. No wire ABI changes.

An explicit sourceModuleScope=snapshot opt-in canonicalizes only the code binding
after validating the original declared binding. It retains every actual stack/text/
task/UI/filter writer and static dependency. Default declared scope preserves
existing migration callbacks that inspect extra source functions/read aliases.
Same-release Player loads likewise validate the original binding before using
bindSnapshot to omit historical, unreachable code; the stored slot is untouched.
