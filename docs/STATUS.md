# galbox-sdk 当前状态

2026-10-25。G2-02已完成有限支持集，完整常用GalGame G0–G7仍在建设。分支feat/text-windows-layouts，基线2720eb4，本轮本地提交见git log。没有外部发布、push、部署或远程CI；tasks.json为完整状态唯一来源。下一项G0-03。

G2-02：Program.textLayout与主题/窗口/字体工厂，Core选窗/显隐/清页/换主题；ADV替换、NVL累积，确认段与唯一当前揭示分开，容量满明确拒绝，清窗不删全局history/已读。Snapshot保存布局/字体签名、active、各窗主题/显隐/确认条目与正文来源，恢复验证全部闭包，缺状态不猜迁移，旧无布局路径保留。规则见ADR0017、TEXT_LAYOUT.md。

TrueType字体通过provider/摘要/编码预算/发布事实与实际FontFace加载，在激活前就绪；失败/取消/迟到加载不泄漏，实例独有family只由自己释放。textRenderer工厂在资源就绪后创建，隔离Program/快照，默认createDomTextRenderer可包装复用；dispose后不render，已提交渲染失败留pending给新renderer接管。布局按逻辑画幅缩放，叠乘当前玩家字号/背景偏好。仍为单剧情流、单Pixi舞台。

原创《灯塔来信·双页值班簿》在/?demo=layout，三窗/ADV/NVL/主题/清页及原创Latin TrueType同生产路径。静态检查按AST区分window数据属性与设备全局，并实际测试window/globalThis.window/全局简写拒绝；strict/headless未放宽。fontTools4.60.1仅是隔离的可选字体重建工具，普通pnpm fixture直接用提交TTF，无Python消费依赖。

最终通过frozen install/check、114单元、48 Chromium（0 skip/flaky）、仓库外tarball strict/skipLibCheck=false/原生ESM与NVL/字体/renderer/便携恢复、54 CLI命令（含新字体构建/验证/打包/损坏拒绝）、4 synthetic、三个活动性能、API/pack/publish dry-run。证据evidence/g2-02/REPORT.md、日志/JSON/截图/source-manifest.json。首轮测试夹具分类/入口、启动读取prompt时序和CLI包装模块定位错误均保留；修正夹具后全量重验，不删断言或skip。

SDK0.1.0 artifacts/galbox-sdk-0.1.0.tgz SHA=6591a423544a250dc47a99f4252b64984f8407dc47c988b3e2d9b7ccf461d636；CLI SHA=3034e05a62f3c1dbada1d0a0ba56e6596081716a6cc22988c6f3567b874fc35e，consumer/CLI/audit一致。相对2720eb4按入口计21新增/12声明变化，无导出删除；Snapshot wire version=1可选窗口扩展，新Program缺窗口状态须迁移，旧二进制不承诺前向读取，不宣称稳定API。

参考性能：228次语义API P95 6.5ms、两帧观察P95 58ms、最重Core批次P95 1.300ms，三次活动销毁190.7/313.9/247.3ms，原500ms局部门槛通过。仅Linux/Chromium/SwiftShader/Web Audio，不承诺视觉延迟/60 FPS、真机/物理GPU/VRAM/全部字形/音质或大作品；整包预加载、chunk体积及规模限制保留。

运行export TMPDIR=/dev/shm（本机/tmp配额）、pnpm install --frozen-lockfile、pnpm dev。当前dev已启动：http://127.0.0.1:4173/?demo=layout 。实际UI保存/刷新恢复三窗/NVL、换主题、清页、继续结局再读旧槽，6条已读/解锁/当前字号保留、1字体loaded、1 canvas、0 pageerror，见dev-result.json与截图。browser前停dev释放4173/4174。

下一项G0-03：浮点/集合值族、通用数据表达式与明确迁移，补G3完整舞台演出的既定依赖。WOFF/WOFF2/可变字体、竖排/禁则/自动分页、G3演出/视频、G4图文存档/回溯、G5流程图/鉴赏、G6剧本UI和G7全面验收仍未完成。N/F缺edition/Program/资源/真实原档附件和原作继续参照，blocked独立保留；M6未完成，不以原创或synthetic冒充真实兼容。
