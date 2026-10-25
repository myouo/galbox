# 当前实施计划

H2-01有限兼容集已完成，基线3ba6ab5、分支fix/graphics-canvas-fallback，本地提交见git log。用户WebGL硬检查报错已沿Schema/Host/同Pixi场景图修复，149单元/67浏览器/独立tarball/58 CLI/4 synthetic/性能/API及真正--disable-webgl开发实测通过。证据evidence/h2-01/REPORT.md，状态唯一来源tasks.json。

下一H2-02：明确离屏表面/缓存/内存上界，补Canvas滤镜、隔离透明crossfade、父子/混合与相机组处理，实际像素/生命周期/独立消费对等验收。完成后恢复G3-03视频/热点/期限语义。当前Canvas对这些GPU效果前置拒绝，不能由基本可玩计为全部效果已支持。

G3-04版本化网络流、G4–G7及N/F/M6仍未完成；真实资料阻塞独立保留。当前dev已启动http://127.0.0.1:4173/?renderer=canvas，browser前停dev释放4173/4174。命令export TMPDIR=/dev/shm，无外部发布。
