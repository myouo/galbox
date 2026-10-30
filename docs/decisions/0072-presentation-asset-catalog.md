# ADR 0072：独立表现图片目录

隐藏正文时的无框背景可能是新合成图。把它放进既有 Program 会改变 release、stream catalog 与场景鉴赏签名，影响已持久进度。

Player 与 HTTP provider 接受同一可选 PresentationAssetCatalog（version 1，至多128个图片及一一对应事实）。目录按 Schema 克隆、校验，仅允许图片，禁止与 Program ID 冲突。正文变体的 source 必须属于 Program；hidden 可来自两处。场景回放继承已拥有目录。

Web Host 用同一 ResourceLoader/AssetCache 验证摘要、事实、实际解码及字节/图片/驻留预算，租约支持取消和闲时回收。独立目录按单资源校验，活动集合仍共享原预算；不扩大预算，不更改 Core/存档/profile/stream身份。HTTP provider 的字节查找含目录，流查找与摘要仍只用原 Program。

未配置目录的既有行为不变。这只支持显示图片，不能在剧情中引用，不包含逻辑/媒体执行，也不代替完整剧情资源的版本迁移。

原eager模式的Program资源始终由bootstrap/display租约保护；允许其空闲trim检查，不再跳过整类缓存，以便释放新增的无引用显示图片。没有调整当前/候选/媒体/捕获及前看提示保护。
