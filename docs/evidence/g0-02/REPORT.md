# G0-02：类型化表达式、插值正文与可恢复随机

2026-10-25，从 24d8874 接续，分支 feat/typed-expressions-rng。有限支持集和语义见 [ADR 0014](../../decisions/0014-expressions-and-rng.md)、[EXPRESSIONS](../../EXPRESSIONS.md)，代码与包摘要见 source-manifest.json。

正式 Schema/生成类型/validator→真实公开工厂→linker→Core→Snapshot/Player 路径已落实。当前 bool/i32/string 支持 checked 算术、比较、短路/条件、当前帧/global/profile/read 查询、Unicode codepoint 字符串处理及插值。AST/结果有界，无 JS eval，无隐式随机表达式。浮点/集合是 G0-03，仍 todo，G0–G7 通用功能总体未完成。

RNG 为明确 lcg32@1，固定种子或主机输入模式。种子不混进每次部署的 Program/manifest；Core 不采熵，Web Player 在新运行采一次 crypto u32，保存 algorithm/state/draws。闭区间拒绝取样的消耗完整计数，在副本上操作，失败不改变权威 RNG/目标。旧 Program/旧无 RNG 档保持可读，新启用 RNG 而缺状态时拒绝并保留原档，不猜初始化。

text.template 保存 speaker/content 的已求值显示值、源 at 和规范模板签名。恢复检查来源/版本/模板与揭示位置，不依后来变化的变量重算。当前可见正文即使随后等待 choice/group/end 也检查来源。recipe 随机/重播正文被明确拒绝，纯表达式赋值仍按现有候选回滚语义工作。

## 实际验证

Node 24.15.0、pnpm 11.28.5、TS 5.9.3、Chromium 156.0.8078.4、Linux x64/SwiftShader；临时目录 /dev/shm。命令日志仅规范化行尾空白。下列最终命令全部退出 0：

| 命令（evidence 环境为 docs/evidence/g0-02） | 结果 |
| --- | --- |
| pnpm install --frozen-lockfile / pnpm check | install.log/check.log；生成一致性、严格类型、headless/导入边界通过，无新增依赖 |
| pnpm fixture | 正式公共 SDK 生成原创《灯塔来信·值班簿》Program/清单，基础样例/合成原档同一路径仍可生成 |
| pnpm test | unit.log；14 文件、88 测试 |
| pnpm test:browser | browser.log/browser-results.json；37 通过，0 skip/flaky，含生产 build |
| pnpm test:consumer | consumer.log/consumer-result.json；仓库外 tarball strict/skipLibCheck=false、原生 ESM、真实表达式/RNG/模板工厂与保存恢复/host seed |
| pnpm test:cli | cli.log/result.json/commands.json；50 个真实命令及两个独立开发浏览器工作流 |
| pnpm test:compatibility | compatibility.log；4 synthetic，通过框架流程，N/F 仍 needs-input |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；Core/API/三个活动实例销毁目标通过 |
| GALBOX_API_BASELINE=24d8874 pnpm test:release | release.log/release-audit.json；真实旧/新编译、27 条按入口计的新增/声明变化、无导出删除、snapshot schema=1、当前源码 pack 和两包 publish dry-run |

新增 12 个语义测试（含最终来源验证）和真实工厂的类型正反例：运算/Unicode、短路但完整链接、溢出/除零/字符串/动态 profile 类型拒绝、所有权与 AST 界限、模板求值后变量变化仍保留显示值、可见模板在 choice 切点也重验、BigInt 独立参考序列、预算 1/8/100 与存档前后同 trace、拒绝取样多消耗/失败回滚、固定/主机 seed 政策、实际 call 参数/局部帧、旧档保留和 recipe 禁止猜随机。

新增两个实际浏览器场景：值班簿通过公开 Builder 的表达式/随机/分支/选择跑完两路线；随机前保存可重现同号，随机后保存跨刷新仍不重抛，真实 DOM 显示和音频/舞台运行。另一场景用真实 IndexedDB 注入丢失 activation 回包，记录真实 crypto 采样一次，重新创建 Host/恢复 pending/再读档都不重新采熵。没有假 Host 猜剧情，也没有在 React 回调推进 PC。

首轮新章节测试在载入尚未建立 Core 视图时直接访问 wait.at，保留 browser-first.log/JSON。改为观察实际 prompt/可选 wait 后等待状态到位，随机/分支断言全部保留。最终来源字段前的通过结果归档 before-template-origin，不冒充最终代码。设计边界/失败没有通过 skip 或放宽类型解决。

最新参考性能：228 次 API P95 3.4 ms、两次 rAF 代理 P95 56 ms；最重 Core 批次 P95 1.398 ms，三个完整活动销毁 190.1/118/146.2 ms，原 500 ms 局部门槛保持通过。图形/内存/设备范围仍以参考环境声明，不作视觉 <50 ms/60 FPS 或物理 GPU/移动设备认证。

SDK 本地 0.1.0 SHA=04eecad4c4bf73fda6fa8ebfdb75487984458dde675afad77ac6f51bd2fa6a56；CLI SHA=f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1。consumer/CLI/release audit 摘要一致；没有真实 publish、Git push、部署或远程 CI。

G0-02 完成只指本支持集。G0-03、G1-02 和 G2–G7 仍未完成，N/F 真实资料阻塞独立保留。后续优先 G1-02 的自动阅读/快进/输入/辅助，值族扩展仍必须有完整 schema/工厂/Core/保存迁移反例。

开发服务已实际点击值班簿、保存、刷新和读取，RNG state=87628868/draws=1、roll=69/score=143 保留，HTTP200、manifest、1 canvas、实际音频、0 pageerror 见 dev-result.json/截图 dev-logbook.png。
