# ADR0122: Source-bound history-only rich text

Add text.rich completion=history and optional historyAppend presentation marker
(instruction field10, RichTextState field14). A public historyText factory emits
this mode. It appends a separate complete source-validated history record and
advances PC without replacing visible text/windows, waiting, reading/unlocking,
binding voice, changing text preferences or creating a rollback checkpoint.
The marker describes whether a skin should join the record to the previous text;
it never concatenates or edits an earlier source record.

Require text.history. History mode permits text/ruby/break runs, no timing/input
controls or animated styles, no appendFrom and no recordHistory=false. The saved
marker must match the source. History records have no window/voice, are complete
at zero text time, and cannot be restored as a current text wait/window entry.
Older modes and signatures remain unchanged when new fields are absent. Existing
schema/byte/entry/module/journal budgets remain. Source line buffers and partial
current text are separate consumer integration work.

Verify wire/public factories, hidden windows and visible-body isolation, no new
read/progress/voice/rollback, typed source styles and append order, demand module
source closure, cold save/refresh, and refusal of forged marker/source/phase and
invalid control combinations. Consumers still own explicit source output guards.
