# 实现必须保持的核心契约

本文件是实现检查表，完整解释见 [v0.6](reference/GalBox-SDK-v0.6-Implementation-Design.md)。阶段未启用的能力不必提前实现，但必须明确拒绝，并保留后续任务；不能在先实现一个“临时版本”时破坏这些状态结构。

## C01 输入、类型与所有权

wire 输入先 unknown，依次校验 schema、值范围/规范表示、引用/能力/恢复阶段。Schema 与生成 TS/validator 同源；内部 Normalized/Linked 对象经受审查边界生成。品牌类型防误接，实际 release/来源/版本仍要核验。

opcode/args、变量/值、资源/kind、wait/resume、codec/source key 使用关联联合或受控工厂。codec 身份从一侧锚定，不能让泛型联合推断接受同形异族。DeepReadonly 保留品牌基元与元组，所有权由私有化/复制保障。公开对象、扩展参数和返回对象后续被外部修改，不得影响权威状态。

## C02 值、地址与调用

初期 source values 为 bool/string/i32/void；i32 构造范围和 checked 运算明确。其他值族未启用时校验拒绝。地址稳定且与操作阶段分开，PC 表示下一指令；显式调用帧保存参数、局部值、返回位置/目的槽和布局版本。恢复不只检查地址存在，还检查帧关系、局部类型、phase 与指令相容性。操作数、栈深和数据大小有限额。

## C03 事件、预算与时间

所有逻辑变更串行受理；固定接收时间/序号，再在合法语义边界裁决。Host/cache/订阅回调一律入队。预算 yield 不能让外部输入插入不同中间状态，不能重复上一事件。保存只发生在声明的语义切点；stop/dispose 可以终止调度，但预算 continuation 不因此成为存档点。

Core 不读取 Date/Math.random/设备时钟。随机能力如启用要固定算法与状态。限时提示起算依 prompt activation（舞台/文本/输入已逻辑就绪），不依下载完成；同一规范时间 t < deadline 接受，t >= deadline 超时。不同暂停原因只解除自己负责的原因。

## C04 任务、失败与恢复闭包

一个剧情控制流、并行表现任务。TaskGroup 成员封闭，首版 all-success；completed、settled、cancelled、superseded、failed 不互相冒充。替换先结算旧逻辑任务，等待旧句柄不会永远挂起。blocked 是可重试状态，不是成功终态。

快照包含所有活动任务、被其他状态引用的结果/组/等待、消费状态和恢复计划。恢复保留逻辑关系，建立新 Host epoch/attempt/request 身份；已完成成员不重新推进剧情。重试同一逻辑 effect 不重新做变量更新，旧 attempt 失效。无人引用的结果可以回收。

## C05 保存与资源屏障

同一 captureSeq/time 取得不可变快照，不混用后来字段。已求值文本、已解析动画起止值/曲线/经过时间、保存权限和 profile 依据都明确。relative 动画若启用只求值一次。

M0–M2 可禁止资源尚未提交屏障中的当前保存，并返回原因/已有安全点；不能声称同时保留旧画面与新目标却没有相应状态。Host 暂停原因在新环境重算，不把旧隐藏/菜单状态当永久暂停。音频重播/停止是明确策略，不伪称任意采样点精确恢复。

## C06 工作 profile 与持久提交

Core 只读当前会话工作视图，profile action 与逻辑 transition 同步更新。Storage 不直接热改活动 Core。默认在语义等待/end、明确检查点及 save/load 前汇集 dirty 更新；要求持久后继续的规则使用 flush 屏障。

progressCommitId 绑定固定基修订、工作序号范围和摘要；回执与 profile 同事务提交。同 ID 重试不换内容；确认只清已提交前缀。不手动保存也应按声明规则保留已读/解锁。冲突默认不做非单调合并，明确分支或放弃未持久变化后重载；避免 load→flush冲突→load 的循环阻塞。

旧 SnapshotHandle 只授权写捕获槽位，不授权回写旧 profile；捕获依据不得重标成最新 durableRevision。需要捕获值的恢复策略必须包含相应引用闭包。

## C07 加载激活与故障阶段

prepare 在候选上完成；loadRequestGeneration 防旧准备结果覆盖新请求。最终提交前冻结旧 Core，处理其在准备期间新增的 dirty 更新并重验候选；准备再次放开旧 Core 时，最终屏障要重做。

持久层按稳定命名空间/恢复通道维护 activation head/顺序与 committed-pending、activated、superseded、abandoned 状态。必要 profile 更新、候选/回执和 head 同事务提交；一旦提交，旧 Core 失去叙事与写入资格。新 Host 接管失败只能重试当前候选或明确新激活，不能假装回到提交前。

A 被 B 取代后不能因重启或迟到回执再次接管；A 已提交副作用仍保留。导入槽位不自动改变 activation head。没有跨 IndexedDB/GPU/音频的 ACID 承诺。

## C08 SaveBridge 与 recipe（M3 起）

codec 只解释已知格式，mapping 解释加载语义和投影；OriginalState 不强行统一。导入先 prepare/报告，再 commit 到新槽位/默认独立 profile，load 另行发起。计划依赖改变要重新规划，不能改修订号继续用旧报告。

recipe 使用同一 Core 的有界恢复阶段；有入口、允许操作、结束条件和总步数/规模限制。冻结输入、候选当前视图及候选写入独立，不能改活动 profile。未知真人选择/媒体结果不能由虚拟 Host 猜成功；真实交互留为激活后 continuation。

stable、before-recipe 基线和 after-recipe 激活候选区别明确；准备模拟不消费钩子或把副作用算两遍。导入/导出分别认证，fixture-save@1 只证明框架流程。

## C09 扩展与迁移（M3 起）

冻结注册表，每个 invocation 独立 State；initialize 只在新调用时执行一次，恢复不重复初始化。同步 reducer 输出全部校验后原子提交；抛错不得改变权威状态/RNG。输入和输出所有权隔离，宿主副作用在提交后处理。

migrateState 仅覆盖 args/phase/wait ABI 相容的变化；完整 SavedInvocation 迁移需要处理 args/state/phase/wait/逻辑请求，并重新链接。没有迁移则保留可取得的旧实现或明确拒绝。已登记 TS 插件是受信任代码，不宣称同 realm 安全沙箱。

## C10 资源、文字与平台

运行绑定不可变 release。资源目录身份、逻辑 kind、内容身份及实际校验等级分开；预期摘要不等于已验证字节。外部 bytes 默认由 Host 私有化再校验，租约取消/迟到归还不破坏其他消费者。

ProgramAddress、TextId/Revision、ReadUnit、continuation、LayoutProfile 不混用；保存已求值文本和规范揭示位置，不保存 DOM 行号。已读在声明时机记入 profile；翻译/重排的继承有明确映射。关键文本分段规则固定/锁定，不能依不同环境的未约束规则改变 continuation。

媒体/图形操作已注册不等于当前资源可执行。环境报告区分可用、待用户动作、不可用、未验证。普通文件 provider 刷新后可以要求重新选择并核验内容，不持久化旧 blob URL 作为资源身份。

## C11 存储、版本与生命周期

storageNamespace 由 gameId+saveCompatibilitySeries 构成稳定身份；profile/slot/回执/迁移在其中唯一，releaseId 不导致每次更新都“丢失”进度。缓存清理不能误删同源另一作品。

保存事务成功后才报告持久成功；保留上一有效修订和可携带备份。无迁移且旧 release 不可取得时，准确报告不可恢复并保留旧档，不制造检查点。新内容在明确边界切换，不混用发布代。

dispose 幂等，清理本实例输入/ticker/媒体/租约，不能关闭不归自己所有的共享依赖；已进入不可取消提交的操作返回准确结果。初期若限制一个活动实例，必须显式报告，不依靠隐含全局对象互相覆盖。

## C12 证据与公开接口

类型检查证明调用关系，运行时负例证明实际拒绝，headless 回放证明标准语义，浏览器证明设备/存储，原作对照证明声明范围内的兼容。证据不能互相替代。

对 M0–M2 限定能力的异常应真实拒绝；后续 T01–T28 义务不能通过永久 skip 消失。M2 就检查打包消费者；M3/M4 再完成第三方扩展/迁移/适配任务。任一完成声明都关联实际实现、命令、环境与结果。

W1-01对C02/C03/C05/C11的调度落实见ADR0032：Web预算续跑进入浏览器任务队列，不能以连续微任务冒充渲染让出；逻辑轮次、规范输入顺序与保存切点保持不变。执行中的rAF不排入多余tick，下一次受理结算活动时间；启动每片重验请求代次及dispose，取消未提交候选不改变持久head。调度器/端口归实例所有。函数/指令索引只来自链接后的私有Program，不绕过恢复或输入验证。

W1-02/ADR0033补充C05/C07/C10：资源准备未提交时保持旧呈现投影，Player捕获/保存和进度flush拒绝RESOURCE_PREPARING；不能将新Core目标与旧像素合成存档。失败保留未分发效果，重试不得重复逻辑。候选资源准备遵守请求代次且先于持久head提交；当前/候选/预览引用不得被LRU淘汰。LoadingOptions来自Schema，原release目录预算/媒体完整性等级保持。

W1-03A/ADR0034补充C06/C07/C11：冷热分片不拆开目录/快照/摘要/回执原子性；必要冷记录缺失、大小不符或非法即失败，无关热操作不读取全部载荷。迁移中途失败保留旧布局。retired ID不可作为新激活或旧pending复活，当前head须匹配未退役的live entry；回执不删除、不失去幂等性。写入输入在排入IndexedDB异步事务前私有化。容量仍按原完整逻辑JSON精确合计，次级摘要索引不算第二份逻辑存档。

W1-03B：代码I/O不进入Core。未加载call不修改PC/参数，准备失败不安装半份代码；租约身份/长度/SHA/ABI/锚点/链接均检查，取消/迟到不得推进剧情。快照绑定完整清单及该Core用过的模块，不以共享缓存集合替代执行闭包；恢复和旧绑定不符明确拒绝。基础模块集外的能力显式unsupported，不据此宣称全集模块化或i18n已完成。

ADR0042：带textCatalogBinding的Program模板不能直接执行；bind必须验证game/release/locale、完整目录摘要、槽位和TextId/Revision，再还原普通Program。偏好locale不属于剧情快照，读旧档不得回滚偏好；旧偏好缺locale时使用本Player作者默认。未声明翻译不按行配对或猜测已读继承；有限split支持集外明确unsupported。

ADR0046：字符单位等待在遇到控制时采样有效interval，活动剩余时长与采样值进入Snapshot；偏好变化只影响之后的等待。瞬显跳过新字符等待，显完可跳过当前等待；confirm仍是独立输入屏障。固定等待与旧合法数据语义不变，未知新变体在旧实现明确拒绝。

G1-04/ADR0048的滚轮属于Web输入：InputPreferences的可选wheel字段保持v2兼容，不进入剧情Snapshot；手势绑定既有prompt/epoch，只调用现有step/history系统入口，菜单/激活/编辑/原生滚动不能穿透。缺省值与schema、protobuf新字段7和真实设置工厂一致。
