# H2-01：无 WebGL 兼容路径

2026-10-26，分支 fix/graphics-canvas-fallback，基线 3ba6ab59364499c86fec5833b4cd1fdd3ff5144d。用户实际报告 GRAPHICS_UNAVAILABLE: This Host requires the declared WebGL backend，优先修复设备兼容性；G3-03 尚未实施。H2-01 有限支持集完成，完整通用 GalGame 功能仍未完成。

## 根因与实现

锁定 Pixi 8.22.0 的 autoDetectRenderer 会在 preference=webgl 不可用时选择其它 renderer；原 SDK 随后的 instanceof WebGLRenderer 检查拒绝替代后端。现已改为公开 graphics.renderer=auto/webgl/canvas，默认只按 WebGL2→Canvas2D 选择，不未经验证进入 WebGPU。Canvas 是同一 Pixi 场景图，只有一个舞台 canvas，Core/coordinator/正文/React/IndexedDB 不变。用户新需求授权原 WebGL-only 约束调整，记录 ADR0021，AGENTS/架构已同步。

GraphicsOptions 由单源 Schema 生成类型和 validator；运行时 unknown 经 parseGraphicsOptions 校验/复制，拒绝未知后端与额外字段。强制 webgl/canvas 不暗中改变设备。Host 在实际 context 不可用、实际 GL 初始化失败时均可后备；创建失败/cancel/迟到完成清理自有 view/renderer/context，不清共享 Pixi 池。单独 WebGL flush 保留，Canvas 不调用 gl。resources.renderer/graphicsFallback 报告实际选择，不入存档或 profile。

Canvas 当前覆盖基本图像/alpha/二维变换/层级/矩形 mask/相机/fade/shake/basic blend，既有 ADV/NVL/富文本/音频/输入和保存系统共用。实际 blend 映射不可用会拒绝。Pixi Canvas 对通用 GPU filter 可能静默跳过，而现有 crossfade 依赖 AlphaFilter 隔离合成；SDK 因此在资源获取与激活前扫描所有分支，对滤镜、多图层/隔离 crossfade 明确 GRAPHICS_FEATURE_UNSUPPORTED。恢复计划也在持久提交前校验，不换 head、不删槽、不跳过效果。H2-02 保留完整对等，并加入 G7 依赖。

## 最终实际执行

所有命令 export TMPDIR=/dev/shm，避免本机 /tmp 配额。命令在基线 HEAD 的修改工作树运行；日志 revision 是当时 HEAD，最终源码由 source-manifest.json 和本地提交对应，不表示基线本身已有改动。

| 命令 | 最终结果与证据 |
| --- | --- |
| pnpm install --frozen-lockfile | install.log；无新依赖/锁文件变化 |
| pnpm generate；pnpm check | generate.log/check.log；生成一致、strict/headless/导入边界与真实公开选项类型正反例通过 |
| pnpm test | unit.log；20 文件、149 测试通过；没有修改 Core/Runtime 语义或删旧断言 |
| GALBOX_EVIDENCE_DIR=docs/evidence/h2-01 pnpm test:browser | browser.log/browser-results.json；build+harness+67 通过，0 skip/flaky/unexpected |
| 同 evidence 环境 pnpm test:consumer | consumer.log/consumer-result.json；仓库外真实 tarball、strict/skipLibCheck=false、Node 原生 ESM、禁用 WebGL 的 Canvas 实际绘图/保存、两个同时活动 Canvas 的销毁隔离、GL 读回同槽通过；补双实例用例后只重跑受影响的 consumer |
| pnpm test:cli | cli.log/result.json/commands.json；58 真实命令与模板/开发任务/迁移/字体/压缩媒体/实际浏览器及 dev HTTP 通过 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json；4 synthetic 通过，N/F 继续 needs-input |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；原 Core/API/三次活动销毁门槛通过 |
| GALBOX_API_BASELINE=3ba6ab5 pnpm test:release | release.log/release-audit.json；strict 声明检查、4 新增/2 声明变化（按入口计）、0 导出删除、SDK/CLI pack 与 publish dry-run 通过，无外部发布 |
| pnpm dev；node docs/evidence/h2-01/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-canvas.png；Chromium 真正用 --disable-webgl 启动、保留原生 getContext API，Canvas 启动/保存/刷新/海岸结局/再读旧槽保留 9 已读和解锁/文字设置，0 pageerror |

七项新增浏览器测试：

1. webgl/webgl2 获取拒绝后默认自动 Canvas，原创标准小说两条路线、真实音频、IndexedDB 保存刷新、当前普通进度保留。
2. 原生 Canvas 实际 RGBA 像素检查 mask/父子裁剪、旋转、相机、fade、alpha、add/multiply/screen，不由截图外观猜正确。
3. WebGL→Canvas→WebGL 同槽位、便携备份和旧槽不回写当前已读。
4. 强制 WebGL、缺滤镜/隔离转场及全部图像设备失败，acquire=0、head=null、无遗留 canvas。
5. 迟到 Canvas 初始化取消后恰好销毁一次，未获取资源、未激活，借用 store 保持可读。
6. 原生 GL context 创建后注入 Application.init 失败，context 实际 isContextLost=true，自动后备 Canvas；强制模式不后备。
7. 不支持的恢复候选在持久接管前拒绝，当前 head/场景与原槽不变。

保留既有真实 WebGL RGBA、两实例共享池/销毁、迟到 GL 初始化、音频、文字、任务、扩展和存储故障回归。独立消费者另验证同时活动的两个 Canvas，销毁一个后另一个仍能保存/加载，公开 API 不受干扰。

## 实测与包

SDK 0.1.0 artifacts/galbox-sdk-0.1.0.tgz SHA256：20f97afae5230ddc3ea1ac1b1e641687e2e3e00bdeb83e11bcb397103ee3fd6c。
CLI 0.1.0 artifacts/galbox-cli-0.1.0.tgz SHA256：abdae8d8a563b1a56f8370915c06a8aa39e053b29c2ada1765412ad95be89817。
最终 consumer/CLI/audit/实际 artifacts 一致。版本仍为 UNLICENSED 本地 alpha，0 外部 publish/push/部署/远程 CI；Snapshot wire=1 未改剧情格式，设备选项独立。既有槽位/资源 manifest 不需因后端而重写。

标准小说 WebGL 性能回归：228 次语义 API P95 3.4ms、两帧观察 P95 39.1ms、最重 Core 批次 P95 1.481ms；三次活动销毁 169.2/89.6/88.8ms，原 500ms 门槛通过。不能将这些 WebGL 基线数字当作 Canvas 性能认证；本项 Canvas 验证的是实际画面/玩法/状态与失败边界，未作大作品吞吐量或所有平台保证。估算纹理字节不是实际 RAM/VRAM。

原生无 WebGL 开发实测：renderer=canvas，fallback=WebGL context unavailable，原生 2D=true / WebGL=false，实际样点 RGBA=[42, 60, 78, 255]；恢复前后 stage/wait 相同，9 已读/shoreUnlocked/文字间隔 0 跨刷新保留，单 canvas，pageErrors=[]。不是只启用软件 WebGL。

## 失败与修复记录

graphics-browser-first.log 保留首轮跨后端备份测试将 receipt.slot 写成 sourceSlot，误选旧槽的失败；修正测试字段后 graphics-browser-second.log 的新场景及销毁回归 10 项通过，最终完整 browser.log 67 项通过。初次 strict 编译也发现原生 context 用了 WebGL1/2 联合，而锁定 Pixi 只接收 WebGL2；收窄为明确 WebGL2，设备缺失走 Canvas。没有断言放宽、永久 skip、双重断言或禁用 strict。

## 限制与接续

本任务没有实现 Canvas GPU 滤镜/隔离交叉淡化或 WebGPU；这些仍为 H2-02，不静默替代。运行中的 GL context lost 仍暂停并可保存，需新建 Canvas Player 后读档，本项不热切正在运行的设备。

下一项 H2-02：有界中间表面/内存预算、父子/混合/透明层和相机组滤镜的 Canvas 对等与实际 RGBA 验收，再恢复 G3-03 视频/热点/限时交互。G3-04 网络流、G4–G7 及 N/F/M6 尚未完成。N/F 仍缺明确 edition、Program/资源、原档和原作继续参照。

当前 dev 已启动 http://127.0.0.1:4173/ ，可强制 http://127.0.0.1:4173/?renderer=canvas 。重启 export TMPDIR=/dev/shm，pnpm install --frozen-lockfile，pnpm dev；构建 pnpm build。browser 前停 dev 释放 4173/4174。完整状态见 ../../tasks.json。
