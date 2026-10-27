# W1-02 可选择的加载策略与资源工作集

2026-10-27，基线fe86769，分支feat/loading-strategies。用户要求多种策略，设计/配置/限制见[LOADING](../../LOADING.md)和ADR0033。本轮有限支持集验收完成，状态以tasks.json为准。

## 可观察行为

四种策略使用同一生产Core、Coordinator、WebHost、AssetCache和ResourceLoader：eager完整预载；demand只准备当前依赖；balanced有限直线前看；chapter按照作者声明的函数/资源组准备。默认eager仍串行，其他默认并发3，可显式设1–8。非eager需要正式release，字体/标题/成就图标启动准备；Program/存档格式没有加入缓存句柄。

所有当前画面/候选/预览引用固定，未使用驻留项按LRU淘汰。资源等待中保持旧像素与正文，保存/flush拒绝；失败保留目标和未分发效果，重试同一轮次，不重复变量/历史/声音。准备器获得独立效果DTO，不得污染重试队列；候选取消和新head资格仍沿既有规则。默认UI有加载/重试提示，旧表单输入在准备中禁用。跨策略、淘汰后及刷新后的读档重新准备同一逻辑资源。

## 性能对照方法

`profile-loading.mjs`在真实Chromium原生--disable-webgl下运行生产Canvas/Player。18张原创小SVG，每次HTTP响应人为延迟60ms并关闭缓存，第一段文字不需要图片，随后使用两张图；每种策略单次观测，首次正文停留150ms让有限预取获得阅读时间。计时从SDK模块已加载后开始，不能当作整站冷启动、P95或实体手机表现。

before是fe86769独立worktree源码，独立node_modules/galbox-sdk指向该worktree本身；build-source.json绑定Host/Coordinator/编译Host/harness SHA，确认不含新LOADING_RELEASE_REQUIRED实现。before中的四个mode参数在旧版不受支持，全部仍整目录预载，不伪称旧版已有四种策略。基线pnpm自动依赖验证曾因外部依赖软链接拒绝清理，原日志保留；未绕过它删除依赖，后续编译/测量成功并记录实际解析位置。

相同driver SHA、浏览器版本、Program生成逻辑、资源字节/延迟、读停时间和显式16MiB驻留预算做对照。compare-loading核验最终逻辑结果、请求数和创建时间相对门槛。原before-first用过不同预算/驱动，仅保留过程，不作为最终对照。after-first为初轮测量，最终after须对应最终源码重测。

初轮观测：旧创建1174–1224ms；显式并发3的eager约498ms，仍请求18张；demand约25ms、balanced约21ms、chapter约23ms，仅请求2张。demand随后两次推进约74/67ms，balanced约10/4ms；chapter将准备成本移到start（约94ms）。后两者没有消除网络成本，也没有猜用户分支。图像纹理估算从4,147,200字节降到460,800字节（2张对18张），不是整个浏览器实际内存减少了相同比例。

## 已知范围

原release目录/资源上限保留，设备驻留是单独估算预算，不是整个浏览器heap/GPU硬限制。图片解码与GPU纹理共同持有/淘汰；HTTP层和设备驻留分开，但独立持久字节缓存/先下载再按需解码仍属W1-04。旧eager CG保留独立预览副本，不能把新缓存估算解释为覆盖该临时副本。跨实例共享、运行时切换、离线安装、Program模块和大作品存储仍未完成。

## 验证过程

- check-first发现streamRequest导入位置错误，已修正；check-third/fourth发现章节非空元组与测试工厂调用错误，已修正，未放宽类型。
- 新4项单元覆盖真实工厂、静态前看不执行剧情、并发/优先级/LRU、取消与晚资源、真实Core资源失败/重试；最后加强效果DTO所有权与commit抛错反例。check-repair和unit-repair通过：33文件225单元。
- browser-loading-first/second验证请求范围、旧像素/正文、默认UI重试、预算拒绝、旧候选晚租约、淘汰后IndexedDB跨刷新/跨策略恢复。
- browser-features-first覆盖真实字体、媒体、版本HTTP流、UI截图表单、CG/音乐/隔离场景的按需准备。
- browser-first完整139项中138通过、1失败：默认并发3使取消前打开两个流，而旧反例要求串行只开一个；两份租约均只归还一次。修复为eager兼容默认1，并新增显式并发3逐资产归还测试，保留失败log/json/trace，未删除或放宽断言。

browser-second的141项中140通过、1失败，进一步发现失败批次会在错误传播到上层前启动下一个排队资源。AssetCache现对批次首错立即释放/取消剩余项，并保持原始失败原因；新增单元及原串行/新并发/预取失败/UI重试4浏览器修复验证通过。准备commit抛错也会进入明确失败状态，效果输入隔离已补反例。

最终逻辑/设备版本全量141浏览器通过（0 skipped/flaky/unexpected）。收尾检查发现带皮肤GameUI未挂载加载组件，随后补接并用真实推进/重试按钮验证classic/authored两种UI，成功后清理旧notice；相关loading/presentation/extras 28项全部通过（ui-final），替代前次全量中相应UI证据。最后仅增加实际模式的DOM诊断属性，由原生dev断言验证。

最后UI版本已重新通过严格check、独立consumer、65 CLI命令、API/打包审计、标准性能和相同驱动加载对照；原生dev验证实际模式从demand变为balanced，保存/刷新/两皮肤恢复成功。无外部推送、发布或部署；N/F/M6真实材料缺失仍保留。

## 最终观测与验证

| 策略 | 旧版createPlayer | 新版createPlayer | 新版start | 两次推进 | 实际图像请求 |
| --- | ---: | ---: | ---: | --- | ---: |
| eager | 1224.0 ms | 447.8 ms | 25.8 ms | 9.6 / 4.9 ms | 18 / 18 |
| demand | 1176.6 ms | 23.2 ms | 26.1 ms | 74.9 / 68.1 ms | 2 / 18 |
| balanced | 1174.2 ms | 22.3 ms | 28.0 ms | 10.7 / 3.6 ms | 2 / 18 |
| chapter | 1175.6 ms | 23.6 ms | 96.7 ms | 10.2 / 3.7 ms | 2 / 18 |

本表统一显式并发3、16MiB估算预算；库的eager默认仍为1，不将显式并发收益冒充默认策略变化。snapshot最终资产、正文、历史一致，并做真实保存/恢复。`comparison.json`和最后`after/loading.json`为最终候选；旧测量保留作为过程。

- `install.log`：frozen lock安装通过。
- `check-gallery-final.log`：最后严格类型、生成一致性、无DOM/Node headless与导入边界通过；consumer-types-first也通过。
- `unit-repair.log`：225项/33文件通过，包括5项新故障/策略/所有权用例。最后变更仅UI呈现与对应浏览器验证，没有改变这些Core/资源逻辑。
- `browser.log`/browser-results：生产逻辑与设备全量141项，0 skipped/flaky/unexpected；之后UI收尾由`ui-final/browser.log`/results的28项覆盖loading/presentation/extras。当前总计143用例（browser-list仅列举，不冒充执行），不是宣称最后版本又完整执行了143次。
- `consumer-complete.log`/consumer-result：仓库外tarball安装、严格声明/native ESM及真实浏览器全部通过；公开loadingPolicy四模式创建/播放/保存恢复，禁用私有路径依赖，清理exit0。
- `cli-complete.log`/result/commands：65真实命令、模板、扩展/迁移、流式HTTP和浏览器存读档通过。
- `compatibility.log`/synthetic-results：4 synthetic通过；N/F仍needs-input，不认证真实原作。
- `release-complete.log`/release-audit：基线fe86769，13入口；新增LoadingOptions/parseLoadingOptions/loadingPolicy，Player/PlayerOptions/PlayerView和testing的Coordinator/HostPort有声明扩展，无删除；Snapshot版本未改，两包pack/publish dry-run通过，actualPublish=false。
- `performance-complete.log`/performance.json：标准小说3活动周期、228输入，原Core/API及500ms释放门槛通过；API P95 16.0ms，dispose最大117.7ms，拥有的canvas/asset/texture/PCM/audio全部归零。该场景与前轮相近，未宣称每个指标都提升。
- `profile-verified.log`/comparison：同脚本、环境和逻辑结果的加载对照通过。SDK模块加载不计入本计时，完整冷启动拆包仍W1-04。
- `dev-probe.mjs/log`/dev-result及PNG：实际pnpm dev，原生--disable-webgl、未替换context API，390×844触控模拟；DOM读取并断言真实模式demand→balanced，图文表单、设置/当前profile、刷新及两皮肤读取，单Canvas、0 pageerror。

galbox-sdk 0.1.0 SHA256=`485ee365a6e99b35e3048c588cd0c57c4d40b1393ded579f5114392a0b97f423`。

@galbox/cli 0.1.0 SHA256=`1cddf7c26ee098dc7e954da685b740c473d787768bbf45c009787262715fc5da`。

consumer/CLI/release与artifacts实际字节一致；pre-ui保留先前包的结果，不混用旧SHA。源码绑定source-manifest与最终本地提交；报告中的revision在测量时仍是基线HEAD，并非基线已包含新实现。

运行：`export TMPDIR=/dev/shm`；`pnpm install --frozen-lockfile`；`pnpm dev`；`http://127.0.0.1:4173/?demo=interface&loading=balanced`。build为`pnpm build`。全量browser前先停dev释放4173/4174；consumer/CLI/perf各自顺序运行。性能复现先用基线生成before，再用候选生成after，不能同版本伪造对照。

旧硬编码playable.png与--list生成的公共browser-results已恢复原提交字节，当前证据全部在本目录。dev-first记录第一次验证，最后dev-result含真实模式断言。下一W1-03模块/存储，W1-04持久字节缓存/离线/发布/平台；当前仍不认证大作品、全浏览器或全部离线能力。

最后的低驻留检查发现deferred CG在显示后仍把准备信号绑定到使用期租约。已改为准备完成后解绑该取消信号，只有视图release/Host dispose解除固定；新图预算失败不移除旧图。gallery-final的21项浏览器及最后打包/native已通过并覆盖这一收尾版本，主线Core/存储/其他加载路径未更改。

最后标准基准的dispose最大117.7ms，高于W1-01的67ms，仍低于既定500ms门槛；保留实测波动，不宣称销毁提速或消除了H3-02软件GPU尾延迟。
