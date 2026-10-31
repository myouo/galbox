# ADR0090: bounded per-channel image ceilings

ImageFilter may additionally specify channelCeil {red,green,blue}, each an integer
0..255 (protobuf tag 8). This is the finite gamma=1/floor=0 endpoint adjustment:
for nontransparent pixels output=floor(input/255*ceil+0.5), alpha unchanged. It is
applied before tint and box averaging. There is no generic shader or source code.

Programs using it must declare stage.channel-ceil so older readers reject the
new semantics. The 32-capability budget remains unchanged. Absent fields leave
existing image-filter bytes, signatures and pixels unchanged. It uses the same
source-bound static surface, clone sharing, candidate cancellation and workspace
limits; source dimensions, policy and origin are restored exactly.
