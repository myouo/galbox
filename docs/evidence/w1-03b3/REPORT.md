# W1-03B3A / G2-07 progress

2026-10-31. ADR0084 binds an explicit old module source, validates its saved
closure before the mapper and prepares/validates the complete target closure.
The Web helper uses existing verified code leases and cancellation. Player keeps
freeze/dirty flush and the existing activation CAS; original slots are preserved.
ADR0085 adds bounded source-backed text-window rectangles, restored by their
last writer and included in module closure. Existing window count stays eight.

Current actual checks: 403 full units plus the additional old-module catalog
case passed; 4 related browser cases passed (classic/module migration and
Canvas/WebGL actual geometry/illustrated save). Sequential check passed. The
independent instance is still consuming/building the new package; acceptance
and task statuses remain in progress pending its old-save and connected routes.
Recipes/SaveBridge/history rollback remain explicit unsupported B3 work.
