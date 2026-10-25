# M5-02：发布绑定、预算与设备失败

2026-10-25；基线 308c1ae，分支 feat/release-resource-budgets；Node 24.15.0、pnpm 11.28.5、TypeScript 5.9.3、Chromium 156.0.8078.4，Linux 软件 WebGL/Web Audio。TMPDIR=/dev/shm。源码/包摘要见 source-manifest.json。本地建设与打包，没有外部发布。

按 [ADR 0009](../../decisions/0009-release-and-resource-budgets.md) 实现正式 `galbox-sdk/release`：生成 Schema/validator、真实工厂、Program/注册表/目录身份绑定、实际资源事实与预算。CLI/标准模板与原创《灯塔来信》都生成并消费旁路清单。Headless 不依赖设备；Node/Web SHA-256 端口实际验证一致。旧嵌入方沿同一 Host 派生清单并明确标记 origin。

HTTP 源读取有界，WAV/图片在解码前检查事实与预算，解码后再核对尺寸/实际 PCM。取消后迟到租约归还一次；音频 start 失败断开已创建节点。明确媒体 unavailable 不冒充待点击；提交后永久失败保留 pending，换新 Host 按 head/owner 恢复且不重复启动进度写入。运行中实际 WebGL context loss 暂停会话、停止音频，仍可保存逻辑切点。范围及默认/硬预算见 [RELEASES](../../RELEASES.md)。

| 命令（均退出 0） | 实际结果 |
| --- | --- |
| pnpm install --frozen-lockfile | install.log，未增加依赖 |
| pnpm check | check.log；生成一致性、严格类型、headless 与导入边界 |
| pnpm fixture | 真实生成原创新资源/Program/清单与 synthetic 原档，实际媒体由下面浏览器验证 |
| pnpm test | unit.log；11 文件、69 测试 |
| GALBOX_EVIDENCE_DIR=docs/evidence/m5-02 pnpm test:browser | browser.log/browser-results.json；29 通过，0 skip/flaky/unexpected；内含生产 build |
| GALBOX_EVIDENCE_DIR=docs/evidence/m5-02 pnpm test:consumer | consumer.log/consumer-result.json；仓库外 SDK tarball、strict/skipLibCheck=false、原生 ESM、显式 release/真实资源/播放保存备份/完整迁移 |
| GALBOX_EVIDENCE_DIR=docs/evidence/m5-02 pnpm test:cli | cli.log/result.json/commands.json；50 条真实命令，独立模板/开发者浏览器工作流，发布混代/预算/原有诊断反例 |
| GALBOX_EVIDENCE_DIR=docs/evidence/m5-02 pnpm test:compatibility | compatibility.log/compatibility-result.json/synthetic-results.json；4 synthetic 测试通过，N/F needs-input |

新增 6 个发布/预算语义测试、5 个真实浏览器场景及公共工厂的类型反例。T12：错 Program/注册表/provider/release 事实被拒绝；T13：预解码拒绝和取消清理、迟到租约、source 节点释放、已有生命周期回归；T16/T22：视频/热点/timed-choice 必需能力明确拒绝；T25：私有 bytes/租约及无 Content-Length HTTP 流上限；T28：实际 PNG/WAV 解码、精确 PCM 计数、真实 WEBGL_lose_context，以及 NotSupportedError 故障注入后的 pending/新 owner 恢复。永久音频失败测试用真实 IndexedDB，启动累计值始终为 1，旧 owner 后续写入被拒绝。

首次浮点 Program 的清单生成暴露扩展 JsonValue 与完整 wire JSON 边界不同：未放宽扩展值，而增加有界 canonicalWireJSON，正常坐标/增益仍能哈希。首次 CLI 回归因新发布检查先拒绝旧测试的直接修改，见 cli-first.log/cli-first-commands.json；测试改为真实 assets build 后再验证，原 RESTORE_TEXT/INVOCATION_MIGRATION_REQUIRED 断言保留。不存在删断言、skip 或假成功。提交前仅规范化日志行尾空白。

SDK artifacts/galbox-sdk-0.1.0.tgz SHA-256 `2cadf70e1383edda029156fb4f94fd2af64ffc0b7043fbfaef0a1e61017802ac`；consumer 与 CLI 实际安装摘要一致。CLI artifacts/galbox-cli-0.1.0.tgz SHA-256 `f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1`。artifacts 按仓库规则不提交。

本阶段仍是预算内整包预加载，主 chunk >500 kB 警告保留；RGBA 为估算，不是实测 VRAM。浮点 WAV 属受控 header/decoder 接入范围，此报告的真实媒体样本为 PCM16/PNG/SVG，不声明其他编码或设备认证。没有移动真机/其他浏览器、长媒体流/精确 seek、视频/热点/限时选择、GPU 自动恢复、代码签名或同 realm 沙箱。N/F 真实资料仍缺，合成通过不作商业作品兼容结论。

M5-02 完成；下一项 M5-03：对当前实际环境测量 Core 批次、语义输入到逻辑/绘制、初始化/解码和资源内存，明确实测、估算与未验证的平台。
