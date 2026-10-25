# G1-01：SDK 持久设置、分轨音量与文字速度

2026-10-25，从 b06f540 接续；分支 feat/common-vn-preferences。按用户要求新增 COMMON_VN/G0–G7 完整通用目标，不把有限 alpha 或宿主可自写 UI 当作全功能引擎。分层/第一切片支持集在 ADR 0013，G0-01 的文档核查单独记录。

正式 settings 模块和单一 Schema 生成 PlayerPreferences/patch/record、音频与文字偏好类型/validator。主、BGM、voice、sfx 音量和文字间隔实际生效；实例只给默认值，不实现持久/CAS/Mixer 逻辑。SDK IndexedDB/MemoryStore 支持独立偏好记录，Player 串行提交并通过 Host/Coordinator 应用；默认 React 设置界面直接可用。

偏好不进剧情 Snapshot/profile，旧槽位/导入分支恢复不回写设置。完整输入校验后事务 CAS，成功才应用；跨实例冲突显式读取再调整，未知回包按 PREFERENCES_COMMIT_UNKNOWN 处理。已开始提交后 dispose 返回 committed/disposed 实际事实，借用 Store 保持可用。

Mixer 为 scriptGain × roleGain × masterGain，脚本增益仍存于 Task.gain，现有 source 和恢复后 source 都只乘一次；文字偏好排队，规范揭示位置保留，0 间隔显完不自动已读。旧存储无记录时使用作品 defaults；旧自定义 Store 不实现端口时显式 unsupported，session-only setVolume 保持旧语义。故事备份本切片不包含玩家设置，未实现的自动/输入/字体/富文本字段不被假接受。

## 实际命令与结果

以下均退出 0；日志只规范化行尾空白，保留结果。

| 命令（测试使用 GALBOX_EVIDENCE_DIR=docs/evidence/g1-01） | 结果 |
| --- | --- |
| pnpm install --frozen-lockfile | install.log，无新增依赖 |
| pnpm check | check.log，生成一致性、严格类型、headless 与边界 |
| pnpm test | unit.log，13 文件、76 测试 |
| pnpm test:browser | browser.log/browser-results.json，35 通过、0 skip/flaky；含真实 build |
| pnpm test:consumer | consumer.log/consumer-result.json，独立 tarball strict/skipLibCheck=false/原生 ESM，真实 settings 工厂/存储/文字速度和浏览器持久 API |
| pnpm test:cli | cli.log/result.json，50 个真实命令及独立模板/开发浏览器工作流 |
| pnpm test:compatibility | compatibility.log，4 synthetic；N/F needs-input |
| GALBOX_API_BASELINE=b06f540 pnpm test:release | release.log/release-audit.json，真实编译前后声明、当前源码 pack、两包 publish dry-run |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json，所有既定参考目标通过 |

新增 4 单元场景：完整设置 Schema/默认值隔离；CAS/失败与剧情/head/旧备份独立；慢速/即时文字与旧快照继续/未读；预算续跑后排队应用。新增 3 真实浏览器场景：默认 UI 设置→刷新/旧槽位；原生 GainNode 数值验证实时/后续 source 只乘一次且脚本 gain 不污染；真实 IndexedDB 命名空间、跨实例冲突、丢失回包重读、串行 patch 合并及在途提交销毁。

最新性能：228 次语义 API P95=3.3 ms、两帧代理 P95=36.7 ms；最重 Core 批次 P95=1.339 ms；三个完整活动销毁 200.5/54.8/172.9 ms，全部低于原 500 ms 参考门槛。所有权计数归零，内存/GPU 估算与平台范围仍按既有声明，不作物理 GPU 或移动真机认证。

候选仍为本地 0.1.0（非稳定 API）：SDK SHA=ffce829f33ce4bf95bf7d2546a0c9a2680cf50330a41d200f06810f5faf05a90；CLI SHA=f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1。consumer/CLI/release audit 包摘要一致，24 条按入口计的 API 新增/声明变化、无删除，完整列表见 release-audit.json。没有真实 publish/push/部署或远程 CI。

G1-01 完成只说明本支持集。G0-02、G1-02、G2–G7 继续 todo，流程图/图文存档/富文本/文本框/脚本 UI 等不因已规划而计为支持。下一项 G0-02 typed 表达式/字符串插值/确定性 RNG 为正文/演出/节点规则提供底座；N/F 真实输入阻塞单独保留，不能阻塞通用功能。

开发服务已实际运行并调整文字间隔为 0，刷新后再阅读与打开设置，旧 profile 未自动标读；dev-result.json 记录 HTTP200、manifest、1 canvas、真实 Web Audio、0 pageerror，截图 dev-settings.png。
