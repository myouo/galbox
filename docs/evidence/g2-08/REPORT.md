# G2-08：作品控制的正文录史

2026-10-31。richPage 的 recordHistory=false 只抑制该段正文的 backlog/journal
记录；阅读标记、窗口确认、正常推进和语音停止策略不变。连续段以最终正文
指令的策略为准，显式策略纳入来源签名，冷恢复不能改写录史行为。新能力
text.history 确保旧引擎拒绝消费；32 项能力预算和原来省略字段的签名不变。

实际执行：

- `pnpm check`：通过。
- `pnpm exec vitest run`：78 文件 / 420 项通过（含两项新策略测试）。
- 后续新增心跳 radius-6 原生数值样本，
  `pnpm exec vitest run tests/unit/image-filter.test.ts`：5 项通过。
- `pnpm test:consumer`：严格隔离安装实包、无 skipLibCheck；公开 richPage 策略、
  IndexedDB 存/读后继续、实际 backlog 及销毁再创建后的冷恢复通过。

这是逐正文录史策略，不包含 history-only 注记或动态 TJS。原始日志保留在
独立实例 artifacts/door4-history-*.log。第四门实例通过新 tarball 继续接入，
此报告不宣称第四门所有路径已完成或原生 tft 存档兼容。
