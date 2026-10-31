# ADR0092: authored overlay screens and sprite buttons

UICatalog screens may opt into overlay=true. Buttons may carry a graphic with
an image asset, three horizontal frames (normal/hover/pressed), native frame
size and optional enter/click UISound requests. These features require
ui.artwork; older engines reject the capability. Existing controls/screens
and signatures are unchanged when fields are absent.

Core still owns visibility, enabled state, pending/active generation and
branch writes. Device artwork/sound is not another story controller. Resource
closure includes the sheet and cues, validates dimensions and buffer audio,
and prepares them before activation. Static graphic fields remain restore-bound.
Overlay images have no default panel chrome. Logical UI follows both viewport
axes; responsive flow layout keeps its existing policy. Image buttons keep the
same press gesture/epoch protection and do not create frame sequences.
