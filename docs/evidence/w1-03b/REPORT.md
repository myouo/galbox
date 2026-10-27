# W1-03B：基础函数模块与执行依赖加载

2026-10-27，基线 9e0b41f，feat/program-modules。仅 ADR0035/0036 的基础 ADV/control、i32/bool/string、基础舞台/WAV/任务/profile、静态 presentation 支持集；高级能力由 W1-03B2 承接。父任务 W1-03 未完成。

真实 compileProgramModules 先链接完整 Program，按函数分组生成 protobuf 文件及绑定清单。清单含 header、接口/锚点、release 事实、每文件长度/SHA；不含尚未加载的函数体。ModuleProgram 工厂有运行时身份，验证输入与发布闭包，使用明确外部函数声明检查链接，不造空函数替代代码。

同一生产 Core 在实际 control.call 之前发现缺失模块，保留 PC/参数并交给串行 Coordinator 准备，再续跑同一轮；Host 不重入、旧输入不再次消费。失败保留旧画面、禁止保存/flush，retryResources 重试当前轮一次；取消后迟到 lease 仍归还，不安装半份代码。入口代码在设备创建前准备。

快照 programModules 绑定完整清单摘要与本 Core 实际使用集合；另一个 Core 或候选加载了代码，不扩大本 Core 集合。读档先加载该集合再验证帧/任务/等待闭包。清单改变、来源缺失、模块 ABI/长度/SHA/身份不符均拒绝。release.origin=modules；只有全部模块已安装才重新核验整体 Program 摘要。

## 实际验证

- 单元通过真实 Builder/instruction/变量工厂检查类型反例和动态链接失败；模块生产、完整摘要、声明/ABI、不可变所有权、逐 Core 使用集合、错误快照及 unsupported 能力均有反例。最终全工程 236 单元通过。
- 最终完整 151 浏览器通过。真实 HTTP 启动只取 root.pb，选海岸取 sea.pb，实际嵌套调用再取 logic.pb；未选 interior.pb 被设为不可用仍无请求。刷新较早海岸存档只请求 root+sea，调用帧为 2，未猜加载后续代码。
- 错误 provider 身份导致同轮失败，捕获被拒；重试成功且输入仅消费一次。入口等待时取消，迟到 lease 归还，设备与缓存没有复活。另一实际路线执行 1000 条指令后结果为 n=999。
- 原创《灯塔来信》经同一 compiler 分真实函数模块，实际图片、WAV 和并行任务在存档后恢复；没有第二套测试解释器。
- 仓库外安装实际 tarball，strict/skipLibCheck=false 与 native ESM 通过；浏览器仅用公开入口完成按需分支、保存和新 Player 恢复闭包。
- 原生禁用 WebGL 的 Canvas 触控模拟从开发服务器完成分支、图文保存/刷新恢复及 protobuf 设置导出；请求序列 root,sea,logic,root,sea，0 pageerror。

原始结果均 ignored：artifacts/hygiene/{check-final.log,unit-final.log,final-browser,accepted,native}。工程治理/protobuf 详见 ../e1-01/REPORT.md。语义与类型审计见 TYPE_AND_DATA_AUDIT，声明 i18n 不支持的反例保留。

已使用代码暂不淘汰，模块内函数整体下载；单函数内部未选分支也在该文件中。输入/内存预算保持。代码默认只按实际调用加载，没有自动预取。SDK/Pixi/React JS 功能包仍主要由 Vite 打包；不能以剧情模块通过宣称整个 SDK 已按执行依赖拆包。

模块版 recipe、SaveBridge、备份恢复与历史回溯显式 unsupported；备份导出可用，单体路径保留原能力。高级 UI/富文/媒体/流程图/鉴赏/扩展/RNG、i18n、热记录留存/容量与持久离线缓存仍在 B2/I1/C/W1-04。

运行 pnpm dev，访问 http://127.0.0.1:4173/?demo=modules&renderer=canvas；这是 tests/player-app 内的验证实例，不进入 SDK。保持服务器运行后可执行 node tests/tooling/smoke-engine.mjs 重跑原生无 WebGL 验证。
