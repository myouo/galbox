# galbox-sdk 当前状态

2026-10-26。H2-02有限Canvas合成集完成，分支feat/canvas-effects-composition、基线e241dd8，本地提交见git log。任务完整状态唯一来源tasks.json；下一G3-03。无外部发布/推送/部署。

同一Pixi场景图新增实例级透明filter栈/私有back buffer，支持既有blur/brightness/grayscale、最多四层权重crossfade、父子组/相机组滤镜，继续共用Core/DOM/React/IndexedDB。不再跳过或拒绝这些已实现效果；blend/未知效果/预算不满足仍明确失败。色矩阵/透明权重严格RGBA，blur用原生filter或CPU预乘Gaussian近似，非全平台逐像素保证。见ADR0022/GRAPHICS.md。

可选GraphicsOptions.maxCanvasBytes默认64MiB、最大512MiB；计划器计入back buffer/路径深度/padding/native scratch/色矩阵或CPU双工作区，候选在持久接管前预检。画面成功才一次提交；失败恢复context并立即释放自有中间面、同步诊断和暂停，保留上一canvas与head。缓存/数组有界，不清共享池。Core/任务/相对参数/快照wait ABI未改。

最终frozen install/check、152单元、72浏览器（0 skip/flaky）、strict/skipLibCheck=false仓库外tarball（Canvas完整舞台/便携备份/销毁）、58 CLI、4 synthetic、性能与API/pack/publish dry-run通过。先复现故障时诊断仍3686400字节，再修复并完整重验，证据evidence/h2-02/REPORT.md、原失败日志/像素JSON/源码清单。

SDK0.1.0 SHA=98affabc60c93354e1fbf21afdff215bb754c6ba5ca37b51881f539f911eedf8；CLI SHA=abdae8d8a563b1a56f8370915c06a8aa39e053b29c2ada1765412ad95be89817，consumer/CLI/audit/artifacts一致，本地UNLICENSED alpha，0新增/3声明变化/0删除。Snapshot wire=1未改。WebGL基线API P95 4.6ms、Core最重批次P95 1.537ms，活动销毁109.2/129.8/113.3ms，原500ms目标通过；不能当Canvas吞吐量/真实RAM/大作品保证。

当前dev已启动http://127.0.0.1:4173/?demo=stage&renderer=canvas 。Chromium --disable-webgl与原生API实测：活动20ms保存/刷新/继续结局再读旧槽，原目标x410/4已读/解锁/当前设置保留；2D=true/WebGL=false，合成当前/峰值20545536字节、4面，单canvas/0 pageerror。重启export TMPDIR=/dev/shm、pnpm install --frozen-lockfile、pnpm dev；browser前停dev释放4173/4174。

下一G3-03：视频编码/资源身份、热点输入、期限activation/暂停/恢复和保存策略先写有限ADR，再落Schema/工厂/Core/Host/原创浏览器与独立消费。G3-04网络流、图文存档/流程图/鉴赏/UI及G7未完成。N/F缺真实edition/Program/资源/原档/原作继续参照，独立blocked，M6未完成。
