# G5-02 鉴赏、成就与隔离场景回放

2026-10-26，基线e8aa105，分支feat/gallery-replay-isolation。ADR0028有限支持集完成，G5-02 done；任务唯一状态见tasks.json。测试在修改工作树上执行，日志revision为当时HEAD，最终源码由source-manifest与本地提交关联。

## 实现与可观察行为

Program.extras声明版本化CG/音乐/场景/成就目录，最多128条、CG每条1–16差分。Schema生成类型/validator，真实opaque引用工厂关联资源kind和场景marker；目录、入口、条件、cap和伪造引用在链接/工厂拒绝。条件限既有有界bool表达式，读取profile/read，不允许运行slot。SDK提供系统/设备/默认UI；作品提供标题/资源/解锁条件/场景函数。

Profile.extras保存目录/资源身份与单调unlocked，extras.unlock显式解锁，extras.check显式检查；新Core初始化、profile写入、确认正文自动检查并锁存。条件失效、读旧档不撤销既有解锁；独立profile分支保持隔离。条件先在候选profile求值，失败不改变profile、正文等待、音频停止效果或待提交批次；读入失败可用原身份重试。解锁使用既有原子ProgressBatch/回执，重复批次幂等。

Snapshot.extrasSignature与Profile.extras绑定目录/素材；存在场景时还绑定函数、globals、RNG、流程图和完整资源集。源变化必须完整迁移所有profile及当前/上一/历史切点，不能靠更新摘要冒充语义迁移。旧无目录程序仍使用原路径。

scene.entry为自身声明的零参数void函数，第一条extras.scene绑定自身条目，专用replayScene根的return结束回放。场景复用正式Player/Core/Host和生产MemoryStore，当前durable profile内容复制后临时修订从0开始；不是流程图导航，不另建演示解释器。原Program/options已私有化，外部修改初始对象不改变回放。回放中的变量、RNG、已读、解锁和profile只写临时Store。child.context=gallery，默认ReplayUI可实际正文/选择/互动/媒体；child拒绝普通保存、导入、重入、嵌套鉴赏。主Player加载/回溯/导入和备份恢复拒绝临时replayScene切点；备份导出保留旧记录，不声称导出会抹除或拒绝原始记录。

主Player打开鉴赏时暂停自己的extras原因、freeze并flush，再核验durable head、profile修订与解锁。打开期间主线系统动作拒绝；排队图文保存捕获前再次检查，不能释放鉴赏持有的冻结。关闭清理独立图片/音乐/child，核验主线head和修订；未知head保持冻结并允许重试，失权或外部修改则停止旧Core/设备，不复活旧写者。取消不等待资源下载，迟到租约归还；主/子/其它实例互不清理对方资源。

CG每次重新获取、私有化、SHA256校验并解码成独立DOM图片，支持差分和有界缩放。成就图标从已验证图像生成96×96缩略图，无绘制能力时提示不可用。音乐使用独立Context和既有buffer/element/版本化流路径，支持循环、自然结束、重试、当前master×BGM×脚本gain；不含任意seek。主线在菜单暂停，预览可运行，隐藏/失焦/用户/设备暂停仍作用预览。

原创《灯塔来信·收藏室》提供真实两张差分、循环/自然结束音乐、带选择的独立回想、自动收藏/成就和复位后的持久解锁。回放会设置replayLeak/replayEnding并解锁secret，主线均不得获得。默认菜单提供分类、锁定状态/遮蔽、CG/音乐/场景/成就。每Host一个Pixi舞台；打开场景时主/子两个Canvas，关闭回到一个。

## 验证状态

所有命令使用export TMPDIR=/dev/shm；无新依赖。除了install/generate/fixture/check/unit/dev，以下命令均设置GALBOX_EVIDENCE_DIR=docs/evidence/g5-02。最终代码在完整browser之前已固定，之后仅增加证据/接续文档，未依赖旧代码通过结论。

| 命令 | 实际结果与证据 |
| --- | --- |
| pnpm install --frozen-lockfile；pnpm generate；pnpm fixture | install/generate/fixture.log；锁文件、生成一致性及全部原创fixtures/manifest通过 |
| pnpm check | check.log；strict/headless/真实工厂正反类型/生成一致/导入边界通过 |
| pnpm test | unit.log，28文件199项（原192+新增7）通过 |
| pnpm test:browser | browser.log/browser-results.json，完整112项（原104+新增8），0 skipped/flaky/unexpected |
| pnpm test:consumer | consumer.log/consumer-result.json；仓库外tarball安装、strict/skipLibCheck=false/native ESM和实际浏览器：CG、音乐、隔离场景、持久成就及已有存档/恢复/备份通过；cleanup完整exit0 |
| pnpm test:cli | cli.log/result.json/commands.json，65真实命令、模板、实际dev HTTP与浏览器保存恢复通过 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json，4 synthetic通过；N/F仍needs-input |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；既定Core/API/三次活动销毁门槛通过 |
| GALBOX_API_BASELINE=e8aa105 pnpm test:release | release.log/release-audit.json；strict声明/native exports，24新增/16声明变化（按入口计）、0删除，两包pack/publish dry-run通过，actualPublish=false |
| pnpm dev；node docs/evidence/g5-02/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-extras.png；原生--disable-webgl，未替换context API，CG/音乐/场景选择/主线不变、刷新与旧档保解锁通过，0 pageerror |

实际extras-result.json：CG两张1280px图片的16×9采样有378个分量不同，独立URL/租约清理；音乐gain约.06→.03，buffer loop跨过物理时长仍playing，element自然结束idle。scene根memory、token=replay-run，回放内replayLeak/secret成立，主线capture与durable状态完全相同。child保存及将replayScene提升为主线槽位均明确EXTRAS_REPLAY_ONLY，head保留。主线collected复位false后collector/letter仍保留；备份独立分支/旧档/刷新保持当前解锁。该API用例同时保留页面基础Player，canvases=3表示基础+主+子三个独立Host；默认UI/dev用例为主+子2，关闭1。

原生开发实测WebGL=false/Canvas=true，实际成就图标96px、音乐playing、场景选项走完；主线逻辑与整个IndexedDB记录逐项相等。回放关闭后继续正文，复位flag，再刷新和读取早期quick仍保最新收藏和当前偏好，replayLeak/replayEnding/secret未进入主profile。运行时一项鉴赏、一个主Player，不代表已测试所有同时存活实例的总资源峰值。

新增单元验证真实工厂/kind/入口/slot条件拒绝、预算1/8/100、profile和读入自动条件检查的原子失败、单调批次/隔离所有权、生产内存Store场景根、完整迁移与部分迁移拒绝、临时场景备份恢复拒绝。

新增8浏览器包含WebGL/Canvas默认界面，CG实际像素差异、真实音乐gain/loop/自然结束、场景选择与profile隔离、读旧档和刷新保持解锁、迟到资源与排队保存交错、未知head可重试/替代旧head不可恢复、双实例与子Player准备失败/销毁、版本化HTTP音乐条件校验、同head外部profile修改后的安全停止。

## 过程失败与修复

check-first/second保留泛型Extract不能沿kind收窄属性的编译错误；先对真实联合验证，再使用运行时类型谓词返回关联类型，未使用双重断言或放宽strict。早期场景设计随后收敛为独立声明函数根，最终ADR/fixtures不以流程图入口伪装隔离回放。

check-tenth/eleventh保留浏览器测试错误读取AssetRequest.id，按正式接口改为request.asset.id。其余带序号日志为过程复验；最终门槛看本目录无序号日志和机器结果。取消/排队保存、外部head/profile修订、读入原子失败和图标等验证逐步补齐，未删必要断言、永久skip或固定成功对象。

## 构建身份和性能

SDK0.1.0 SHA256=faed999eb8824e697a5ab51effeffbcbf3042b298b8ecaaf5fb1c186ee1c85d2。
CLI0.1.0 SHA256=c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e。
实际artifacts与consumer/CLI/release审计一致。仍为UNLICENSED本地alpha，无实际发布/推送/部署或远程CI。Snapshot/Program wire仍1，新可选目录/状态、extras指令和cap构成有限扩展；PlayerView新增必需字段等声明变化不承诺旧二进制前向读取或API稳定。

既有标准小说的软件WebGL基准：语义API P95 25.90ms（门槛50）、两帧P95 66.70ms、最重Core批次P95 1.525ms（门槛4）、三次活动销毁16.7/29.9/13.6ms（门槛500）。这是无鉴赏目录的既有回归基准，不能证明128条复杂目录、场景父子总内存、低配/Canvas/60FPS或完整作品规模；G4-02以来的性能增幅归因仍由G7跟进。

任务表接续校验发现G0-03/G1-02/G2-01/G2-02/G3-01五项历史implementation写为done，已统一为既定complete枚举；任务status/验收结论与依赖未改。

## 已知边界与接续

目录/表达式/媒体/存储使用有界预算，场景设备预算按实例；父子合计峰值内存、复杂大目录/完整作品/低配/移动真机/其它浏览器另验。受信任JS扩展/renderer/provider不是安全沙箱。不承诺无限图库、任意seek或所有GalGame能力已齐备。G6/G7尚未完成，N/F/M6仍缺具体edition、可用Program/资源、真实存档附件和原作加载继续参照。

G5-02验收完毕，下一G6-01：先定义有限控件/屏幕声明、事件身份、状态所有权和恢复ADR，沿正式Schema/工厂/Core/Host/默认UI实现。不会推送、实际发布或部署。

开发服务当前运行在http://127.0.0.1:4173/?demo=extras，可加&renderer=canvas。重启：export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。构建pnpm build；完整browser前先停止dev释放4173/4174。
