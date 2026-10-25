# galbox-sdk 当前状态

2026-10-26。H2-01有限图像兼容集完成，分支fix/graphics-canvas-fallback，基线3ba6ab5，本地提交见git log。用户报告“This Host requires the declared WebGL backend”后优先修复；G3-03未开始。tasks.json为完整状态唯一来源，无外部发布/推送。

原Pixi已选择替代后端却被SDK WebGL硬检查拒绝。现在graphics.renderer=auto/webgl/canvas，默认WebGL2→Canvas2D、失败后备，强制模式不暗换。单Pixi场景图、同Core/DOM/React/IndexedDB。Schema生成选项类型/validator，resources.renderer/graphicsFallback报告设备，不入存档/profile；跨后端同槽/备份保留当前进度。

Canvas支持普通图像/alpha/二维pose/层级/矩形clip/相机/fade/shake/基本混合、既有正文/音频/输入/保存。GPU滤镜和隔离crossfade在资源获取/激活前明确拒绝，候选恢复也前置检查并保留旧head/槽；不静默忽略Pixi不能执行的filter。H2-02继续完整对等并为G7依赖，GRAPHICS.md/ADR0021明确边界。

最终frozen install/check、149单元、67 Chromium（0 skip/flaky）、仓库外strict/skipLibCheck=false/原生ESM消费者、58 CLI、4 synthetic、性能/API/pack/publish dry-run通过。consumer含禁用WebGL自动Canvas绘图/双Canvas实例隔离/GL读回同槽；实际GL初始化失败后备/取消迟到/坏候选保head通过。证据evidence/h2-01/REPORT.md与日志/JSON/截图/source-manifest.json。

SDK0.1.0 SHA=20f97afae5230ddc3ea1ac1b1e641687e2e3e00bdeb83e11bcb397103ee3fd6c；CLI SHA=abdae8d8a563b1a56f8370915c06a8aa39e053b29c2ada1765412ad95be89817，consumer/CLI/audit/artifacts一致，本地UNLICENSED alpha，4新增/2声明变化、0导出删除，Snapshot wire=1未改。WebGL性能回归API P95 3.4ms、Core最重批次P95 1.481ms，活动销毁169.2/89.6/88.8ms，原500ms目标通过；不能当作Canvas吞吐量或跨平台保证。

当前dev已启动http://127.0.0.1:4173/，强制兼容http://127.0.0.1:4173/?renderer=canvas。以Chromium --disable-webgl和原生getContext真实验Canvas：2D=true、WebGL=false，保存/刷新/海岸结局/再读旧槽后9已读/解锁/当前文字设置保留，单canvas/0 pageerror，见dev-result.json。重启export TMPDIR=/dev/shm、pnpm install --frozen-lockfile、pnpm dev；browser前停dev释放4173/4174。

下一H2-02：先定有界离屏合成/预算及滤镜对等，再实现透明层/父子/相机组处理和实际RGBA/独立消费，之后恢复G3-03视频/热点/限时交互。G3-04真正网络流、图文存档/流程图/鉴赏/UI及G7未完成。N/F仍缺真实edition/Program/资源/原档/原作继续参照，独立blocked，M6未完成。
