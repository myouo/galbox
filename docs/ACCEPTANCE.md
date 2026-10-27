# 验收与证据

当前验收状态见 tasks.json 与 evidence/；M0–M2 已有真实实现和执行记录。任务包检查本身不证明运行时实现。本表保留 v0.6 的 T01–T28；阶段表示最早应处理的能力范围，未启用分支明确拒绝并继续保留后续义务，不建立永久 skip 冒充通过。

同一 T 编号可跨组件和阶段。任务证据须注明实际覆盖的分项；组件分项通过不代表整个 T 场景族或阶段集成通过，M2-05 的真实浏览器闭环及后续阶段门槛仍须分别验收。

## 1. 不同证据的责任

| 证据 | 证明范围 | 不能替代 |
| --- | --- | --- |
| 实际公开工厂的类型正反例 | 参数/身份/类型关联 | runtime unknown 校验、所有权、行为忠实性 |
| schema/链接/恢复负例 | 不合法输入实际被拒绝 | 未来运行全部正确 |
| 虚拟 Host 的生产 Core 回放 | 同 trace 的标准语义、交错、恢复 | 真浏览器字体/媒体/存储 |
| 实际浏览器集成 | 当前浏览器的真实图像/媒体/IndexedDB/输入 | 未测真机、原版语义 |
| 打包产物消费者 | exports/类型/依赖/公开 API 可独立使用 | 作品兼容 |
| 原版对照 | 明确 edition/初态/动作下的状态和后续行为 | 未覆盖整作路径 |

## 2. 核心反例矩阵

| ID | 最早阶段 | 场景与必须观察的结果 |
| --- | --- | --- |
| T01 | M0/M1；M3 补来源/扩展 | 错 opcode/args、资源/值/单位/resume；类型调用拒绝，相同外部 JSON 运行时拒绝 |
| T02 | M0 | schema 变更但生成物过期，检查失败；不得自动改好后假装无漂移 |
| T03 | M1；按后续值能力扩展 | i32 越界/错误转换拒绝，初期不支持值族明确拒绝；启用 i64/f64 等后补全部边界 |
| T04 | M1 | 地址都存在但帧关系/返回槽/phase 不合法，激活前拒绝 |
| T05 | M1 状态公开；M3 扩展 | 修改外部嵌套对象/返回对象或 reducer 抛错，不污染权威状态/RNG |
| T06 | M1 | 同规范 trace 用预算 1/8/100，逻辑结果/保存点/效果意图一致，无重入 |
| T07 | M1 | 等待组时替换成员，superseded 与 completed 区别明确、无死锁 |
| T08 | M1/M2 | 保存与表现观测切点一致；初期绝对动画正确恢复，relative 启用后额外验证只求值一次 |
| T09 | M2 | 音频启动失败后重试，同逻辑任务只结算一次，前置变量不重复更新 |
| T10 | M2 | 菜单关闭不穿透；旧 prompt 按下后释放不选新提示；失焦清瞬态快进 |
| T11 | M2 身份；M3/M4 迁移 | 文本修订/分页变化不误跳未读；有明确迁移或拒绝，不仅比较 anchor |
| T12 | M2 | R1 运行时 provider 返回 R2/错目录/错字节，被核验或按明确校验等级拒绝，不混用 |
| T13 | M2 | 创建/销毁/初始化失败/在途保存时销毁，资源清理与持久结果准确 |
| T14 | N/F | 原版载入画面相似但后续分支不同，必须判失败；没有原作资料则不能标通过 |
| T15 | M4 框架；N/F 真实清单 | 删除已登记必要行为映射，兼容发布阻断，不能因 Program 合法而放行 |
| T16 | M0/M2 拒绝；M5/N/F 能力 | 缺必需视频/热点/特殊文字时明确阻断或列已接受替代，不静默省略 |
| T17 | M2 | 无手动保存的解锁持久；flush 回包丢失不重复；后续未确认增量仍 dirty |
| T18 | M2 | 两会话改写非单调字段/旧快照迟保存，不回写新 profile，不混合未经运行状态；冲突处置无死锁 |
| T19 | M2 通用；M3 带钩子 | A 提交后接管失败，B 后成功，重启及迟到 A 回执均不能复活 A；已提交副作用保留且不重复 |
| T20 | M1 | 组内 0/1/全部完成时保存；新回调乱序/旧回调重复仍只消费应有结果 |
| T21 | M3 | recipe 遇真人输入/真实媒体/跨等待循环，拒绝或留激活后 continuation；不猜结果、不永久准备 |
| T22 | M2 若启用限时；M5 补齐 | 资源 ready 早于输入激活时不提前扣选择时间；未启用限时交互时明确拒绝 capability |
| T23 | M0 helper；M3 codec工厂 | 元组位置/长度和品牌类型不丢；正式登记拒绝同形异族、同族异 schema |
| T24 | M3 | v1 挂起调用到 v2 改 args/resume，完整迁移并重验或拒绝；只改 State 不够 |
| T25 | M2 | provider 共享 bytes 被修改不影响已取得内容；取消后的迟到 lease 归还 |
| T26 | M2 | 两作品同源同名 profile/slot，保存/迁移/清缓存互不影响；同作更新仍发现旧进度 |
| T27 | M3/M5 | 节点删除、无迁移、旧 release 不可取得时保留旧档并准确拒绝，不造 fallback |
| T28 | M2/M5/N/F | 已注册媒体操作但当前格式/设备不支持；区分待用户动作、不可用、未验证，平台声明有实际证据 |

## 3. 首轮额外完成门槛

- 《灯塔来信》通过生产 Core 跑完 shore/tower，嵌套调用 visits=1，两个结局标志各自正确。
- 资源与声音真实执行；Playwright 可验证媒体状态/事件及 Web Audio 路径，但不能将没有实际人耳验收写成“声音体验完全正确”。
- IndexedDB 在浏览器中真实写入、刷新读取；fake adapter 用于精确故障点，不能替代这项集成。
- 在读档、隐藏/恢复、重复点击和 dispose 情形中检查结果，不只检查没有控制台报错。
- 独立 consumer 在临时隔离目录安装主包 tarball；禁用 workspace 源路径；验证声明文件与公开入口，执行一次播放/保存/恢复。
- 不受支持的能力和保存切点给稳定诊断；默认 UI 不暗中跳过。

## 4. 根命令的目标定义

| 命令 | 建立阶段 | 实际工作 |
| --- | --- | --- |
| pnpm check | M0 | typecheck、check:generated、check:boundaries 和确定的静态检查 |
| pnpm test | M0/M1 | 已实现能力的类型/validator/生产语义测试，随阶段扩展 |
| pnpm test:browser | M2 | 启动实际浏览器和应用，验证真实 Web/IndexedDB 路径 |
| pnpm test:consumer | M2 | 打包、隔离安装、类型与运行消费；M3/M4 扩展场景 |
| pnpm test:compatibility | M3 | 明确区分 synthetic 与真实 N/F suites，不把缺资料计成通过 |
| pnpm build | M0 库；M2 应用 | 真实主库/声明与已存在应用产物 |
| pnpm dev | M2 | 启动可玩的开发应用，输出准确访问地址 |

初始化前无锁文件时正常 install，建立后执行 pnpm install --frozen-lockfile。脚本不存在不算通过；不得放“未来实现”而 exit 0 的检查器。CI 对当前支持能力使用相同命令，不把未来测试全部 skip。

## 5. 证据记录要求

G0–G7 新增通用功能的支持集和层次见 COMMON_VN.md。除任务各自验收，所有功能还须有实际公开工厂/Schema、默认系统或 UI、恢复/取消/失败行为、独立消费；实例手写界面或仅存在扩展点不能计作 SDK 功能完成。玩家偏好必须与剧情/profile 分离，跨刷新保留，旧档不得回写旧偏好；图文存档须绑定同一逻辑捕获点，流程图重入不得绕过验证直接赋 PC。

每项证据写命令、工作目录、代码依据（提交或工作树摘要）、工具/环境、退出码、关键观察、证明范围和限制。失败保留最短复现与修复动作。不得编造测试数字、性能、截图、兼容率或未执行命令的结果。

对源码范围改变后的旧结果，补跑受影响验证或标失效。一次变更只跑有必要的检查；阶段交付运行对应整套门槛。不存在为了简单 getter 堆测试的要求，也不为了显得严格无限自审。

G1-02 追加验收：`auto-voice-wait` 使用真实媒体自然结束，启动回执/旧 epoch/旧 attempt/loop/停止回调不能提前推进；暂停不补墙钟，load/replay 重建门控并从 manual 开始。`skip-safety` 在预算 1/8/100 保持一次 tick 一个普通输入，未读需显式许可，到选项的同一稳定结果即停止，不跳 delay/group/operation。`input-bindings` 用双实例/编辑控件/重复按下/跨 load 松键/失焦清理验证范围和身份；设置 v1 迁移保留旧值与 revision，v2 跨刷新保留，坏 JSON/未知键/冲突不改修订，显示辅助不改剧情，默认菜单导入导出/恢复默认实际可用且不横向溢出。

G2-01：`rich-text-reveal` 经真实工厂/Schema/Core 处理求值后 runs、Ruby、换行、样式，按固定版本字素揭示，拒绝跨 run 拆簇及无界/未知样式；reading 不计已读，显完与翻页分开，段内 pause/fade 共享 Auto 完成判定。`text-effect-save-restore` 覆盖速度/字符余量/剩余停顿/显现时刻，预算1/8/100与分割 tick/恢复一致；DOM 预建布局不重排、暂停冻结、新 DOM 从真实 IndexedDB 恢复相位，坏来源/标记缺失/非法 continuation 拒绝且保留旧档。旧 codepoint 档不改解释，公开打包消费者实际运行新工厂/渲染/切点恢复。NVL/多窗口不借本项计作通过。

G2-02：`textbox-layout-restore` 检查全部窗口身份/主题/显隐、布局/字体签名、当前正文来源和history/entry闭包；缺状态/源变化/伪造条目拒绝而保留原档。`nvl-history` 验证ADV替换、NVL确认后累积/容量满明确失败、清窗不删全局历史/已读、两路线/跨刷新与当前设置保留。`custom-text-renderer` 通过公共工厂包装默认DOM，验证字体就绪后创建、快照/Program隔离、逻辑画幅缩放、dispose/迟到取消及提交后失败由新renderer恢复。真实TrueType加载/失败/取消/双实例释放和含字体的独立消费者/CLI均需实际执行。

G0-03：`additional-value-families` 必须通过真实构造/表达式工厂验证i64边界、f64位模式/NaN/±0/∞、显式转换/比较、null与缺键、有序异构集合与树/容量限制；赋值/扩展/候选失败不改变目标、profile、RNG或已发布效果，readonly输入取得所有权。`numeric-data-migration` 验证wrong-kind旧档保留、完整current/previous/profile/帧迁移和args/resume ABI变化必须完整invocation迁移；真实IndexedDB、浏览器刷新/最新profile、打包消费者都须实际执行。生成物原生ESM和深层坏节点/AST大小/诊断仍检查，不因短路错误聚合跳过语义分支。

G3-01：`stage-effects-restore` 用真实工厂/Core保存解析后的pose/filter/camera/overlay/layers/shake与源签名；预算1/8/100、已完成组成员、相对参数变更后load不重算，恢复校验资产/父图/写锁/当前进度；真实WebGL像素检查含半透明转场/滤镜/mask/相机/旋转/遮罩/混合，IndexedDB坏进度保留当前head和原槽。`effect-replace-cancel` 确认冲突先拒绝、replace从当前值开始、cancel冻结且不同于completed、finish显式成功、删除父子取消活动任务、旧动画共用锁、all-success不接受取消/替换；静态源变更/缺scene/层数/资产上界实际拒绝。图像效果不借此计为DOM/UI效果。

G3-02：`media-loop-restore` 检查实际35秒Vorbis无全轨AudioBuffer、原生element时钟/暂停与分段loop、buffer路径、Core淡化/duck进度、当前偏好独立、replay新请求/stop取消/ended不重播，以及坏源/循环/phase/包络拒绝保槽。`voice-replay` 检查当前正文recipe、startup不同于自然结束、重播不增加已读、不重新打开已完成结果、Auto实际等待Opus/WAV/MP3自然完成、epoch/attempt迟到回调拒绝。`media-unavailable` 检查codec初始化前拒绝、blocked同任务新attempt、永久play失败持久pending与新Host接管不重复提交、悬而未决play的dispose及时清理及迟到Promise不复活源。CLI真实压缩资源失败保持原manifest；仓库外tarball消费和便携备份沿相同路径。

H2-01：`canvas-fallback` 必须实际禁止 webgl/webgl2，验证默认 Pixi Canvas 绘图、常规像素、原创新增/已有路线/IndexedDB 刷新/音频，强制后端与实际 GL init 失败区分。`renderer-save-portability` 验证 WebGL→Canvas→WebGL 同一槽位和便携备份不回写旧进度；`graphics-capability-refusal` 验证 Canvas 缺滤镜/隔离转场前置拒绝不 acquire/activate、双设备失败清理、迟到取消、坏候选保留 head/槽和原场景。独立 tarball 必须在禁止 WebGL 后沿公共 createPlayer 默认选项实际 Canvas 播放，并由 GL 读回同槽。Canvas 滤镜与隔离合成的剩余义务为 H2-02，G7 不可跳过。

H2-02：`canvas-effects-conformance` 验证同一生产Core/Builder下的二/四层透明交叉淡化、brightness/grayscale、父子组与相机滤镜、mask/alpha/blend的实际RGBA；blur有声明容差并验证无原生filter时CPU预乘fallback；无WebGL原创舞台两路线/活动保存/刷新/跨后端与独立消费者均需实跑。`canvas-composition-budget` 验证纯计划器的路径深度/blur padding/工作数组预算、候选超限保head/槽/上一画面、运行时滤镜失败不提交半帧、恢复context与自有缓冲销毁/隔离；预算是逻辑估算，不冒充浏览器RAM。旧H2-01未支持滤镜的拒绝用例随能力启用改为相同副作用断言下的预算拒绝。

G3-03：`video-save-policy` 检查实际VP8/Opus/Vorbis/无音轨的结构与浏览器解码/同Pixi视频像素，startup不同于end、skip不同于completed、replay新身份从0、forbid普通切点禁存、初始pending失败/重建Host不重复profile，blocked/迟到Promise/end/dispose正确。`hotspot-input` 检查viewport转换/边界/高序号enabled命中、disabled/键盘/旧epoch-attempt与按下后跨提示不穿透，默认UI与公开工厂/独立consumer真实运行。`deadline-activation` 检查prepared不扣时、先结算准备时间再激活、暂停冻结、恢复新attempt且保留已耗时间；停止RAF仍能按受理时间拒绝迟到点击，t>=deadline执行作者明示timeout。真实IndexedDB保存/刷新与全流程/portable backup/CLI媒体发布均需重验，不猜选择或媒体完成。

G3-04：`versioned-media-stream` 以实际慢速HTTP记录发送区间去重，证明启动时audio/video已解码且未传完整文件，不能只看响应未关闭；保存/恢复/无WebGL/独立tarball与CLI公开HTTP服务都需实跑。`stream-integrity` 检查显式策略/正式release、catalog/kind/MIME/版本/长度/强ETag/Range/immutable与实际metadata，弱/错误头/redirect/伪造provider身份拒绝，诊断不能把expected升级digest，旧目录/版本槽保留并拒绝。`stream-cancel-isolation` 检查迟到租约恰好归还、两活动实例共享provider仍各自取消、断网不冒充end、release异常仍释放其它自有资源，候选版本失败保head/profile/槽。

G4-01：`same-cut-thumbnail` 用真实 PNG 像素和 DOM 字体/Ruby/NVL/揭示状态验证正文+舞台，延迟写入后剧情已变而图/摘要/快照仍一致；WebGL/Canvas 均实跑，自定义无 capture、禁存/abort 要拒绝。`atomic-slot-image` 检查事务失败不改旧槽/上一修订、完整 payload 摘要回执/失回执核验与 unknown 同 payload 重试、dispose 后已提交准确返回，备份携带成对图片且保当前进度。`slot-management` 检查默认 UI 命名/确认覆盖/删除/上一修订、expectedRevision 冲突、自动循环/读档不覆盖/profile 快速隔离、真实 IndexedDB 刷新和 strict 独立 tarball。

G4-02：`backlog-voice` 要真实buffer/element/版本化HTTP语音，菜单暂停剧情仍可回放、当前master/voice偏好、其它暂停原因、blocked重试/迟到取消/双实例隔离；Core PC/等待/已读/语音门不因预览变更。`rollback-progress-authority` 要预算1/8/100真实确认切点、显完/旧输入不产点，嵌套帧/RNG/动画恢复且当前已读/解锁/偏好不被旧档覆盖；禁存/超限/旧档无点/坏点/失败/提交后pending、实际IndexedDB刷新、完整journal备份迁移/旧会话拒写、默认确认UI与strict独立消费。

G5-01：`node-visit-unlock` 需真实工厂/Builder正反类型、坏边/位置/入口/slot条件拒绝，预算1/8/100相同访问/显式解锁、当前profile派生条件与只读投影隔离、单调幂等批次/旧档不抹新进度。`graph-safe-restore` 需声明新根/嵌套return与恢复、重置章内globals/RNG、只读节点/锁/gate/当前禁存/过期epoch、最终durable重验、准备失败/失回执pending/旧写者拒绝、定义漂移/完整备份迁移、真实IndexedDB刷新、两绘图设备的默认图/筛选/可见确认与strict独立tarball。

G5-02：`gallery-unlock-persistence` 验证真实kind关联工厂/声明场景入口、纯profile/read条件/自动检查原子失败、预算一致/不可变单调批次、flag复位与旧档/刷新/备份迁移保解锁。`replay-isolation` 验证CG真实像素差分/图标、buffer循环与element自然完成/版本HTTP完整性等级、同一生产场景实际选择及写入仅落临时Store、主线PC/RNG/等待/head/profile保持、排队保存不thaw、资源迟到归还/双实例/准备失败/dispose、未知head冻结重试及失权/外部修订拒复活、默认UI与strict独立消费。

G6-01：`script-ui-state`需真实工厂/屏幕成员/资源kind/字段dest类型关联，预算1/8/100、编辑与剧情变量分离、统一按钮提交到嵌套帧、错误值/格点/隐藏禁用控件不改状态；`ui-event-generation`需prepared/active、新show/读档/暂停的输入身份隔离、旧DOM/按住键/IME迟到不污染新屏、双实例/dispose；`ui-restore`需保存全部字段/等待、源身份及上一修订完整迁移、图文包含实际UI像素、IndexedDB刷新与旧档保当前profile、设备失败不产不完整缩略图且新Player能恢复、WebGL/Canvas/strict打包消费者。

G6-02：`default-game-ui`需标题/继续/新开始、系统菜单、保存读取分页/确认、历史/流程图/鉴赏及备份/独立进度实际工作；`theme-only-instance`需真实皮肤工厂/资源kind/未知动作拒绝，双配置共用执行定义、旧档保当前皮肤/偏好、只读所有权/多实例和迟到导航拒绝；`touch-keyboard`需窄/矮视口内容可达、44px主要目标、实际触控滚动/拖出取消、按键身份/Tab/Escape/确认焦点、连续设置写入、移动表单完整图文保存/刷新、WebGL/Canvas及strict独立包。

H3-01：同一工作负载比较Core与Player/历史/存储/捕获；Node trace、实际存档PNG与保留历史一致，长历史tick/推进/flush有可重现改善。必须验证只读视图旧引用/回执/recipe成功失败/撤销的失效、全局节点及字符预算、可变外部输入不污染缓存、自定义renderer/Store隔离，以及浏览器/打包消费和销毁长尾的实际记录。

W1-01：相同6000指令、预算1/8/100的snapshot摘要一致；独立Node与真实浏览器测量查找/计算成本。浏览器timer/rAF必须在Core仍计算期间得到执行机会，不能把后续存储I/O的让出算作计算响应。真实Player菜单/预算保存拒绝/旧输入单次消费、启动dispose与supersede、timer后备、实例隔离、自动阅读新页延迟、失败构造无端口泄漏均回归；tarball独立消费重复长计算/保存恢复。同步校验和插件仍单列限制，不声称Worker已实现。

H3-02：生产Host固定61帧/960ms，同最终状态比较WebGL/Canvas、burst/rAF及none/finish/readback。报告提交、等待、dispose和总耗时；清理后设备计数为零、无全局资源清理。抗锯齿实验单列实际参数，未采纳的画质/时序实验不能当成生产提升。

W1-02需通过：四策略请求范围、同版本慢HTTP前后对照（首屏/请求/驻留估算分别记录）、真实旧像素/正文保留、必需失败/重试不重复逻辑和效果、预取不猜分支、预算拒绝、取消迟到租约与新head、LRU后跨刷新/跨策略读档、字体/媒体/流/UI/鉴赏、原生无WebGL与独立打包消费。全套既有设备/存档回归不能替代新策略行为，但同样不得省略。
