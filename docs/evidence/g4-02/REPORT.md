# G4-02 历史语音与受控回溯

2026-10-26，基线01b50c8，分支feat/backlog-voice-rollback。ADR0026有限集验收通过；源码由source-manifest.json及随后本地提交关联。日志revision是执行当时HEAD；测试运行了修改工作树，不表示基线已含这些实现。

## 生产行为与支持集

Core接受经Snapshot Schema校验的新逻辑historySession，当前/后续正文historyId由scope+prompt生成，已确认旧ID保持。新安装/回溯/读档的当前正文属于新分支，不能用相同文字套入另一次变量/帧/RNG状态的切点。Coordinator在完整正文实际确认前，只有Core.canSave许可才捕获真正Snapshot，确认成功后记录；显完、旧输入、预算yield不产生点，自动阅读走同一accept路径。禁存或不可恢复媒体等只保留无点原因。Snapshot含逻辑ID而非递归journal。

有界HistoryJournal默认32条/500000 JSON字符，配置1–64条/65536–1000000；过期淘汰、单点超限标CHECKPOINT_BUDGET，不制造精简快照。记录以profile/活动authority绑定，提交固定规范payload的SHA256和幂等回执；交给自定义Store的输入另行复制，不能改变私有重试批次。普通进度和journal分别事务，save/load/backup/接管flushAll覆盖两者，历史写失败不报持久成功，也不撤销已提交普通进度。旧会话新批次拒绝并失权。缺持久端口明确memory-only。

rollback只接受当前可见历史ID/epoch，且当前Core仍须许可保存；使用真实切点经原prepare/freeze/dirty交接/activation head/Host接管流程。恢复帧、局部变量、RNG、文本与活动任务，以当前durable profile/偏好为权威，保留已读/解锁。回溯本身不重复onLoad recipe，但保留未来普通读档策略。坏点/版本不匹配/旧请求/提交前失败保留原会话；提交后失败留pending并可恢复，旧Core不复活。之后正常重新走过的profile指令仍按作者语义写入，不承诺永久禁止后续更新。

历史语音是Host专用AudioContext和源的设备预览，复用已验证buffer/element/版本化HTTP资源，采用捕获时script gain乘当前master/voice偏好，不分配Core任务、不报告剧情started/ended、不新增已读或改变语音门。菜单允许回放；其它暂停原因仍暂停预览。停止、切换、离开历史/关闭菜单、load/rollback/dispose清自己的资源和迟到结果，不取消别的Player。blocked/buffering/failed独立可见，不冒充剧情成功。旧档无historyId能重听已有已验证VoiceRecipe，但没有虚构旧切点。

默认HistoryPanel逐条回放/停止、禁用原因、确认回溯，确认框自动滚动和聚焦，测试要求至少90%在视口内。Player公开historyPolicy、backlog只读视图、replayHistory/stopHistoryVoice/rollback；React不改PC。实例声明策略/素材，原版资料不进入Core。

槽位携带逻辑ID，journal真实IndexedDB持久并随便携备份完整迁移到新profile。迁移须覆盖所有历史来源/切点并保持身份与存在性，不能只改槽位。当前/上一槽和旧档继续可读。原Snapshot 4 MB/10000条文本历史、namespace4 MB/backup1 MB上限保留；新journal不是无限Core文本历史或大作品认证。超限明确拒绝/按已声明窗口淘汰，不截断备份闭包。

原创《灯塔来信·回声书签》通过正式Builder/Program/Player承接：嵌套remember帧、参数/局部值、LCG32抽签、活动线性动画、Opus/短WAV语音、一个明示禁存正文及两条解锁。素材复用仓库原创海岸与合成音，没有真实作品资料或原版兼容声明。

## 实际执行

命令均export TMPDIR=/dev/shm，固定依赖未改变；无外部推送/发布/部署/远程CI。

| 命令 | 最终结果/证据 |
| --- | --- |
| pnpm install --frozen-lockfile；pnpm generate；pnpm fixture | install/generate/fixture.log，生成一致与全部原创Program/manifest含history章节通过 |
| pnpm check | check.log；strict/headless/生成一致/导入边界与真实公共工厂正反类型通过 |
| pnpm test | unit.log，26文件/186项，新增9个历史语义/失败/所有权测试 |
| GALBOX_EVIDENCE_DIR=docs/evidence/g4-02 pnpm test:browser | browser.log/browser-results.json，98项（原92+新增6），0 skip/flaky/unexpected |
| 同evidence环境 pnpm test:consumer | consumer.log/consumer-result.json，隔离tarball、strict/skipLibCheck=false/原生ESM与真实浏览器播放/回放/两层帧回溯/持久journal/备份profile重绑定/重新打开通过；清理浏览器、HTTP服务并实际exit0 |
| pnpm test:cli | cli.log/result.json/commands.json，65真实命令、旧CLI/模板/资源/实际dev HTTP与浏览器保存恢复通过 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json，4 synthetic通过，N/F needs-input保留 |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json，原Core/API/活动销毁门槛通过 |
| GALBOX_API_BASELINE=01b50c8 pnpm test:release | release.log/release-audit.json，strict声明/原生exports、24新增/16声明变化（按入口）、0删除、两包pack/publish dry-run通过，actualPublish=false |
| pnpm dev；node docs/evidence/g4-02/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-history.png，原生--disable-webgl/无context猴补，菜单真实语音、确认回溯、两路解锁、刷新旧档后再次回溯通过 |

新增9单元：预算1/8/100同确认切点；显完/旧输入不产点、嵌套帧/RNG/活动任务与禁存原因；原子ID/修订/旧authority拒绝；失回执核验；窗口/旧ID与单点预算；完整备份/部分与完整迁移；历史失败保已提交已读且重试原批次；JS undefined/number scope在Schema拒绝且不改变Core；自定义端口修改参数并丢回复/暂时无法核验后，私有原payload仍能重试。

新增6浏览器沿真实Core/Coordinator：1)实际语音的Core快照与主media.starts完全不变，gain 0.100→0.050随当前偏好更新，切换条目旧ended不污染新源，回溯两层帧/RNG/动画并换另一分支后两解锁保留，IndexedDB刷新旧槽可再次回溯；2)默认UI90%可见确认与禁存按钮；3)真实blocked/重试/用户暂停/菜单仍暂停/迟到play回执/双Player独立；4)提交前中止保head、丢激活回复留pending/恢复一次、坏PC拒绝不改head；5)版本化HTTP历史实际播放/至少4次HEAD重验、versioned-url不升级digest、无临时URI入档；6)旧无ID档真实语音可播放但不制造回溯点。

history-result.json给出实际快照/局部值/RNG/动画/两解锁/偏好证据，history-ui.png为默认确认截图；dev-result.json证明原生Canvas/单canvas/0 pageerror，返回memory:letter、保留4条已读与echoSent/echoKept。没有固定成功对象或跳过主体来过门槛。

## 构建身份与测量边界

SDK0.1.0 SHA256=56ecef2b6c8c7afa188c8e96005cffec53c29f7f4be23ab20c31104c04add7b9。
CLI0.1.0 SHA256=c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e。
consumer/CLI/audit/实际artifacts一致，本地UNLICENSED alpha。Snapshot wire仍1，添加可选历史字段、未改变opcode/args/phase/wait ABI；旧档可读。不承诺旧二进制前向读新字段或稳定公开API。

标准小说、软件WebGL既定基准：语义API P95 26.50ms（门槛50），两帧观察P95 66.70ms，最重Core批次P95 1.526ms（门槛4），三次活动销毁 24.9, 22.9, 26.7ms（门槛500）。API P95高于G4-01的4.4ms，保留实际差异，不用旧数值冒充本轮；原因未做独立归因，G7应对历史投影/捕获/持久事务分组测量并优化。该结果不是新语音路径时延、60FPS、低配/Canvas/全平台/大作品或RAM/VRAM认证。

仍限既有VoiceRecipe与编码/流策略，不含任意seek/任意原生插件/无限历史；只有当前叙事可见ID可回溯，不能把持久journal当任意章节跳转。媒体设备状态/Blob URL不入档，replay/stop/forbid不因历史预览改变。新逻辑分支historyId和TextId/Revision/ReadUnit分开，刷新/回溯不新增旧ReadUnit。

## 实际失败与后续重验

fixture-first把stage.animate参数误写target，真实工厂拒绝，改id。早期UI探针在start未就绪读undefined prompt，修为等待可推进再确认真实prompt变化。迟到媒体故障探针现在立即调用native.play、只延迟回执，不把外部在取消后重新调用play当SDK迟到；底层Promise也独立generation守卫。长历史确认框实际截图发现可能在滚动区下方，增加自动滚动/焦点与90%视口断言，最终完整重验通过。

browser-regression为首轮完整97过1：旧文本恢复全字段相等断言不认识应分叉的新historyId；现在明确新ID格式/不同旧ID，再全量比较所有其它正文、揭示、停顿和效果字段，原必要断言保留。browser-core-pass为中途98通过，最终browser.log覆盖最后确认框源码。

unit-port-process故障原本只丢一次回复，背景flush合法自动重试已成功，探针仍期待失败；现在offline持续到显式恢复，验证原批次保有权。Scope运行时负例由正式Snapshot Schema拒绝，端口调用复制私有数据，无strict逃逸。

consumer-first记录新增Node测试未推进VirtualScheduler导致顶层等待悬空/exit13，改为外部实际queueMicrotask Scheduler，生产Core不改。consumer-interrupted的断言/JSON已过，但长串行命令随后exit143(SIGTERM)，原因未证实，不计完整命令成功；拆分独立重跑consumer，日志显示浏览器/HTTP完整清理且命令exit0，再分别执行后续门槛通过。其它*-first/second/third等是过程证据，不当作最终通过。

## 运行与下一步

任务G4-02 done。当前dev已启动 http://127.0.0.1:4173/?demo=history ，可加&renderer=canvas。重启export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。构建pnpm build。完整browser前停dev释放4173/4174。

下一G5-01：先定义版本化流程图/章节节点、访问/解锁profile、合法重入与绑定入口/配置的有限ADR，再Schema/真实工厂/Core/runtime/默认UI、失败/存档/刷新/独立消费；不能把文本历史或PC任意跳转冒充流程图重入。G5–G7/N/F/M6未完成；真实两作仍缺edition/Program/资源/原档/原作继续参照，独立blocked。
