# 给 Codex 的首次开发提示词

你现在负责在当前工作区实际建设 **galbox-sdk**。最终产品是面向视觉小说移植开发者的强类型 Web 引擎与 SDK；本轮请连续完成 **M0、M1、M2**，形成正式生产模块驱动的可玩初始引擎。

## 1. 先确认仓库事实，再开始实现

读取适用的 AGENTS.md，检查 Git 状态、目录、现有代码、依赖和用户未提交修改。然后读取本任务包的：

- docs/PRODUCT.md
- docs/ARCHITECTURE.md
- docs/CONTRACTS.md
- docs/MILESTONES.md 中 M0–M2
- docs/ACCEPTANCE.md 与 docs/FIXTURE_NOVEL.md
- docs/STATUS.md、docs/tasks.json

相关详细依据在 docs/reference/GalBox-SDK-v0.6-Implementation-Design.md。

若任务包放在现有仓库的子目录，先识别实际项目根目录，合并规则和文档入口，不要盲目复制覆盖已有 AGENTS.md、README、配置或源码。若项目尚为空，初始化真正需要的 workspace 和工具链。当前任务包只是开发资料，创建它不等于 M0 已完成。

做一份简短的实施顺序后立即编写、运行和修复代码。本轮要求可运行行为，不能只返回计划、目录树、declare 接口、Mock UI 或一批 TODO。

## 2. 产品目标与固定选择

galbox-sdk 接收标准 Program、AssetProvider、作品配置；需要原版存档互通时增加明确版本的 CompatibilityBinding。它提供执行、图像、正文、音频、输入、资源、历史、内部保存恢复、原档适配和开发工具。

采用唯一 TypeScript Headless Core、TypeScript Web Host；图像首选单 PixiJS/WebGL 后端，正文 DOM，默认 UI React，持久化 IndexedDB，工程 pnpm/Vite，测试 Vitest/Playwright。WASM 不是前提，本轮不引入 Rust/WASM，也不再次展开语言选型。

初期建立一个 galbox-sdk 主库，以 protocol/core/port-kit/player/react/testing 子路径提供实际已实现的能力。Coordinator/runtime、web-host、storage 先作为内部模块。CLI 到 M4 有真实功能时再建，避免空包扩张。具体依赖版本先核对当前实际 API/相容性，随后固定版本和 lockfile；v0.6 中的验证编译器版本不是强制生产版本。

Core 不导入 DOM、React、Pixi、IndexedDB、Node I/O 或具体作品。Coordinator 通过平台中立端口管理消息、时间、预算续跑、进度提交和候选激活。Host 负责设备效果，React 只调用 Player API。不得把剧情写成 React 回调、不可序列化 Promise 链或另一套临时解释器。

未知保护、通用原包识别、通用旧引擎 VM、任意原生插件、创作 IDE、第二图像后端、云账号和插件市场不属于本轮范围。两作的已知格式/行为转换属于作品适配，不进入 Core 的 gameId 特判。

## 3. 本轮必须形成的行为

按 docs/tasks.json 中 M0–M2 的任务推进，使用原创《灯塔来信》fixture：

1. 从同一有限 Schema 生成 wire 类型与运行时 validator，构建、链接合法 Program；真实 Builder/工厂拒绝错误指令参数、资源种类、变量值、地址与未知能力。
2. 实现同步 Core 和串行 coordinator：稳定地址、branch、带参数和返回值的嵌套 call/return、显式帧、有限值语义、预算续跑和规范事件 trace。
3. 实现任务与快照：并行移动/淡化、固定任务组、明确终态、部分组完成后的恢复、保存权限、完整等待状态与过期事件拒绝。
4. 实现实际 Web Player：单 Pixi 舞台、DOM 正文揭示、显完与推进分离、选择、历史、暂停/快进、真实短音频、资源 provider 和默认菜单。
5. 实现 IndexedDB 槽位和普通 profile 持久化：保存/读档/刷新继续、无手动保存的已读与解锁、修订冲突、不可变提交批次与回执、不同作品命名空间隔离。
6. 实现准备与激活分离，旧 load 结果不能覆盖新请求；最终提交前交接 dirty profile，持久提交后旧 Core 失权，过期激活不能重新接管。
7. 默认播放器能走完两条原创路线；例子通过真实发布数据和公开 SDK API 接入，能构建成静态目录。
8. 安装打包后的库到一个独立 consumer 项目，只靠公共 exports 完成播放和一次保存恢复。不能借 workspace paths 或私有源码伪装可嵌入 SDK。

M0–M2 支持集以 MILESTONES 为准。可以先限制为基础 ADV、bool/string/i32、线性位置/alpha 动画、短 WAV 及明确重播/停止的音频恢复。未提交资源屏障中的保存可以明确拒绝；不需要首轮支持任意时刻、任意媒体的精确恢复。

M3 的 SaveBridge 合成格式、完整逻辑扩展和迁移不计入本轮完成门槛；未实现时在能力表中明确说明，不导出假成功 API。架构仍须保留 v0.6 的恢复闭包和职责，后续沿同一代码继续。

## 4. 必须遵守的正确性约束

- 外部输入先 unknown 校验，之后规范化和语义链接。公开 API 无 any，不用强制断言绕过校验。类型关联必须出现在真实工厂中，readonly 不替代运行时所有权。
- 同一规范事件 trace 在预算 1、8、100 下得到相同逻辑结果和效果意图；预算 yield 不产生新的保存点，不重复分发上一点击。
- Host 结果进入 coordinator 队列，不重入 Core。输入只消费一次，旧 prompt/epoch/attempt 的结果不能推进新状态。
- 保存所有活动任务和仍被引用的结果/任务组/等待；恢复不重做已完成成员，不等待旧宿主请求。
- 普通进度使用工作 profile 和显式持久批次。旧快照不能回写旧 profile；提交失败不能报告成功；已提交不能报告无副作用取消。
- 恢复激活使用当前持久 head/回执；提交前失败与提交后 Host 失败分开处理。
- 没实现的能力在链接/能力协商时明确失败，不静默跳过指令、素材或测试。

## 5. 实施、验证和记录

每完成一个有意义的任务，运行相关测试并修复。建立可真实使用的根命令：pnpm check、pnpm test、pnpm test:browser、pnpm test:consumer、pnpm build、pnpm dev；首次 install 生成 lockfile 后，再用 frozen-lockfile 验证。不要创建固定 exit 0 的检查脚本。

M1 用虚拟 Host/时钟控制语义交错；M2 要在实际浏览器中使用真实 IndexedDB 和至少一条实际媒体播放路径。不能只用 fake storage 或截图证明完整行为。检查打包 exports、声明文件和 consumer 安装结果。

发现设计草案未规定的细节时，在已确认边界内选择最小、可验证的规则，写简短 ADR 并同步实现/测试。无需为普通实现细节逐项问我。已有授权持续有效；遇到权限或工具限制遵循实际环境，不绕过，也不要凭空声称工具可用。

任务状态写入 docs/tasks.json；当前交接摘要写入 docs/STATUS.md；实际命令与结果放 docs/evidence/。代码已写但必要测试未跑，必须保留未验证状态。不能通过删断言、skip、放宽 strict 或固定成功对象把阶段标绿。

两部真实作品的发行版、资源和原档资料尚未齐全时，准确记录 N/F 轨道的缺失输入，继续标准 SDK 工作。原创 fixture、合成格式或自洽回放都不能用来声称《水仙》《海市蜃楼之馆》已经兼容。

持续推进到 M0–M2 的门槛完成；若环境或上下文限制确实中断，先写好可接续状态，明确当前事实，不降低门槛、不宣布最终项目完成。首轮门槛完成后交付这一检查点，后续使用 CODEX_CONTINUE.md 推进 M3 及之后。

## 6. 本轮最终交付格式

- 完成/未完成的任务 ID 与里程碑。
- 实际可玩的行为和公开入口。
- 从干净安装到本地运行、构建、测试的准确命令。
- 真实执行的验证结果，以及尚未验证的范围。
- 能力限制、阻塞所需的最小输入。
- 文档/状态/证据位置，以及下一轮第一项可执行任务。

现在开始仓库检查并落实 M0–M2，不要只复述以上要求。
