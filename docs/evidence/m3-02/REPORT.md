# M3-02 验收

2026-10-25，cwd `/home/myo/Desktop/galbox-sdk`，基线 `06becf4`。源码摘要见 source-manifest.json；Node 24.15.0、pnpm 11.28.5、TS 5.9.3、Chromium 156.0.8078.4，TMPDIR=/dev/shm。

实现：真实来源/codec/mapping/binding 工厂、不可变准备句柄、目标/注册表绑定、fixture-save@1 字节及附件解析；新增 save-bridge 公开入口。Core 改为导入独立 linker，静态约束阻止反向依赖 SaveBridge。

实际验证（GALBOX_EVIDENCE_DIR=docs/evidence/m3-02）：

- pnpm check：退出 0，含真实来源工厂的跨 family/schema/state 类型负例。
- pnpm test（JSON reporter）：6 文件、38 测试通过；源码/目标/provenance/所有权/异常闭环均使用生产模块。
- pnpm test:compatibility：4 个真实 synthetic 负例组通过；N/F 单独报告 needs-input。
- pnpm test:compatibility --require-real：预期退出 2；require-real.log 保留结果，未把资料缺失计为通过。
- pnpm test:browser：构建与 14 个真实 Chromium 场景通过；新增真实 Web Crypto GBFX 准备/损坏摘要拒绝。
- pnpm test:consumer：退出 0；严格声明检查、Node 自定义来源绑定与计划、扩展迁移、实际 Player 保存恢复都通过。

关联 T01/T23 与 synthetic-codec-negatives：损坏摘要、错长度/版本/edition/locator/值、缺 global、过大包、错误 family/schema、重复绑定、过期目标被拒绝；准备期间改调用方 bytes 不污染候选，不改变活动 Core/profile。计划 materialize 的返回对象再被修改不会改变原计划。

测试最初混用源码与 dist 的身份域，触发品牌/工厂 provenance 拒绝；改为在此边界统一消费公共构建产物，保留拒绝保护。严格消费者另外发现 decode 字面量推宽；改用 schema.parse 构造返回值，没有 any、强制类型断言或放宽 strict。

原始日志/JSON 位于本目录。Vite 体积提示未屏蔽。M0–M2/M3-01 的回归通过，但 recipe、持久导入/独立 profile 与激活钩子仍未实现，不能宣布整个 M3 或 N/F 兼容完成。下一项 M3-03。
