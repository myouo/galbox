# W1-27 等待中的正文前缀

2026-11-06，ADR0126。includeCurrentText可投影delay/group等待中的已显完
continue文字；按at、文字身份及完整rich签名匹配当前代码，源抑制、清页、
已确认/结束和其它等待不投影。callee已返回/模块冷恢复仍按实际文字源识别。
冻结原TextState，只读、不标读/确认/写journal或授予回退/语音重放。

默认策略、Snapshot/protobuf/存储和容量不变，不执行剧情来重建历史。
通用能力不是作品原生500/2000行缓冲或其它控制阶段的全部认证。

实际命令：

```sh
pnpm exec vitest run tests/unit/history-prefix.test.ts tests/unit/current-backlog.test.ts tests/unit/text-continuation.test.ts
pnpm check
pnpm test
pnpm build:harness
pnpm exec playwright test tests/browser/history-prefix.spec.ts tests/browser/current-backlog.spec.ts tests/browser/backlog-display.spec.ts tests/browser/history-only.spec.ts
GALBOX_EVIDENCE_DIR=artifacts/history-prefix-consumer pnpm test:consumer
pnpm check:browser-shards
```

初批22项针对性测试；加入共享样式来源负例后完整493单元/104文件通过，
strict/headless类型及边界通过。4项浏览器验证默认历史、Ruby、跨模块已返回
前缀、真实图文保存/刷新及接续后只产生一条完整历史；大窗口和专用注释回归
保持。隔离tarball安装/类型/实际Player与IndexedDB冷读通过。

消费实包SHA256：
`d222adf212da1921716a6b0c35b38d3672137388b0d5d96a40d02793a314e915`。

原始日志/JSON/trace在artifacts/history-prefix-*，只提交短报告及合成fixture。
独立作品接实际包、实际主线控制等待和旧槽仍由实例验收，不混入SDK载荷。
