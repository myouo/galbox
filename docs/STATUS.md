# galbox-sdk 当前状态

2026-10-28，基线4c5e234，本轮G3-05有限灰度规则图完成；F-01/F-01A继续，F-02原档未开始。保持TypeScript Core/Web Host、单Pixi舞台/Canvas后备、DOM正文、可选React和IndexedDB。真实作品在SDK外依赖实包，游戏内无实验UI，不逆向exe。

G3-05/ADR0039：stageRuleTransition、Schema/Protobuf、并行任务与写锁、cancel冻结/活动finish、from/to/rule恢复闭包、宿主预检和有界合成已经落实。两后端同一整数内核/复用缓冲/同相位不重算，默认64MiB逻辑工作区预算；Canvas另合计。Player初始启用允许禁存标题，普通保存仍拒绝。有限集与限制见STAGE/GRAPHICS及evidence/g3-05/REPORT.md。

验证：check通过；39文件252单元；最终5项新浏览器通过，相关舞台/Canvas/载入21项回归通过，不宣称重跑全部历史集。独立consumer真实安装/类型/播放/保存/恢复通过；实包230文件505337字节、14入口，无游戏/测试/日志/证据/JSON Schema/maps。SHA256=32a636e668027363fe8ff06f261e61ac2682222386606511f3b149faf79ab91c；只本地提交，未发布。

独立工程/home/myo/Desktop/galbox-fata-morgana精确安装该包，冻结/strict边界、3 Python+15 TS、8语言源trace/两次恢复与4浏览器通过。标题现在由Core执行原3秒淡入、循环钢琴曲、2.5秒规则菜单，再接22页旁白；实际禁WebGL、图文保存、刷新与语言隔离通过，截图已目视。静态children目标页保持原30像素位移；音频首次手势解锁。转码资源按编码后摘要命名，全语言结束再验资源闭包，重复转换24份protobuf摘要一致，另记实例证据。

尚非完整开场：标题离场与OP44/其音轨、按钮SE/其余菜单、正常对话宏/变量/角色上下文、中日.tft及完整i18n、整作和原档未完成。701份KS raw IR/3337宏候选仍只是分析输入；原档/global与原作继续参照缺失。旧确认功能G2-04不受此扩大。I1、模块/存储容量/离线与G7总体仍待完成。

下一F-01A先按title.ks的scenario分支接4秒离场规则、3秒背景淡出和5秒BGM衰减，再从start→OP44→prologstart建立源效果/音轨序列及宏CFG。保持源分析和实际公开工厂；未知效果明确记录，不改成普通淡化或另建解释器。SDK pnpm dev为原创验证应用；独立游戏pnpm dev在4180默认Canvas，?lang=zh/en/fr/it/jp/ko/pt-br/ru。

本轮独立Program/release发生变化，无隐式旧槽迁移；已有槽保留，未经迁移的旧发布明确拒绝，不通过删除槽位掩盖不兼容。
