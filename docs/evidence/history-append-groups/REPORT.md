# W1-25 历史追加分组与受控旧记录升级（2026-11-05）

ADR0124：React公开groupHistoryEntries，默认历史界面与作品皮肤共用只读分组。
仅显式historyAppend=true接前组，false/缺失各起新组；首条追加在旧父记录已
不保留时独立显示，不补造旧文字。返回分组数组独立且冻结，记录引用与顺序
保持。追加片段不再重复生成自动角色标题，文字里的明确名字保留。

port-kit公开rebaseHistoryAppends。仅处理已验证的history-only记录，检查旧源，
只允许追加标记和最多256个源明确声明的尾部break变化。所有原文字/样式/
角色/版本/地址必须相同；重算签名并验证目标。行身份/数量/原时钟/正文/
窗口/进度不变，新增换行不创建额外记录；仍需调用方完成完整迁移与绑定。
改动候选始终为私有副本，坏源/缺源/文字变化失败不改输入。

实际命令（SDK根）：

- `pnpm test`：102文件/478项通过，0失败。覆盖真实工厂的分组、裁剪首条、只读所有权、wire/冷恢复、追加升级及明确尾换行、坏旧签名/缺源/正文篡改拒绝。
- `pnpm check`：生成、完整/headless严格类型、导入与仓库边界通过。
- `pnpm build:harness`及`GALBOX_EVIDENCE_DIR=artifacts/evidence/history-append-groups/final pnpm exec playwright test tests/browser/history-groups.spec.ts tests/browser/history-only.spec.ts tests/browser/current-backlog.spec.ts`：3项通过，19.8秒；新分组例3.7秒，实际默认UI只有Writer/Archive两个标题，追加片段同一p；真实图文保存和关闭/刷新重开后全部记录/帧/正文/已读与分组身份相同。
- `pnpm test:consumer`：最终实包隔离安装、严格声明、headless与浏览器通过；公开分组/只读边界、剪掉父记录后保留尾片段、明确追加及尾换行升级均由实际工厂与Core验证。

初版分组测试误把historyText默认值当作追加；按既有默认修为显式append:true，
没有修改旧默认或放宽断言。消费者移植必须使用声明来源，不以发音者相同
猜测追加。原始日志/截图/trace/JSON均ignore，作品载荷未进入SDK。

这是显式追加与尾换行表现的有限支持，不是原生行缓冲、角色reset状态、完整
字体度量或丢失历史恢复。作品整合需在实例中验证真实旧槽并沿用实际tarball。
