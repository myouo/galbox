# galbox-sdk 当前状态

2026-10-26。G4-01有限图文存档集完成，分支feat/illustrated-save-system，基线6c40d86，本地提交见git log。状态唯一来源tasks.json，下一G4-02。无外部推送/发布/部署/远程CI。

ADR0025/SAVES：saveGame默认同切点Snapshot+舞台/DOM正文320×180 PNG、元数据与原子当前/上一修订、固定SHA256回执、失回复核验/unknown原payload重试；Core保存权限不变，旧save无图兼容。手动/快速/opt-in循环自动槽、命名/覆盖删除确认/上一修订/刷新默认UI；profile隔离，普通/recipe读档不立刻覆写自动槽，旧快照不回写已读/解锁/偏好。自定义renderer缺capture明确拒绝，可显式无图。Namespace4 MB/backup1 MB等有限支持见SAVES。

最终frozen install/generate/fixture/check、177单元、92浏览器（0 skip/flaky）、strict/skipLibCheck=false独立tarball、65 CLI、4 synthetic、性能/API/pack/publish dry-run均通过。实际IDB事务abort/失回执/取消/dispose、同切点存储延迟后进入禁存、当前/上一图文备份与原导入流程通过。证据evidence/g4-01/REPORT.md/source-manifest；过程失败保留，旧相关证据不替代本次重验。

SDK SHA256=1ca632cd34d18f28d57a85acc4f4f3e5a41804b87c28eb8771f731249d89dacc，CLI=c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e；consumer/CLI/audit/artifacts一致，本地UNLICENSED alpha，28新增/13声明变化、0删除，不承诺旧二进制前向或稳定API。既有WebGL API P95 4.40ms/最重Core 1.521ms，活动销毁88.7,154.5,109.1ms，原500ms目标通过；不代表缩略图吞吐/全平台/实际RAM认证。

dev已启动http://127.0.0.1:4173/?demo=layout&autoSave=1 。Chromium --disable-webgl原生API实测Canvas：图文/自动3槽/刷新后读旧手动档，保留3条已读且自动槽不改，单canvas/0 pageerror。重启export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。browser前停dev释放4173/4174。

下一G4-02：先定义有界合法历史切点/语音身份，回放不改PC/已读；回溯通过新activation并使用当前durable profile，不能从正文历史猜剧情快照，再默认UI/故障/刷新/独立consumer。G4后续/G5–G7/N/F/M6未完成；真实两作edition/Program/资源/原档/原作继续参照缺失仍blocked。
