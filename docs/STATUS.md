# galbox-sdk 当前状态

2026-10-26。G4-02有限历史语音/受控回溯完成，分支feat/backlog-voice-rollback，基线01b50c8，本地提交见git log。状态唯一来源tasks.json，下一G5-01。无外部推送/发布/部署/远程CI。

ADR0026/HISTORY：Core逻辑historySession/ID、真实确认前完整快照/默认32条500000字符journal、profile/authority原子摘要回执/备份完整迁移；独立Host buffer/element/版本HTTP语音、菜单允许/其它原因暂停/迟到取消。Player沿原head回溯，保当前profile/偏好且不重复onLoad；默认回放/停止/可见确认UI与原创回声书签。旧无ID档可重听但不造过去切点；旧请求/禁存/坏点/失回执/容量边界有反例。

最终frozen install/generate/fixture/check、186单元、98浏览器（0 skip/flaky）、strict/skipLibCheck=false独立tarball/原生ESM、65 CLI、4 synthetic、性能/API/pack/publish dry-run通过。消费者独立命令已正常清理并exit0，先前exit13/143和所有过程失败保留。证据evidence/g4-02/REPORT.md/source-manifest。SDK SHA256=56ecef2b6c8c7afa188c8e96005cffec53c29f7f4be23ab20c31104c04add7b9，CLI=c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e；consumer/CLI/audit/artifacts一致，本地UNLICENSED alpha，24新增/16声明变化、0删除，旧二进制前向/稳定API未承诺。

基准软件WebGL API P95 26.50ms<50，但高于G4-01的4.4ms；两帧P95 66.70ms、最重Core 1.526ms，活动销毁24.9,22.9,26.7ms<500。G7已记录性能增幅/历史投影与持久成本待分组归因；不是60FPS/低配/Canvas/大作品/RAM认证。Core历史10000条/JSON4MB、namespace4MB/backup1MB等原边界继续。

dev已启动http://127.0.0.1:4173/?demo=history 。Chromium原生--disable-webgl：Canvas菜单真实语音、两层帧回溯、改走另一分支、刷新旧档后回溯，保4条已读与两解锁，单canvas/0 pageerror。重启export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。browser前停dev释放4173/4174。

下一G5-01：先定义版本化流程图/节点访问解锁与合法重入入口绑定ADR，再Schema/工厂/Core/runtime/默认UI和存档/失败/刷新/独立消费；不以文本历史/任意PC跳转代替。G5–G7/N/F/M6未完成，真实两作edition/Program/资源/原档/原作继续参照缺失仍blocked。
