# galbox-sdk 0.1.0 本地 alpha 候选

M0–M5 的有限 alpha 门槛已完成；完整常用 GalGame 功能的 G0–G7 门槛尚未完成（见 COMMON_VN.md）；本地候选版本为 galbox-sdk 0.1.0 与 @galbox/cli 0.1.0。它提供一个正式 TypeScript Core/Host、Pixi 图像舞台、DOM 正文、React UI、IndexedDB、发布/预算/备份/显式迁移及开发工具。没有第二解释器、Rust/WASM Core 或演示专用剧情。

这是带明确范围的本地 alpha，不是稳定 API 或最终两作支持版。包仍为 UNLICENSED，npm 名称/权限未认证，没有真实 publish、Git push 或部署。N/F 与 M6 的真实兼容门槛仍未完成；所需最小输入见 [INPUTS_REQUIRED](INPUTS_REQUIRED.md)。

本地包：

| 包 | SHA-256 |
| --- | --- |
| artifacts/galbox-sdk-0.1.0.tgz | ffce829f33ce4bf95bf7d2546a0c9a2680cf50330a41d200f06810f5faf05a90 |
| artifacts/galbox-cli-0.1.0.tgz | f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1 |

当前 H1-01 加固后的 SDK consumer、CLI 项目和 release audit 的包摘要一致，见 [H1 证据](evidence/h1-01/REPORT.md)；M5-04 为先前基线。独立项目可以按 [CLI](CLI.md) 用两个 tarball 初始化；不用 workspace alias 或私有源码。[DEVELOPER_WORKFLOW](DEVELOPER_WORKFLOW.md) 覆盖真实扩展、完整调用迁移、合成来源和诊断任务。

```bash
export TMPDIR=/dev/shm # 仅本次机器 /tmp 配额受限；普通环境可省略
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
```

打开 http://127.0.0.1:4173/。原创《灯塔来信》有海岸/灯塔两条路线，实际媒体、普通进度与保存恢复；菜单可备份并恢复独立进度。新作品使用同一个 Program/Builder/Player 路径。构建 `pnpm build`；资源 profile/预算与发布文件见 [RELEASES](RELEASES.md)，备份/旧版失败保留见 [BACKUPS](BACKUPS.md)。

本地验收：`pnpm check`、`pnpm test`（76）、`pnpm test:browser`（35）、`pnpm test:consumer`、`pnpm test:cli`（50 条命令）、`pnpm test:compatibility`（4 synthetic）、`pnpm test:performance`、`pnpm test:release`。browser 需要空闲 4173/4174；先停止 dev。release 检查需要完整 Git 历史，默认 API 基线 308c1ae，可通过 GALBOX_API_BASELINE 明确指定。性能基线不是通用设备门槛，命令保留全部原始样本。

相对 M5-01 基线，新增 release 入口、发布/预算 Wire 类型与工厂、Player 的 release/resourceBudget/signal 选项及诊断视图、AssetRequest.maxBytes 和注册表描述。没有删除显式导出；8 条按入口计的声明发生变化，详细前后声明与可达类型文件摘要在 [release-audit.json](evidence/m5-04/release-audit.json)。这不是自动证明“没有破坏变化”：手写 PlayerView 数据需要新增诊断字段，CLI 修改 source/port 后必须先 assets build，原先未约束的素材现在会被有限 profile/预算拒绝。当前 TextId/revision 保留 @ 作为分隔符，含 @ 的旧 wire 数据仍保留供备份/显式迁移；合法增量组合超出 profile 既有限额时整批拒绝，不写坏持久记录。

版本分别管理：SDK/CLI=0.1.0，wire Snapshot/Program/备份/发布清单格式=1，Core 语义=galbox-core@1，作品内容 release、文本 revision、扩展 invocation 与 mapping 版本另行绑定。不会因“类型能编译”或清单匹配而跳过旧状态的帧、文本、等待或完整调用迁移。

已验证平台/性能见 [PLATFORMS](PLATFORMS.md)。当前 Linux/Chromium/SwiftShader 的 Core 批次/语义 API 目标通过；H1 三个完整活动周期的销毁为 111.6/230/119 ms、两帧观察 P95 50.7 ms（旧 alpha 活动销毁曾为 1673.6 ms，初始基线曾达 1805.3 ms），存在明显长尾。没有视觉输入延迟或 60 FPS 保证，三次创建/释放样本不能推及大作品。PNG/SVG/PCM16 和 float32 小样本实际可用，其他设备/声道组合不能由此推断。

主要限制：预算内整包预加载，主 chunk >500 kB，纹理只有 RGBA 估算，未测真实 VRAM；回执长期留存/大作品压力未认证；没有长媒体流或精确 seek、视频/热点/timed-choice、GPU 自动重建、跨系列迁移、代码签名或同 realm 沙箱；Windows/macOS、Firefox/Safari、移动真机/物理 GPU/headed 窗口、人耳音质未验证。

M6 需要锁定《水仙》《海市蜃楼之馆》具体发行版/语言/补丁、可用 Program 与资源、真实原档及全局附件、原作加载后继续参照，再做一条真实导入/继续/再保存切片。fixture-save@1 和自制素材不替代这些资料，当前不作商业作品兼容结论。

H1-01 按舞台变化绘制、及时 flush、隔离实例/全局资源并清理取消后的迟到 renderer。公开 API/存档格式未变。局部性能回归可用 `GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance`，诊断用 `pnpm profile:disposal`；后者是带测试探针的当前版本实验，不替代未包装生产测量。

G1-01 新增 settings 公共入口和持久玩家偏好；最新 SDK 包见 g1-01 证据，CLI 包不变。主题/文本/节点/控件声明来自作品，通用设置/存档/流程图/UI 系统应由 SDK 提供。其余 G 项不因底座已验收而计作完成。
