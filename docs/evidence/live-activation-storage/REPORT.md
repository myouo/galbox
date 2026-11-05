# W1-26 当前激活切点去重

2026-11-06，ADR0125。IndexedDB布局v5仅在head持有完整Activation，当前live
表项为精确headReference。公开Store/逻辑DatabaseState、剧情Snapshot、所有权、
幂等和旧激活退役不变。v2/3/4成功写入时以原CAS事务升级；不提高4M热JSON、
4M解码工作集或64MiB冷记录限额，不删历史/已读/回执。

合成512次真实Core确认与独立大profile的逻辑双份head超过4M；磁盘去重后
小于4M，恢复512条及全部profile。错误键/形状/多重/无head引用、矛盾live数据
拒绝；失败升级原子保留旧布局。没有引入无限历史或更大PortableBackup。

实际验收：

```sh
pnpm exec vitest run tests/unit/live-activation-storage.test.ts tests/unit/storage-layout.test.ts tests/unit/receipt-ledger.test.ts
pnpm check
pnpm test
pnpm build:harness
pnpm exec playwright test tests/browser/live-activation-storage.spec.ts tests/browser/storage-records.spec.ts tests/browser/receipt-ledgers.spec.ts tests/browser/compact-receipts.spec.ts
GALBOX_EVIDENCE_DIR=artifacts/live-activation-consumer pnpm test:consumer
pnpm check:browser-shards
```

8项针对性单元、完整480单元/103文件、13真实IndexedDB浏览器及隔离实包
通过；strict/headless类型、生成和导入边界通过。首次consumer拒绝旧v3格式
断言，改为明确验证v5且保留原gzip/目录校验后重跑通过。消费包SHA256：
`9d74a79d211c23e2a4b22e29b343a2fc92223e5ee3f9c7a59ec92e362cd5018f`。

日志/JSON/trace在artifacts/live-activation-*，不提交。合成资料不是任意作品
或原档兼容证明；独立作品接实际tarball后仍须验收其累计资料、图文保存刷新。
