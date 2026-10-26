# galbox-sdk 当前状态

2026-10-26。G5-02有限支持集验收完成，下一G6-01；任务唯一状态见tasks.json。本轮分支feat/gallery-replay-isolation、基线e8aa105，随后本地提交包含源码/任务/证据；无推送、实际发布或部署。

ADR0028/EXTRAS：版本化CG/音乐/场景/成就目录、自动条件锁存/显式解锁、跨存档Profile.extras与源码绑定。CG差分和有界图标、独立音乐、声明函数根的真实场景回放共用生产SDK。场景使用独立生产MemoryStore，主线freeze/flush/资格校验，关闭核验head/profile修订；排队保存不能误thaw，未知状态保持冻结重试、失权停止旧Core。默认鉴赏UI和原创《灯塔来信·收藏室》可玩。

最终check、199单元、112完整浏览器（0 skip/flaky/unexpected）、strict仓库外consumer、65 CLI、4 synthetic、性能/API审计通过。原生--disable-webgl开发实测Canvas可看CG/听音乐/走场景选择，关闭后主线逻辑/IndexedDB保持，刷新和读旧档不抹新收藏。证据 [G5-02报告](evidence/g5-02/REPORT.md) 和source-manifest；带序号日志保留过程失败。SDK SHA256 faed999eb8824e697a5ab51effeffbcbf3042b298b8ecaaf5fb1c186ee1c85d2；CLI c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e，仍本地0.1.0 alpha。

开发服务已运行：http://127.0.0.1:4173/?demo=extras，可加&renderer=canvas。重启export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。构建pnpm build，完整浏览器前停dev释放4173/4174。每Host一套Pixi，打开场景为主/子两个Canvas，关闭回到一个；父子总峰值、大目录/移动真机/其它浏览器未认证。

下一G6-01先定有限屏幕/控件/事件身份和状态恢复ADR，再Schema/真实工厂/Core/Host/默认UI与旧输入拒绝/保存恢复/取消/独立消费；不把CSS可定制或现有热点当完整脚本UI。G6-02完整皮肤/移动布局、G7集成与规模仍未完成，G4-02以来API性能增幅归因继续保留到G7。真实两作N/F/M6缺edition/Program/资源/原档附件/原作继续对照，仍未认证，不阻塞通用SDK工作。
