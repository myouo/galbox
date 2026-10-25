# 当前能力：M0–M5 本地 alpha

具体通过状态由 tasks.json 与 evidence/ 给出；后续任务不因本表列出目标而计为完成。

| 能力 | 实现范围 |
| --- | --- |
| Core / ABI | 同步 TS、稳定地址、参数/返回槽/显式帧、单剧情流、预算续跑 |
| 值 | bool/string/checked i32；eq/lt；无隐式转换 |
| 图像 / 正文 | 单 Pixi WebGL；绝对 x/y/alpha 线性动画；DOM ADV、码点揭示、显完/advance、历史 |
| 任务 / 快照 | 固定 all-success 组，活动任务/引用结果/等待闭包；终态区分；部分任务恢复 |
| 媒体 | Web Audio 短 WAV、真实获取/解码/启动/重试、音量；显式 replay/stop，不提供采样点精确续接 |
| 资源 | release 清单/注册表/Program/资源事实绑定，SHA-256 核验，有界流、取消后租约归还；预算内整包预加载 |
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
| 未实现 | timed-choice、视频/热点、relative 动画、其他 source 值族、原档导出、跨系列迁移、自动旧 release 获取 |

OperationSpec 与 recipe opcode 从 schema 生成。类型工厂由真实运行时校验支撑，readonly 不代替所有权。扩展为受信任同步 TS，不被称作同 realm 安全沙箱。

平台证据仅限当前 Linux + Playwright Chromium + 软件 WebGL/Web Audio。没有移动真机、其他浏览器或人耳音质认证；当前参考环境的性能基线见 PLATFORMS.md。体积提示、整包预加载和长期回执留存的规模问题保留给 M5。

fixture-save@1 与消费者格式均为原创 synthetic，不提供 NScripter/KAG 或《水仙》《海市蜃楼之馆》的兼容声明。N/F 所需最小输入见 INPUTS_REQUIRED.md。

M4 提供实际 CLI/标准项目、SourceMap 与必要行为覆盖发布门槛、只读 saves analyze/verify，以及独立 tarball 扩展/完整调用迁移/合成 binding 的开发者工作流。Node/Vite 仅在 CLI；Core 不依赖它们。覆盖清单和标准候选校验不是原作忠实性认证。

备份格式、事务边界、迁移工厂与失败行为见 [BACKUPS](BACKUPS.md)。M5 其余任务仍未完成；当前验证范围见各次证据。

M5-02 的发布/资源预算与设备失败规则见 [RELEASES](RELEASES.md)。只声明已执行平台证据；VRAM 仅 RGBA 估算，不冒充设备测量。

实际平台与性能范围见 [PLATFORMS](PLATFORMS.md)：Core/API 目标通过，软件渲染/释放有长尾，不承诺 60 FPS 或视觉延迟。

本地 0.1.0 alpha 候选与未完成的 N/F/M6 门槛见 [ALPHA](ALPHA.md)，不声明稳定 API 或真实两作支持。
