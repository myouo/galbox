# ADR-0004：来源身份与转换计划所有权

状态：采纳并实现 M3-02，2026-10-25。

- 原版来源是 SourceKey + schema ID/signature + codec version。静态绑定以 codec 锚定推断；运行时校验真实工厂来源、codec 对象和 mapping 绑定，拒绝同形异族或伪造对象。
- SaveBridge 位于主库内部，通过显式 save-bridge / port-kit 入口公开已实现能力。Core 只导入中立 linker，不导入包含 SaveBridge 的公共聚合入口；边界检查新增这一约束，防止反向依赖。
- bytes 立即复制；解码与 digest 端口收到自己的工作数据，codec 返回后按关联 schema 验证并隔离。prepare 只有纯候选和报告，不写槽位或活动 profile。
- 计划由受控 WeakMap 持有 payload，调用者只能拿副本；materialize 重验完整 Program 和同一个冻结注册表。输入 bytes 已按准备时的内容私有化，后来改调用方数组不改变计划；新内容须重新准备。
- M3-02 只建立 baseline/profile/报告，recipe 和持久接管另由 M3-03/04 完成。合成样本始终标 synthetic，真实 N/F 数据未齐时不是兼容通过。
