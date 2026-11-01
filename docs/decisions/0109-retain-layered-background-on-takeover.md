# ADR0109: Retain an unchanged owned background across activation epochs

An epoch invalidates media/callback ownership and the potentially discarded WebGL
foreground. It does not change the pixels of Stage's owned 2D background. Keep
that surface's existing content key across an epoch. The key still compares all
below-text objects, raster phases, camera, filters, shake and composition; changed
cuts redraw normally. Display resource leases overlap until the new frame is
rendered. Video replacement/removal, dialogue projection and device invalidation
keep their complete invalidation. No rendered image replaces semantic restore.
