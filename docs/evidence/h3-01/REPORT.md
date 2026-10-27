# H3-01 运行时与历史性能优化

2026-10-27，基线ce29850，分支perf/runtime-history。按用户最新要求优先性能，G7综合内容验收保留。H3-01有限优化验收完成，状态以tasks.json为准；H3-02继续处理图形尾延迟。

## 相同场景前后对照

before/after/runtime-profile.json保存完整原始结果，comparison.json比较同一driver、Node/浏览器版本、历史规模、存储与回溯设置。Node使用真实Core生成历史，trace摘要完全相同；浏览器使用生产Player、Canvas/默认DOM与MemoryStore或真实IndexedDB，所有历史均保留，12个图文存档PNG逐字节相同。benchmark-definition.json记录脚本与场景身份。

| 场景（P95） | 优化前 | 优化后 |
| --- | ---: | ---: |
| Node 1000历史空闲tick | 11.47 ms | 0.068 ms |
| Node 10000历史空闲tick | 92.06 ms | 0.084 ms |
| 浏览器1000历史、IndexedDB、关闭回溯：推进 | 40.4 ms | 4.6 ms |
| 浏览器1000历史、IndexedDB、开启回溯：推进 | 111.2 ms | 47.9 ms |
| 同上：等待持久提交 | 232.1 ms | 62.0 ms |
| 同上：图文保存单次观测 | 518.7 ms | 261.8 ms |

浏览器矩阵有CDP CPU采样开销，不能与无采样基准混算。每配置12次推进是有限样本；图文保存为每场景一次观测，不冒充其P95。CPU记录实际看到JSON私有化/结构遍历、生成的TextState校验、存储回调和PNG编码成本，源码归因结合实际调用路径，不把所有耗时都归因于一个函数。

不带采样的原标准《灯塔来信》基准，三次活动周期、228次语义输入：API P95从22.3ms降至首轮17.3ms，复测15.9ms；两帧观测58.5ms→49.7ms（首轮），复测为50.0ms。保持Core预算1/8/100语义一致，所有既定门槛未放宽。

## 改动与约束

ADR0031/PERFORMANCE说明有限规则。Core.view现在是校验、私有化后的深冻结投影，所有公开状态变更/预算续跑/回执/撤销/recipe使其失效；旧视图不回写新状态。只追加的历史封存后共享，来源改变仍完整校验；普通tick的热字段与历史缓存精确合计原节点数、深度和JSON字符预算。capture/外部恢复仍完整校验、返回独立DTO，不通过截断历史或禁用校验提速。

工作profile按实际变更复用。Player默认DOM不再重复复制整个Snapshot，用户自定义renderer保留原隔离拷贝；脚本UI只复制其需要的ui/wait。HistoryJournal按身份索引/缓存只读文本投影、精确记录容量，不反复扫描序列化整个列表；给自定义Store的批次仍独立，重试固定摘要不变。

HistoryEntry/Record/Commit在每个unknown边界私有化和Schema校验一次。父Schema已验证的子记录继续检查完成正文、唯一身份、真实切点和容量，避免再做整棵JSON复制/验证。内部已解析数据可直接规范化比较，公共canonicalWireJSON仍检查未知JSON；Store的authority/修订/幂等回执/原子提交和磁盘格式不变。

捕获保留每个计算样式，只把完全相同的样式声明合并到独立CSS规则；没有样式白名单或丢正文/控件层。12个静态场景PNG的字节相等，以及原有丰富正文/窗口/图文/两后端浏览器用例共同验证表现。

## 未掩盖的销毁差异

基线三次dispose为21.8/15.8/25.3ms；优化后首轮115.3/61.6/69.8ms，复测56.0/96.4/56.7ms，比基线高。虽均小于既定500ms上限，本轮不宣称销毁优化或无性能回归。

disposal-investigation的生产baseline模式未采用实验修正；带CPU/方法计时的三个样本为65.4/5.4/45.7ms，主要耗时在原生WebGL.loseContext（59.0/4.1/43.8ms），没有释放其他实例的全局资源。这只能定位热点，尚不能证明差异因果，亦不能与无采样数值直接等价。H3-02继续同工作负载/帧提交计数/gl.finish/上下文释放的受控归因，不把清理延后或移出计时区冒充优化。

## 验证与接续

全部命令TMPDIR=/dev/shm。before生产代码来自ce29850；after在修改工作树运行，日志revision仍为执行时HEAD，最后源码由source-manifest和本地提交绑定，不表示基线提交本身已含优化。

- check-second/unit-second：31文件217单元通过；新增稳定只读视图、旧引用、独立capture、回执/撤销/recipe成功与失败、全局字符/节点预算、历史父解析语义与可变输入缓存反例。
- browser.log/browser-results.json：完整124项通过，0 skipped/flaky/unexpected，包括真实保存/刷新/回溯、复杂图文、Canvas/WebGL及自定义renderer隔离。
- before/after runtime-profile、comparison.log/json：同trace/12图文PNG、规模矩阵和相对改善门槛通过。
- before/performance与after/performance-first/performance：无采样基准与销毁波动全部保留；标准Core/API及500ms活动销毁门槛通过。
- consumer.log/consumer-result.json：严格仓库外安装与原生ESM/实际浏览器通过，新增真实冻结视图与可写capture隔离断言；cleanup完整exit0。
- check.log：最后严格类型/生成一致/headless/边界检查通过；install.log为frozen lock安装。
- cli.log/result.json/commands.json：65真实命令、模板/扩展/迁移/导入、实际HTTP/流和浏览器保存恢复通过。
- compatibility.log/synthetic-results.json：4 synthetic通过，N/F真实认证仍needs-input。
- release.log/release-audit.json：基线ce29850，13个公开入口，0新增/0声明变化/0删除；严格声明/native ESM与两包pack/publish dry-run通过，actualPublish=false。运行时只读冻结行为已单独写明，不能用类型零差异抹去这项约束。
- dev.log/dev-probe.log/dev-result.json及截图：原生--disable-webgl/未替换context API、移动表单、图文保存/刷新/两皮肤读取、当前profile和设置保留；单Canvas、0 pageerror。

显式全量捕获/恢复、历史新增和当前IndexedDB命名空间事务仍有随规模增长的成本；不能把10000条Core历史误当作任意内容都能同时落进4MB持久命名空间。当前Canvas轻量ADV矩阵和标准WebGL小说不认证所有UI、移动真机、60FPS或大作品。

下一优先H3-02图形提交与释放尾延迟，再继续G7综合/规模；N/F/M6真实资料缺失照旧保留。没有外部推送、实际发布或部署。

SDK0.1.0 SHA256=6346048d1b126ad743f0f5c6c750af0873661db793b0c9580de57f101ad13c17。CLI0.1.0 SHA256=1cddf7c26ee098dc7e954da685b740c473d787768bbf45c009787262715fc5da。实际artifacts与consumer/CLI/release一致，仍UNLICENSED本地alpha，没有外部发布。

运行：export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。当前http://127.0.0.1:4173/?demo=interface，可加skin=paper/renderer=canvas。构建pnpm build；全量browser前停dev释放4173/4174。性能脚本需要先在基线代码生成before，再在候选生成after，不能拿同一优化版本冒充前后对照。
