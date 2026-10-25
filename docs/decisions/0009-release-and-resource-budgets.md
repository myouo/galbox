# 0009：发布闭包和有界资源准备

M5-02 支持集：同一 TypeScript Core/Host。发布清单绑定 Program 的规范 JSON SHA-256、SDK/协议/语义版本、冻结操作与 SaveBinding 注册表身份、稳定存储系列、资源源文件事实和预算。摘要由环境注入的 UTF-8 SHA-256 端口计算，headless 无设备依赖。不哈希函数源码；受信任实现以作者声明的 implementation/mapping 版本标识，修改实现须改版本，摘要不是代码签名或安全沙箱。

公开 release 工厂从真实 Program/注册表和经检查的资源字节事实构造清单；CLI assets build 产出旁路 program.json.release.json，validate/build/dev 核验。标准模板加载旁路清单。Player 可显式接收清单，在资源准备前核验；既有调用者未提供清单时，在预算内准备真实资源后生成本次不可变清单，视图明确标记 derived。两种路径共用校验和 Host，不混用新发布代，存档仍按现有内容迁移规则处理。

资源维持有界整包预加载，不引入无样本的长媒体、视频、热点、限时选择或新 Core opcode。支持 PNG、有固定 width/height 的自包含 SVG、RIFF WAV PCM16/float32（单/双声道）。在解码前核验编码大小、尺寸和 WAV chunk/帧数/时长；在解码后核验实际尺寸、PCM 和总预算。RGBA 纹理大小是估算，不声称实测 VRAM；音频记录真实解码字节。HTTP provider 用有界流读取；自定义 provider 必须遵守端口预算，SDK 无法阻止其自行分配内存。

默认预算：单资源 16 MiB、总编码 32 MiB、RGBA 纹理估算 128 MiB、实际 PCM 32 MiB、单边 4096、单 WAV 30 秒；可在硬上限内显式配置。拒绝发生在激活之前，不能把解码成功误报为设备可播放。资源报告区分 expected/verified 事实，媒体仍区分 unverified/available/needs-user-action/unavailable。

取消/初始化失败必须清理本实例所有纹理、音频与租约；迟到 acquire/decode 不建立新实例状态。媒体 source 创建/启动失败也须断开已经创建的节点。GPU context loss 作为明确设备故障暂停当前表现，不能静默继续显示成功；必要时显式重建 Player，保留 IndexedDB 数据。具体平台证据与性能在 M5-03 单列。

Host 明确 NotSupportedError/closed 属于 unavailable，普通可重试启动失败仍为 blocked。接管在持久提交后运行宿主启动意图，再确认 activation；永久媒体失败保留 committed-pending，换新 Host 后以当前 head/owner 资格恢复，不重放已提交 profile 钩子。GPU 运行中丢失则保持逻辑存档切点并暂停设备表现。
