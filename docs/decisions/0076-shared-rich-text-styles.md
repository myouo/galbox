# ADR0076: Shared rich text styles

Complete chapters repeat the same sampled fade/shadow style thousands of times.
Keeping that repetition in every source run can exceed the bounded Program wire
budget. Add `Program.textStyles` (at most 128 named styles) and `styleId` on text
and ruby source runs, with public Builder/factory support and `text.styles` capability.

An individual run uses either an inline style or a declared style ID. Resolve
only the executing page (and its append prefixes), never expand the complete
Program. Runtime TextRun/history/snapshot still store their resolved styles.
The resolved definition participates in source signatures, so changing a used
style rejects an old continuation. Missing IDs, duplicate declarations, mixed
inline/reference styles and undeclared capability reject before execution.
Existing inline styles retain their signatures and behavior. No input budget
is raised. Modules keep their existing basic ADV support set.
