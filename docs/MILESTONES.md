# 阶段目标、产物与退出门槛

完整任务状态只记录在 [tasks.json](tasks.json)，本文件定义每阶段的稳定验收范围。各项当前状态以任务表和实际证据为准。首轮 CODEX_START 的完成范围固定为 **M0–M2**；后续按 CODEX_CONTINUE 推进，不把初始样例等同最终产品。

## 阶段概览

| 阶段 | 完成后可以做什么 | 必须交付 |
| --- | --- | --- |
| M0 契约与工程 | 校验有限 Program，生成类型/validator，运行真实工程检查 | 有实际代码的主包、版本锁定、Schema 流程、类型/输入负例、导入边界、CI |
| M1 Headless Core | 在 Node 中执行原创故事、分支/调用/等待，保存并正确继续 | 生产 Core、Builder、coordinator、虚拟 Host、任务图和快照、规范 trace |
| M2 初始 Web 引擎 | 浏览器玩完两路线、历史/声音/保存/刷新恢复，独立嵌入 | Pixi/DOM/React、真实音频/资源、IndexedDB/profile、Player、静态构建、packed consumer |
| M3 兼容与扩展 | 新增有状态操作，迁移挂起调用，导入已知合成存档 | extension 工厂、完整调用恢复/迁移、fixture-save@1、recipe、导入/激活报告和回执故障验证 |
| M4 开发者工具 | 用 CLI 创建/检查/构建移植工程，定位缺资源/映射问题 | CLI、模板、port-kit、来源诊断、完整独立消费者任务、操作/能力文档 |
| M5 发行加固 | 可复现构建 SDK alpha，说明真实验证的平台与限制 | 备份/迁移/资源与平台加固、性能测量、版本/API 检查、能力报告和本地发布包 |
| N / F 作品线 | 两作各自从真实原档进入正确状态并继续 | 明确 edition、真实 codec/mapping/参照、必要能力与完整声明范围验收 |
| M6 最终目标 | 交付具备两作已声明支持范围的 galbox-sdk | M0–M5 + N/F 真实认证，SDK/Player/CLI/模板/文档/报告一致 |

N/F 从项目开始并行调查，不等 M5。缺少原作资料不阻止 M0–M5；M6 的真实兼容门槛不会因此取消。M5 可以是清楚标注范围的 SDK alpha，不能提前宣称“两作已支持”。

## M0：有限契约与可执行工程

初始化最少项目：一个主库和测试。选择实际相容的 Node/pnpm/TS/Vite/Ajv/类型生成工具版本并固定。建立 protocol/core/runtime 无 DOM/Node types 的检查以及模块导入约束。

实现有限 Schema、类型和 validator 生成；让一个微型合法 Program 通过结构校验，错误输入被拒绝。Builder/完整链接在 M1，但 M0 的类型工厂和输入验证必须是真实代码。固定数据规范、初始 OperationSpec、诊断代码；不能先把未来所有 opcode 当有效。

退出门槛：干净安装、check/test/build 的已存在范围真实可运行；生成物漂移会失败；类型负例检验实际工厂；JSON 同类错误被 runtime validator 拒绝。CI 配置只运行真实脚本。文档和空目录不算此阶段实现。

## M1：正式 Headless 闭环

实现稳定地址、参数/返回值/局部槽和显式帧；链接器检查地址作用域与帧布局。Core 同步处理语义事件；coordinator 固定受理序号/时间，管理预算 continuation。虚拟 Host 提供可控时间、资源准备和任务结果，而 Core、调度与快照均运行生产代码。

支持下表有限操作。逻辑名称在 M0 对应到正式 Schema/OperationSpec，实际命名一经确定统一使用，不在每轮换名。

| 操作族 | 初始支持 | 初始限制 |
| --- | --- | --- |
| 控制 | control.jump/branch/call/return/end | 单剧情流、登记入口、有限栈深 |
| 值 | value.set、i32.add.checked、明确 i32/string/bool 比较 | source values bool/string/i32/void；无 JS eval，无隐式转换 |
| 正文/选择 | text.page、text.clear、choice；reveal/advance 不同动作 | ADV；固定分段规则与 TextId/ReadUnit |
| 图像 | stage.put/remove/animate | x/y/alpha、线性时间、绝对目标、明确 replace/reject |
| 任务/等待 | task.join、wait.delay | 封闭 all-success 组，明确所有终态；无通用脚本线程 |
| 音频意图 | audio.play/stop/gain | 明确通道；Host 真音频在 M2 接入 |
| 作品状态 | profile.set/flush、checkpoint、save.policy | 当前稳定点/最近安全点/合法等待/禁存的明确结果 |

正文内部记录、资源清单和任务列表可以使用标准协议数组/记录；这不意味着已经实现原脚本通用列表/字典算子。表现坐标的有限数值 DTO 与源值 f64 语义也不同。

退出门槛：原创两路线可在 Node 跑完；嵌套返回值正确；预算 1/8/100 同 trace 一致；任务组部分完成后保存恢复不重复、不死锁；非法帧/等待/未知能力在激活前拒绝；恢复后继续与指定恢复策略等价。

## M2：真正可玩的浏览器初始引擎

实现单 Pixi 图像舞台、DOM 正文、React 菜单、真实短 WAV 播放、HTTP manifest provider、IndexedDB 与 Player facade。原创内容由 Builder 生成标准数据，Playground 不能自己解释故事。开始、揭示/推进、选择、历史、已读快进、暂停、保存/读档/刷新实际工作。

工作 profile 在没有手动存档时也按规则持久；进度批次和回执幂等。槽位/profile/激活/缓存按稳定作品命名空间隔离。加载准备不破坏旧会话，最终提交交接 dirty 进度，持久 head 决定接管资格。故障注入与真实 IndexedDB 集成分别验证。

初期音频恢复采用声明的重播/停止，不假称精确续接。可以禁止资源尚未提交屏障中的保存；禁止范围必须在 Player 权限和错误中可见。未启用原档导入/复杂扩展时，UI 不放会假成功的入口。

退出门槛：

1. 以一次用户开始动作进入完整原创样例，两条路线和不同结局真实可玩。
2. 保存到 IndexedDB，推进后载入正确回退；刷新后仍能载入；普通已读/解锁按声明保留。
3. 部分任务完成后的恢复、旧图片/音频回调、旧加载请求与输入穿透有有效断言。
4. 原创真实图像/音频实际获取和执行；媒体错误有可恢复状态，不被统一 mock 成成功。
5. 反复 create/start/dispose 不遗留本实例订阅、ticker、音频或租约。
6. 库构建并打包后，隔离 consumer 安装 tarball，只用公共 exports 完成播放/保存恢复；不借 workspace 源码。
7. 生成静态发布目录，准确提供 check/test/browser/consumer/build/dev 命令与证据。

M0–M2 完成是 CODEX_START 的交付检查点。若必要浏览器工具受阻，保留未验证，不用静态截图顶替通过。

## M3：扩展与 SaveBridge 框架

实现真实类型化扩展工厂、initialize/reduce、输入输出隔离、可恢复 wait；验证两次调用/恢复不共用错状态。实现 state-only 迁移与完整 SavedInvocation 迁移的边界，版本不相容时拒绝。

实现 `fixture-save@1`：真实 bytes/附件解析 → 来源登记 → mapping → prepare/报告 → 原子导入新槽位/profile → 独立 load。加入有界 recipe、每次加载的候选 profile 更新和 activation 回执。合成格式清楚标注原创，其协议见 FIXTURE_NOVEL。

退出门槛：错格式/错 schema/缺全局附件/过大输入明确失败；准备不修改当前进度；同激活重试不重复钩子；新的明确 load 执行新的钩子；A 失权后不复活；迁移完整挂起调用；不猜 recipe 中的真人输入。至少一个消费者从公共 port-kit 注册并运行扩展和合成 binding。

## M4：第三方工作流

建立实际 CLI：init、validate、assets build、dev、build、saves analyze、verify。没有真实转换器也能使用标准内容流程。只有声明 binding 的项目要求原档分析；CLI 不默认解密或抽取原安装包。

init 模板包含生产 Player、自制输入和真实检查；诊断能追到 Builder/可选源位置、标准地址、调用、任务及映射义务。完成独立消费者任务：只靠公开文档/API 加一个有状态操作、保存恢复、一次迁移和一个合成适配，并从刻意错误找到责任层。

退出门槛：模板在隔离目录安装、运行、验证、构建；CLI exit code/错误报告真实；打包所需文件完整；没有私有源码路径或作者手工补丁才能运行。

## M5：SDK alpha 的发行加固

完善便携备份、内容/扩展版本迁移、发布绑定、资源预算和生命周期故障。按目标素材需要加入长音轨路径和有限表现能力；每增加能力补操作表/恢复规则/验收，不铺开无依据功能。

运行桌面浏览器套件；确定目标设备矩阵并对需要承诺的移动设备实际验证。测量输入响应、Core 批次、解码/GPU/音频内存并记录环境。未测设备明确列为未验证。

退出门槛：API/type diff、能力/版本报告、构建产物、独立消费、核心负例和已声明平台证据一致；本地打包与发布 dry-run 通过。不把 npm 发布或远程部署写作本地任务的默认动作。

## N/F：真实作品与 M6

用户新增的 G0–G7 通用功能扩展独立于原 alpha 阶段，详见 [COMMON_VN](COMMON_VN.md) 与任务表。其完成门槛是 SDK 真正提供通用正文/演出/系统/图文存档/流程图/鉴赏/剧本 UI，并用原创作品和独立消费者验证；实例只声明内容/配置。N/F 缺资料不阻塞 G 任务，最终 M6 同时依赖 G7 与两作真实认证。

分别锁发行版/语言/补丁/指纹/素材/原档附件/原作参照。先做一条“真实原档→标准状态→继续行为→网页再保存”的切片；Fata 风险样本与水仙主线并行，及早检验能力边界。

然后扩大到声明的完整作品范围，盘点必要行为和媒体，不只验证开场。输入未知或超范围时记录义务/差异，不静默降低无剧情状态损失的导入目标。反向导出另有原版加载认证，不能由正向映射反转得到支持结论。

M6 汇总 SDK、工具、模板、操作/能力说明、平台证据与两作兼容报告，核验报告与代码一致。只剩外部发布未授权时可以交付本地发布候选；若真实作品仍未认证，则最终两作支持目标仍未完成。

G1-02 的有限支持集由 ADR0015、PLAYBACK.md 和 SETTINGS.md 约束：协调器 Auto/快进、真实 voice 结束事件、实例物理键映射、显示辅助、v1→v2 偏好迁移及设置 JSON。此项不改变 M0–M2 的 Snapshot 音频启动回执含义；富文本/NVL/可声明文本框仍按 G2 单独验收。

G2-01 有限支持集见 ADR0016、TEXT.md：text.rich、字素/Ruby、safe style、速度/毫秒停顿、淡入/波动/抖动，以及完整 continuation/来源恢复验证和 DOM 预建布局。G2-02 继续 ADV/NVL、多文本框、主题/布局/必要字体与 renderer 端口；当前字素分割实现不扩大为已支持所有排版能力。

G2-02 有限支持集见 ADR0017、TEXT_LAYOUT.md：最多8窗口/16主题、ADV/NVL/显式容量和清页、真实TrueType准备、renderer端口与完整快照闭包。系统字体为显式fallback；不把字号/行距布局当作竖排/禁则/自动分页或完整字形覆盖。

G0-03有限值集和算子见ADR0018、DATA_VALUES.md：checked i64、位模式f64、null、有界有序list/dict、显式纯数据表达式/profile写入和完整内容/调用迁移验证。stored void/undefined、引用heap/循环、回绕和未列算子不借本项计为支持；G3复用其数据基础而不是重开语言实现。

G3-01有限集见ADR0019、STAGE.md：二维pose/父图/矩形clip/基本混合、三类滤镜、相机、fade/crossfade/shake、通道冲突和解析任务闭包。Core时钟完成、Host重建，最多128对象/256保留任务/4图层/8层父图；其它效果、长媒体或长作品尺度不得借用此通过结论。

G3-02有限集见ADR0020、MEDIA.md：WAV/MP3/单流Vorbis/Opus、已验证Blob长媒体element、独立自然完成任务/等待、loop点、Core bus淡化/duck、当前正文语音重播。replay从0，stop-policy活动媒体等待不允许保存，旧audio.play启动ABI保留；网络流/AAC/视频/精确seek/历史回放不借此计入。

H2 图像设备兼容性因用户实际故障插入：H2-01 支持 auto(WebGL2→Canvas)/强制设备，基础画面与存档跨后端，具体边界见 ADR0021/GRAPHICS.md。H2-02 继续 Canvas 滤镜/隔离转场及预算/像素对等，并加入 G7。G3-03 视频/热点/限时交互仍待实现。
