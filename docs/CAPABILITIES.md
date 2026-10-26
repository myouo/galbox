# 当前能力：有限 alpha 与通用功能扩建

具体通过状态由 tasks.json 与 evidence/ 给出；后续任务不因本表列出目标而计为完成。

| 能力 | 实现范围 |
| --- | --- |
| Core / ABI | 同步 TS、稳定地址、参数/返回槽/显式帧、单剧情流、预算续跑 |
| 值 | bool/string/checked i32/i64、位模式f64、null与有界有序list/dict；显式比较/转换，无隐式转换 |
| 图像 / 正文 | 单 Pixi（WebGL2 优先、Canvas 基础兼容，效果差异见 GRAPHICS）；有界二维pose/层级/裁切/混合、相机/基础滤镜/fade/crossfade/shake与独立属性任务；DOM ADV/NVL/多窗口、旧码点/新字素揭示、结构化 runs/Ruby/安全样式/段内速度停顿/fade-wave-shake、显完/advance、历史 |
| 任务 / 快照 | 固定 all-success 组，活动任务/引用结果/等待闭包；终态区分；部分任务恢复 |
| 媒体 | WAV/MP3/单流 Ogg Vorbis/Opus；验证 Blob 的长媒体 element 与 buffer、自然完成/等待、循环点、bus 淡化/语音 duck、当前正文重播；replay 从零/stop，不含网络流与精确 seek，见 MEDIA.md |
| 影片 / 互动 | opaque WebM/VP8及单Opus/Vorbis音轨，同Pixi canvas/WebGL与Canvas；startup/自然end/skip分离，replay/forbid；矩形热点/键盘、一次求值enabled、prepared启用屏障、活动期限/明示timeout和剩余时间恢复，见VIDEO/INTERACTIONS |
| 串流 / 完整性 | 显式版本化HTTP element媒体、条件HEAD/身份校验、中立取消/租约、expected/digest-verified/versioned-url分级；慢速Range渐进/恢复重验。URL等级依赖源站immutable契约，不冒充完整摘要，见STREAMING.md |
| 资源 | release 清单/注册表/Program/资源事实绑定，SHA-256 核验，有界流、取消后租约归还；预算内整包预加载；TrueType目录/真实字体准备与独有FontFace释放 |
| 工作 / 持久进度 | 同步工作 profile、冻结提交批次、幂等回执、修订冲突、普通已读/解锁自动提交 |
| 有状态操作 | 真实 codec/操作工厂、冻结表、每调用 State、signal wait、隔离和失败原子性、禁止重入 |
| 操作迁移 | args/resume ABI 相同时的 state 迁移；否则完整 SavedInvocation 迁移并重验；缺迁移拒绝 |
| 候选 recipe | 同一 Core dispatcher，有限 opcode/步数，拒绝真人/媒体等待/循环；候选失败全回滚 |
| SaveBridge | 来源/schema/version 强绑定；fixture-save@1 严格字节/摘要/附件校验；不透明准备计划 |
| 导入 | 新槽位/独立 profile/回执同事务；不自动激活；原始重建与普通保存的 onLoad hook 分离 |
| 激活 | 最终冻结/dirty 交接/重新读取 profile；profile + candidate + head 原子提交；owner/sequence 资格与 pending 恢复 |
| 默认 UI | React 菜单/选择/历史、导入报告/显式载入、跨刷新槽位选择；暂停原因与输入 epoch 隔离 |
| 打包嵌入 | protocol/core/port-kit/player/react/testing/save-bridge/diagnostics/backups/CSS 显式入口；独立 tarball 消费 |
| 便携备份/内容迁移 | 有界完整持久闭包；原子新分支恢复、上一修订、幂等回执；显式完整 release 迁移，缺映射保留旧档并拒绝 |
| 未实现 | 任意影片编码/seek/多片并发、角色跟随/非矩形热点、stored void/undefined/引用heap、原档导出、跨系列迁移、自动旧 release 获取 |

OperationSpec 与 recipe opcode 从 schema 生成。类型工厂由真实运行时校验支撑，readonly 不代替所有权。扩展为受信任同步 TS，不被称作同 realm 安全沙箱。

平台证据仅限当前 Linux + Playwright Chromium + 软件 WebGL/Canvas2D/Web Audio。没有移动真机、其他浏览器或人耳音质认证；当前参考环境的性能基线见 PLATFORMS.md。体积提示、整包预加载和长期回执留存的规模问题保留给 M5。

fixture-save@1 与消费者格式均为原创 synthetic，不提供 NScripter/KAG 或《水仙》《海市蜃楼之馆》的兼容声明。N/F 所需最小输入见 INPUTS_REQUIRED.md。

M4 提供实际 CLI/标准项目、SourceMap 与必要行为覆盖发布门槛、只读 saves analyze/verify，以及独立 tarball 扩展/完整调用迁移/合成 binding 的开发者工作流。Node/Vite 仅在 CLI；Core 不依赖它们。覆盖清单和标准候选校验不是原作忠实性认证。

备份格式、事务边界、迁移工厂与失败行为见 [BACKUPS](BACKUPS.md)。M0–M5 的历史有限集已经验收；G0–G7 完整通用集尚未完成，当前验证范围见各次证据。

M5-02 的发布/资源预算与设备失败规则见 [RELEASES](RELEASES.md)。只声明已执行平台证据；VRAM 仅 RGBA 估算，不冒充设备测量。

实际平台与性能范围见 [PLATFORMS](PLATFORMS.md)：Core/API 目标通过，软件渲染/释放有长尾，不承诺 60 FPS 或视觉延迟。

本地 0.1.0 alpha 候选与未完成的 N/F/M6 门槛见 [ALPHA](ALPHA.md)，不声明稳定 API 或真实两作支持。

H1-01 加固保持协议/API：静态舞台不重复提交，正文/进度仍推进；新 epoch/动画仍绘制，实例销毁保留共享 Pixi 池并释放本实例 context，取消后的迟到 renderer 也清理。最新证据见 [H1-01](evidence/h1-01/REPORT.md)。

用户要求的完整常用能力与实例职责见 [COMMON_VN](COMMON_VN.md)。G1-01 已落地的设置数据/系统提供主、BGM、voice、sfx 音量和文字间隔，独立于剧情 profile 持久化，默认 UI 可用，见 [SETTINGS](SETTINGS.md)。G1-02 自动阅读/已读快进、实例按键映射及显示辅助已实现，规则见 [PLAYBACK](PLAYBACK.md)；G2-01 结构化正文/Ruby/有限文字效果已实现，见 [TEXT](TEXT.md)；G2-02 的NVL/多文本框/主题布局与TrueType准备已实现；图文存档、流程图、鉴赏和剧本 UI 等 G 项仍未完成。

G0-02 的 bool/i32/string 表达式、checked 算术/短路/字符串/插值、显式 RNG 与完整恢复已落实，见 [EXPRESSIONS](EXPRESSIONS.md) 和 g0-02 证据；浮点/集合及其余 G 任务未完成。

G2-01 由公开 richText/richPage 工厂和同源 Schema 提供 text.rich，字素/停顿/效果状态进入快照，可见正文与历史恢复均验证源签名。原 text.page/template 的 codepoint 档保留语义，新 rich 使用固定分割版本；当前默认历史显示纯文本摘要，交互式历史仍待 G4。有限支持集见 TEXT.md、ADR0016，未测平台和未启用版式不据此宣称支持。

G2-02 的textLayout/主题/字体工厂、Core窗口指令、NVL确认条目闭包与隔离renderer端口见 [TEXT_LAYOUT](TEXT_LAYOUT.md)。必要字体加载先于激活，当前仅TrueType与显式system fallback，不把加载当作字形覆盖/所有排版认证。完整通用任务仍按tasks.json推进。

G0-03 的checked i64、位模式f64、null/有序集合与数据表达式已落地，包含profile.expression、原生入口规范化、嵌套所有权和完整迁移负例，见 [DATA_VALUES](DATA_VALUES.md)。i32旧语义保留，新Program类型不匹配的旧槽位明确拒绝；G3演出和后续系统继续。

G3-01舞台有限集见 [STAGE](STAGE.md)：一次解析表达式/相对参数、按属性冲突、取消/替换/finish、闭包恢复和真正Pixi/WebGL像素验证。图像效果不包含DOM正文/UI，空容器/非矩形mask/任意shader及未列效果仍不计支持；资源/任务规模及其它平台未认证。

图像设备：H2-01 使用同一 Pixi 场景图提供 WebGL2→Canvas2D 自动后备、强制后端与诊断，基本舞台/DOM/媒体/存档跨后端；Canvas 提供有界组滤镜/相机滤镜/隔离 crossfade（ADR0022），预算超限明确拒绝。见 GRAPHICS.md，不能借此声称所有 GPU 效果已对等。

G4-01 图文存档有限集见 [SAVES](SAVES.md)：同切点 DOM 正文+舞台 PNG、当前/上一修订同事务、固定摘要回执、手动/快速/循环自动槽、命名/确认覆盖/删除与管理 UI。自动默认关闭；自定义 renderer 缺 capture 需显式无图，不伪造图片。当前验收状态仅见任务表和证据。
