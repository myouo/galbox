# ADR0085: authored window geometry changes

text.window.geometry changes a declared window's literal rectangle within the
existing 1280x720 coordinate system. It does not allocate a ninth window or alter
the immutable catalog. The last geometry writer and rectangle are snapshot state;
restore checks the exact instruction/window/value and retains its module origin.
A snapshot without overrides keeps the original catalog rectangle. Renderer uses
the resolved rectangle before fitting all text, including unrevealed text.
Window/theme/object/input budgets stay unchanged. Dynamic expressions, arbitrary
CSS and silent catalog migration are outside this finite capability.

The new opcode extends text.windows rather than adding another header flag.
Old decoders reject its unknown instruction variant; it cannot be silently read
as an older opcode. This leaves the existing 32 capability-entry bound intact.
The original TextWindow.rect inline wire shape is preserved (a ref wrapper would
break legacy bytes); TextRect is used only by new fields/instructions.
