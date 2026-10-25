# M4-02：来源诊断与存档分析

2026-10-25，cwd /home/myo/Desktop/galbox-sdk，基线 e56e46c；源摘要见 source-manifest.json。Node 24.15.0、pnpm 11.28.5、TS 5.9.3，TMPDIR=/dev/shm。

实现 SourceLocation/SourceMap/PortObligation/BehaviorMapping 的单一 Schema 与真实 Builder 工厂，平台中立 diagnostics 入口；链接/结构错误保留 address/path，快照追踪连接帧/等待/invocation/任务来源。task.at 为兼容性可选元数据，不决定剧情权威。

CLI validate/assets build/build 使用 inspectProgram 的必要行为门槛。Program 本身可以链接，但必要 mapping 缺失仍阻断发布。JSON 或文本报告带真实源文件/行列；没有把覆盖声明当作原作认证。

saves analyze/verify 通过项目公共 SDK 与已登记来源实际处理文件；internal verify 要明确 profile，不猜当前进度。原档 verify 只准备/检查候选，既不写存储，也不猜真人或媒体结果，报告 originalReference=not-verified。

实际命令全部退出 0：pnpm check；pnpm test（JSON reporter，9 文件/54 测试）；pnpm test:cli（28 个真实命令、独立 tarball 安装、严格 checkJs/TSX、浏览器保存恢复、dev HTTP）。原始退出码和输出在 commands.json；结果/真实安装路径与包摘要在 result.json。

负例包含删除必要 mapping（validate 与 build 都失败）、错指令 content（准确定位 main:opening 与 story.mjs 行列）、旧 text revision 读档拒绝且原档不改、internal 缺 profile、无登记来源返回 needs-input/退出 2、自制原档错误 locator 返回 unsupported。仍保留 M4-01 的非空 init、错摘要、路径逃逸和未知命令/选项反例。

T15 只验证框架声明覆盖，N/F 真实义务及原作忠实性仍未认证。M4-03 完整第三方扩展/迁移/binding 任务尚未由本报告计为完成；M5 性能/平台等也未验证。未执行远程 CI、推送或发布。
