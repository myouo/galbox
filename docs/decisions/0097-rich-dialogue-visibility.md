# ADR0097: Dialogue visibility dominates rich glyph presentation

Keep dialogue hiding as a view-only projection. A hidden DOM text container must
remain visually hidden even when rich glyphs or Ruby explicitly set visibility
to visible. Retain the visibility flag and apply zero opacity at the owner root;
descendants cannot override ancestor compositing opacity. Mark the root aria-hidden.
Keep geometry measurable for font fitting and resize. Capture temporarily restores
the view and restores hiding synchronously, without changing the narrative cut.
No schema, snapshot, prompt or invocation ABI changes.
