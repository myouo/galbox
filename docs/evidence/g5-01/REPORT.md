# G5-01 剧情流程图、节点解锁与声明章节入口

2026-10-26，基线afe6018，分支feat/flowchart-node-entry。ADR0027有限支持集完成。测试在修改工作树上执行；日志revision为当时HEAD，最后源码由source-manifest.json与随后本地提交关联，不表示基线本身含本轮实现。

## 可观察行为

Program.flowchart提供版本化章节/节点/有向边/有界行列坐标。真实flowNode引用工厂、flowEdge、visitNode/unlockNode及ProgramBuilder.flowchart共同进行Schema/链接校验：未知端点/依赖、重复身份/边/位置、伪造ref、非bool条件、运行slot条件、缺能力与错误入口拒绝。条件只读profile/read；Builder推导表达式及扩展值能力，原始wire同样校验。

flow.node设置当前节点并持久visited/unlocked，flow.unlock只显式解锁；数据位于独立Profile.flow，通过原ProgressBatch与不可变回执写入。重复标记不产生重复进度，旧普通批次不能移除已访问/解锁或替换图定义。条件解锁由全部requires访问和unlock表达式计算，不伪称额外持久闩锁；gate每次重入还要成立。自然剧情到达标记不受导航gate阻止。

entry非空必须指向零参数void函数，入口第一条是该节点marker。普通剧情可调用它；enterNode从当前持久profile出发构造真实新Core根，默认globals/RNG/舞台/任务/历史重新初始化，再执行作者前导。根return结束章节，嵌套调用照常返回。当前禁存、旧epoch、只读节点、锁/gate失败、前导溢出/设备失败都在提交前拒绝并保旧head；已提交丢回执沿pending恢复且不重复访问提交，旧写者失权。设备unlock也纳入开始/重入的precommit错误处理，失败不遗留preparing生命周期。

旧会话dirty profile/history先交接，再最终读取durable profile校验gate，UI缓存不是授权。新章保当前profile分支/已读/解锁/偏好，不继承旧导入槽的onLoad；旧槽自身策略保留。普通load/rollback恢复实际快照，不重新执行入口前导或导航gate。Profile绑定图定义摘要，Snapshot绑定整个图/函数/globals/资源/RNG执行定义与合法根，未迁移的定义变化和伪造根拒绝。

默认FlowchartPanel用DOM/SVG连线、章节筛选、锁定标题遮蔽、当前/访问/解锁状态与明确重入确认；返回投影冻结、缓存按会话/profile修订与dirty/current失效，每次投影只验证一次进度定义。图在自身滚动区，菜单不横向溢出；确认至少90%在视口内，长标题有界截断。最终React边key使用序列化节点对，避免合法含冒号ID的键冲突；这项最后UI变更有单独两设备重验。

原创《灯塔来信·航路图》沿同一生产路径展示两条航路、readonly beacon、剧情显式解锁的radio、需要两章完成的archive，以及根/嵌套调用、章首RNG初始化、普通存档/备份分支。素材为仓库原创海岸/灯塔与合成音，不使用真实作品资料或额外解释器。

## 实际执行与证据

所有命令export TMPDIR=/dev/shm，未新增依赖/改锁版本；未推送、实际发布、部署或运行远程CI。

| 命令 | 实际结果 |
| --- | --- |
| pnpm install --frozen-lockfile；pnpm generate；pnpm fixture | install/generate/fixture.log；生成一致、全部原创Program/manifest含flowchart章节通过 |
| pnpm check | check.log；strict/headless/生成一致/边界、真实节点工厂正反类型通过，最后UI修正后重跑 |
| pnpm test | unit.log，27文件/192项（原186+新增6）通过 |
| GALBOX_EVIDENCE_DIR=docs/evidence/g5-01 pnpm test:browser | browser.log/browser-results.json，完整104项（原98+新增6），0 skip/flaky/unexpected |
| GALBOX_EVIDENCE_DIR=docs/evidence/g5-01/ui-recheck pnpm test:browser --grep 'flowchart draws' | ui-recheck/browser.log/browser-results.json，最后React edge key修正后两设备UI重验通过；Core/存储/入口代码未再变化 |
| GALBOX_EVIDENCE_DIR=docs/evidence/g5-01 pnpm test:consumer | consumer.log/consumer-result.json，仓库外tarball/strict/skipLibCheck=false/native ESM与浏览器：声明根、嵌套保存恢复、显式/条件解锁、旧档保新进度、备份profile/重新打开通过；实际cleanup完整exit0 |
| 同evidence环境 pnpm test:cli | cli.log/result.json/commands.json，65真实命令/模板/资源/实际dev HTTP/浏览器保存恢复通过 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json，4 synthetic通过；N/F仍needs-input |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json，既定Core/API/活动销毁门槛通过 |
| GALBOX_API_BASELINE=afe6018 pnpm test:release | release.log/release-audit.json，strict声明/原生exports，27新增/15声明变化（按入口计）、0删除，两包pack/publish dry-run通过，actualPublish=false |
| pnpm dev；node docs/evidence/g5-01/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-flowchart.png：原生--disable-webgl/无context猴补，单Canvas/0 pageerror，章首进入/两章完成/条件解锁/筛选/刷新读旧档后再进入通过 |

新增单元覆盖真实工厂和缺cap/伪造ref/错误入口/slot条件，预算1/8/100一致和重复marker，profile单调及旧快照保新进度，合法新根/嵌套/根return、锁/gate与fresh-vs-snapshot拒绝，源码绑定/非法根/缺marker、冻结投影，部分迁移拒绝与完整profile/快照定义迁移。

新增6浏览器包括两设备默认界面用例。实际flowchart-result.json验证：锁定archive不提交head；shore新根深度1、本地默认7；helper中深度2可存取；旧章stamp=999，新tower stamp=63且RNG draws=1；radio未访问却显式开放，archive两章完成才条件开放；旧prologue槽保两章最新进度，备份分支进入archive不改main，刷新后ready视图也能读持久资格。存储外部改变gate后旧UI提示失效，最终durable重验拒绝；无入口/旧epoch/溢出前导/禁存均保数据；丢激活回复pending恢复只提交一次，旧authority写入拒绝；AudioContext真实关闭导致unlock失败时恢复原Player生命周期。

原生开发实测：WebGL=false/Canvas=true，shore/tower第一次随机章内值相同（63），root archive深度1、stamp重置为0；早期quick恢复后保留两章完成标记/节点进度和fontScale1.25，图过滤正常，原生Canvas1个、pageerror0。没有降低断言、永久skip或固定成功对象。

## 构建身份、性能和边界

SDK0.1.0 SHA256=2bbc6f3ce07d914c1a17448b54cce7aecf57dbfe14e9bb8b7bb52d6fa0c38b3b。
CLI0.1.0 SHA256=c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e。
实际artifacts与consumer/CLI/audit一致；本地UNLICENSED alpha。Snapshot wire仍1，新可选图状态/新flow指令/进度分支显式cap限定；旧无图程序/槽位仍可用，不承诺旧二进制前向读取或稳定API。

标准无流程图小说的软件WebGL基准：API P95 25.50ms（门槛50），两帧P95 67.30ms，最重Core批次P95 1.448ms（门槛4），三次活动销毁 18.0, 18.3, 14.9ms（门槛500）。不是128节点复杂条件/低配/Canvas/完整作品/60FPS或RAM认证。G4-02的性能增幅与G7归因义务保留，本轮不靠该无图基准证明图的最大规模。

有限1–16章节/1–128节点/256边，图定义131072 JSON字符与表达式/Program/存储原有总预算同时适用。只支持声明零参数void函数的完整新根，不支持任意PC/函数参数拼接/自动布局或编剧编辑器。条件解锁不自动闩锁；明确永久解锁需flow.unlock。标题遮蔽是UI阅读体验，公开Program并非加密资料。定义变化需要完整迁移所有profile、当前/上一/历史快照；不能只更新摘要冒充语义迁移。

## 过程失败与修复

check-first/second等保留readonly表达式、非空元组map、判别联合冻结和过长推导声明错误；用Schema复制、保留元组、分支窄化及显式类型修复，未放宽strict/使用双重断言。部分日志可能在修复后已通过，均属过程而非最终门槛。

browser-first/second保留确认框裁切：实际dialog-debug.json/png测得details宽410px、匿名grid内容令确认框宽722px；改为块布局和内部图滚动，保持90%视口/菜单无横溢断言。browser-third六项通过后又加入长标题约束和最终edge key修正；最终完整browser及ui-recheck按相应源码范围覆盖最后实现。未重复扩大原有失败断言或隐藏错误。

## 运行与下一步

G5-01 done。当前dev已启动 http://127.0.0.1:4173/?demo=flowchart ，可加&renderer=canvas。重启export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。构建pnpm build；完整browser前停dev释放4173/4174。

下一G5-02：先定义版本化CG/音乐/场景鉴赏和成就条目、资源kind/解锁绑定及回放隔离ADR，再正式Schema/工厂/系统/默认UI、当前主线PC/profile不被回放污染、持久解锁/刷新/独立消费。G5-02/G6/G7/N/F/M6仍未完成；真实两作edition/Program/资源/原档/原作继续对照缺失保留blocked。
