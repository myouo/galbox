# galbox-sdk 当前状态

2026-10-26。G5-01有限流程图/章节入口完成，分支feat/flowchart-node-entry，基线afe6018，本地提交见git log。状态唯一来源tasks.json；下一G5-02。无外部发布/推送/部署/远程CI。

ADR0027/FLOWCHART：版本图/真实节点工厂、flow.node/unlock、Profile.flow单调进度批次/回执、Snapshot.flow声明根与完整定义摘要。enterNode最终读取durable profile重验锁/gate并用默认globals/RNG/舞台创建真实新Core；不复制旧章内状态，保已读/解锁/设置，旧槽/备份/历史仍正式验证。默认DOM/SVG连线/筛选/遮蔽/当前节点/可见重入确认；仅记录节点明确无入口。旧请求/禁存/坏前导/设备失败/失回执/定义变更有拒绝与pending恢复证据。

最终frozen install/generate/fixture/check、192单元、完整104浏览器（0 skip/flaky）及最后UI key修正后2项两设备重验、strict/skipLibCheck=false独立tarball/native ESM、65 CLI、4 synthetic、性能/API/pack/publish dry-run通过。证据evidence/g5-01/REPORT.md/source-manifest，实际布局失败与修复保留。SDK SHA256=2bbc6f3ce07d914c1a17448b54cce7aecf57dbfe14e9bb8b7bb52d6fa0c38b3b；CLI=c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e；consumer/CLI/audit/artifacts一致，本地UNLICENSED alpha，27新增/15声明变化、0删除；不承诺旧二进制前向或稳定API。

标准无图软件WebGL API P95 25.50ms<50、两帧P95 67.30ms、最重Core 1.448ms<4，活动销毁18.0,18.3,14.9ms<500；不证明128节点/低配/Canvas/大作品/60FPS/RAM。G7原性能归因与规模义务保持。图16章节/128节点/256边/128Ki JSON字符及原存储预算有界。

dev已启动http://127.0.0.1:4173/?demo=flowchart 。Chromium原生--disable-webgl实测Canvas：两路章首/变量RNG重置/解锁/筛选/刷新旧档保新进度后进入archive，单canvas/0 pageerror。重启export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。browser前停dev释放4173/4174。

下一G5-02：版本化CG/音乐/场景鉴赏/成就与资源kind/解锁绑定、回放隔离ADR，再正式系统/默认UI/当前主线PC与profile隔离/刷新/独立消费。G5-02/G6/G7/N/F/M6未完成，真实两作edition/Program/资源/原档/原作继续参照缺失仍blocked。
