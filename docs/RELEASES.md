# 发布清单、资源预算与设备失败

M5-02 的 `galbox-sdk/release` 使用正式 Program、冻结的操作/存档绑定注册表、资源事实和预算构造发布清单。它绑定 SDK/协议/语义版本、作品与存储系列、Program 规范 JSON SHA-256、资源目录 SHA-256、注册表身份 SHA-256；资源内容 SHA 仍来自 Program.assets，Host 对实际字节另验。清单自身指纹包含上述全部字段、资源事实和预算。

它保证一次运行使用一致的声明与字节，不是发布者签名。受信任 JS 实现代码不被沙箱化或按函数源码哈希；作者改变操作/迁移/codec/mapping 行为时须改变 implementation、操作或 mapping 版本。迁移转换改变也须改变目标 implementation 身份。存档兼容仍走 [BACKUPS](BACKUPS.md)/完整 invocation 迁移，不因清单一致而绕过旧档校验。

CLI `assets build` 会读取真实文件、核验素材 profile 与预算，生成 `program.json` 和旁路 `program.json.release.json`。`validate/build/dev/saves analyze/verify` 都检查当前 Program、注册表、字节事实与策略是否匹配。改变 source/port/资源/策略后重新运行 assets build；修改后的状态没有重新构建时先报 RELEASE_MISMATCH，再构建后才进入更深的存档/正文诊断。

标准模板读取这两个文件并传给 Player，存储系列取自清单。文件各自通过 rename 写入，不承诺两个文件的文件系统 ACID；中断或部署混代会在 Player 校验处拒绝，重复 assets build 可重建。部署需一起保留匹配清单与资源，旧版不可取得时保留存档并明确拒绝。

```ts
import {createPlayer,createHttpProvider} from 'galbox-sdk/player';
import {parseReleaseManifest} from 'galbox-sdk/protocol';
const program: unknown = await (await fetch('./program.json')).json();
const release = parseReleaseManifest(await (await fetch('./program.json.release.json')).json());
const controller = new AbortController();
const player = await createPlayer({program,release,
  provider:createHttpProvider(program,location.href),mount,
  saveCompatibilitySeries:release.series,
  operations:registration.operations,bindings:registration.bindings,
  signal:controller.signal,
});
// 需要取消初始化或释放该 Player 时 controller.abort()；dispose() 同样幂等。
```

既有嵌入方可不提供 release：Player 在同一预算/资源准备路径成功后，以真实事实生成本次清单，`view.release.origin` 为 derived；显式清单为 manifest。两条路径均在任何 Core 激活前完整检查资源。清单与预算在创建时复制，运行中不热换发布代；`view.release` 为只读副本，不能修改运行权威。

`createReleaseManifest({program,series,resources,operations?,bindings?,limits?}, digest)`、`verifyReleaseManifest(input,{program,series,operations?,bindings?},digest)`、`releaseFingerprint(input,digest)` 可无 DOM 使用。环境必须提供真正的 `sha256(utf8Text)`；Node 用 createHash，Web 用 crypto.subtle。`inspectResource(asset,bytes,decodeUtf8)` 检查源文件事实，`resourceUsage(facts,limits,deviceDecodeRate?)` 检查容量，公开工厂与运行时 Schema 保留 image/audio 的字段关联。规范 JSON 排对象键、保留数组顺序，使用有限 wire JSON 边界，不放宽扩展 JsonValue 的 i32 规则。

| 预算 | 默认 | 可配置硬上限 |
| --- | --- | --- |
| 单源文件 | 16 MiB | 64 MiB |
| 总编码文件 | 32 MiB | 128 MiB |
| RGBA 纹理估算总量 | 128 MiB | 256 MiB |
| 解码 PCM 总量 | 32 MiB | 128 MiB |
| 图片单边 | 4096 px | 8192 px |
| 单 WAV 时长 | 30 秒 | 120 秒 |

CLI 配置可指定 resourcePolicy JSON 路径和 series；标准模板包含 resource-policy.json。SDK 可传完整 `resourceBudget`，默认使用 defaultResourceBudget；有显式清单时须与其 limits 一致，不能暗中改清单。如果目标设备需要更紧预算，可在准备前用 resourceUsage 拒绝或生成对应策略的新清单。

媒体支持集为 PNG、固定整数 width/height 的自包含 SVG，以及单/双声道 RIFF WAV PCM16/float32。不接受 SVG 外部图片/脚本/foreignObject/DTD、无尺寸 SVG、压缩/扩展 WAV、视频、热点或 timed-choice；必需能力未知时阻断。CLI 只证明受控格式/预算，实际解码和启动由 Host 检查，当前实际 PCM16/PNG/SVG 路径与限制见证据，不从注册或 MIME 推断任意平台支持。

HTTP provider 对 Content-Length 与流实际大小都限额。自定义 provider 收到 maxBytes 和取消 signal，必须自行遵守分配预算；SDK 在取得租约后先限额再复制/hash，不能阻止自定义代码提前分配内存。被取消的迟到租约仍只归还一次，不安装到已销毁实例。图片在解码前检查尺寸，WAV 在解码前检查 RIFF chunks/编码/帧数/时长和按设备采样率计算的 PCM 预计量；之后核对真实解码尺寸/PCM 并再次限额。

`view.resources.encodedBytes` 是本次已验证源文件总字节，非当前 JS heap；textureBytesEstimated 是 RGBA 估算，非测量 VRAM；decodedAudioBytes 是当前持有 AudioBuffer 的 frames × channels × 4，未包括驱动/设备内部开销。dispose 归还本实例资源，计数清零；预算不等同于整个浏览器进程的物理内存上限。

媒体状态为 unverified、available、needs-user-action、unavailable。普通可重试 source 启动失败清理节点并保持 blocked；明确 NotSupportedError/closed 不冒充待点击。初始接管失败发生在持久提交之后时，head 保留 committed-pending，新 Host 可重新取得当前 owner 并恢复，不再次执行已提交 profile 钩子。运行中实际 WebGL context loss 会暂停会话、停止音频并显示设备错误，可保存逻辑切点后重建 Player/读档；当前不自动恢复 GPU。没有跨数据库/音频/GPU 的 ACID 承诺。
