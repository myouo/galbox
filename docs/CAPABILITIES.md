# 当前能力：M0–M2 + M3-01/02

此表描述实现范围；实际通过状态和命令证据见 tasks.json 与 evidence/。

| 能力 | 当前实现 |
| --- | --- |
| Core / ABI | 同步 TS、稳定地址、显式参数/返回槽/帧、单剧情流、有限预算续跑 |
| source 值 | bool/string/i32；checked 加法；eq/lt；无隐式转换 |
| 图像 | 单 Pixi WebGL，原创 SVG/PNG provider，绝对 x/y/alpha 线性动画、层级 |
| 正文 | ADV，DOM，固定 Unicode 码点揭示；显完和 advance 分离；历史 |
| 任务 | 固定 all-success 组，完整结果/引用保存；cancelled/superseded/failed 均不是成功 |
| 音频 | Web Audio 短 WAV；BGM/voice/sfx；真实获取、解码、启动/结束诊断、音量、重试 |
| 音频恢复 | 显式 replay/stop；不提供采样位置精确恢复 |
| 资源 | 整个 release 预备，release/catalog/kind/mime/字节 SHA-256 核验，私有字节与租约归还 |
| 保存 | 当前语义等待/end；策略禁存、预算 continuation、flush/准备屏障明确拒绝 |
| 普通 profile | 工作视图、冻结批次、幂等回执、无手动保存的已读/解锁、修订冲突 |
| 激活 | 候选准备、最终冻结/dirty 交接、原子 head、提交后失权、迟到 generation 拒绝 |
| UI / 生命周期 | React 默认 UI；暂停原因独立；已读快进在失焦清除；资源清理及在途提交结果 |
| 嵌入 | protocol/core/port-kit/player/react/testing 显式 exports，tarball 独立消费 |
| 未启用 | timed-choice、视频/热点、relative 动画、其他值族、跨内容版本迁移、SaveBridge、CLI |

OperationSpec 参数表由 schema 生成，可从 `galbox-sdk/protocol` 的 operationSpecs 检查。完整 opcode 列表位于 schema/protocol.json，Core 使用穷尽分派，未登记 opcode 在结构校验时即拒绝。

平台证据限定当前 Linux + Playwright Chromium + 软件 WebGL/Web Audio 路径。没有人耳音质认证、移动真机、其他浏览器、性能预算或商业作品兼容声明。全部资源预加载与回执长期保留是此初始版的规模限制，M5 再按实际负载测量。

M3-01 已实现受检 codec/有状态操作、signal wait、失败原子性和 SavedInvocation 迁移，见 OPERATIONS.md；跨内容 release 与原档迁移尚不支持。

M3-02 提供来源绑定与 fixture-save@1 准备/报告，见 SAVE_BRIDGE.md；不等于持久导入、加载钩子或原作兼容已完成。
