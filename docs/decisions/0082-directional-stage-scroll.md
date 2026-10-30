# ADR0082: directional group scroll

Extend the existing bounded stage.mix scroll-top method with scroll-right,
scroll-bottom and scroll-left. The incoming world-root group enters from the
named edge while the outgoing group moves toward the opposite edge. Progress,
root membership, independent child motion, camera, source signature and restored
phase use the existing composition task. No new timer, snapshot field, object,
texture or resident-budget exemption is introduced. Source adapters must reject
unsupported stay semantics; this contract describes moving both groups.

Verify the four directions at mid-transition through protobuf restore and actual
Canvas/WebGL composition/illustrated-save pixels, including camera boundaries.

Scroll groups share a fixed 1280×720 local viewport mask before camera transform.
This prevents translated images from bleeding into camera-exposed outside areas
and keeps Canvas/WebGL pixels aligned without another offscreen surface.
