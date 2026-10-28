# galbox-sdk 仓库工作规则

## 目标与读取顺序

本仓库最终交付面向 VN 移植开发者的强类型 Web 引擎与 SDK，产品名 galbox-sdk。接收已表达的 Program、可用资源和作品配置；原版存档经独立 codec/mapping/binding 接入。

开始任务先检查适用的上层/本目录规则、Git 状态和已有修改，再读：

1. `docs/STATUS.md` 与 `docs/tasks.json`：当前事实、依赖、上次失败和下一步。
2. `docs/PRODUCT.md`、`docs/ARCHITECTURE.md`：目标和模块边界。
3. 本轮相关的 `docs/CONTRACTS.md`、`docs/MILESTONES.md`、`docs/ACCEPTANCE.md`。
4. 必要时查 `docs/reference/GalBox-SDK-v0.6-Implementation-Design.md` 的相关章节，不每次重新复制整份设计。

本包遵守实际系统/开发者/用户指令层级，不扩大权限。项目文档中，v0.6 给出完整产品约束，MILESTONES 给出分阶段支持集；未在早期实现的能力仍保留在后续任务中。既有仓库先增量适配，不能覆盖用户未提交改动来获得“干净结果”。

## 固定架构

- 唯一 TypeScript 生产 Core，TypeScript Web Host；单 Pixi 图像舞台（WebGL2 优先、Canvas 兼容后备，遵守 ADR0021/0022 的设备与合成预算边界）、DOM 正文、React 默认 UI、IndexedDB、pnpm/Vite。WASM 当前不引入，仅按具体模块证据考虑。
- 初期一个主库 `packages/galbox-sdk`，通过显式 exports 提供入口；runtime/web-host/storage 等先做内部模块。CLI 在 M4 有实际功能时建立。
- protocol/core/runtime 不依赖 DOM、Node I/O、React、Pixi 或具体作品；使用独立 TS 检查和导入约束验证。runtime 接收平台中立端口；Blob/File/AbortSignal 留在 Web adapter。
- Core 管剧情与权威逻辑，coordinator 管串行消息和宿主编排，Host 管设备，Storage 管原子提交。React 不推进 PC，不作为存档权威。
- Core 不识别作品，不处理未知保护、通用归档/旧脚本 VM、任意原生插件。不按 gameId 特判标准语义。

## 类型与正确性

- wire Schema 为单一来源，生成 TS 类型/validator；外部输入 unknown → schema → 规范化/链接 → 受控状态。公开 API 不暴露 any。
- opcode/参数、变量/值、资源/kind、wait/resume、codec/source 身份必须关联；测试真实注册/Builder 工厂。类型品牌不替代运行时验证。
- DeepReadonly 保留品牌基元和元组；运行时隔离避免可变别名，不以 readonly 代替所有权。
- 单剧情控制流、多个并行表现任务。Host 回调入队，禁止重入；预算续跑不制造新语义保存点。
- Snapshot 含所有活动任务与可达结果/组/等待关系。逻辑身份保留，Host 请求身份新建；未支持的保存切点明确拒绝。
- 工作 profile 与持久 profile 分开；增量批次/回执幂等，旧快照不回写旧 profile。最终激活前处理旧会话 dirty 更新。
- 持久 activation head 决定接管资格；已被取代的 pending 不复活，提交后旧 Core 不继续写入。
- RestoreRecipe 有界，只修改候选；不猜真人选择或媒体完成。未启用能力显式 unsupported，不静默跳过。
- SaveBridge 合成格式仅标 fixture；两作无真实资料和原作对照时不得声称已兼容。

## 执行方式

- 首轮默认 M0–M2；续建按 tasks.json 选择依赖已满足的任务。先实施简短计划，再写正式代码、验证和修复，不停在架构作文。
- 同一生产路径承接样例与未来作品；禁止另做只为演示工作的解释器或 UI 硬编码剧情。
- 依赖、工具与内部实现细节可在当前授权范围内自行确定并锁定版本。已成立的技术选型不每轮重开；改变语义/公开协议时写简短 ADR 和测试。
- 可并行独立模块，但先约定接口和文件所有权；共享 protocol/schema/状态表由一人整合。
- 缺少真实作品资料时继续其他 SDK 任务；不为资料阻塞造假，不要求用户为每个可逆改动重复批准。
- 不因文档出现 release 自动执行外部发布；已有明确授权则沿用。权限/工具不足按实际环境流程处理，不绕过限制。

## 验证与接续

M0 建立 `pnpm check`（类型、生成一致性、导入边界及既定静态检查）、`pnpm test`；M2 建立真实的 `test:browser`、`test:consumer`、`build`、`dev`。缺少脚本就实现对应功能，不能放始终成功的占位脚本。

测试围绕语义与失败边界；虚拟 Host/内存存储可用于可控故障，但生产 Core/协调器应真实运行，浏览器 IndexedDB/媒体另验。不得删必要断言、永久 skip、放宽 strict、用双重断言或固定成功对象掩盖失败。

`docs/tasks.json` 是完整任务状态唯一来源。done 要求实现和规定验收都完成；代码已写但验证被环境阻塞时不能标 done。实际命令、结果和限制记入 `docs/evidence/`；`docs/STATUS.md` 仅写当前接续摘要。更改相关代码后，旧证据必须重验或标失效。

每次结束提供任务 ID、可观察行为、实际验证、未完成/阻塞项、运行方法与精确下一步。持续工作时给简短进展。上下文或执行限制导致中断时先保存可接续事实，不把会话结束写成项目完成。

## Git 与续建约束

- Git 分支名使用任务导向前缀；不得包含 `agent`。只做已授权的本地提交，不据此推送或发布。
- 每次语义扩展先记录有限支持集和 ADR，再让 Schema、生成物、真实工厂、Core 与失败反例一起落地。不得绕过公共工厂证明类型安全。
- 有状态操作注册表在创建 Core 前冻结；调用状态不按 opcode 全局共享。reducer/迁移输入输出必须隔离，失败不得改变剧情、profile、等待或已提交效果。
- 改变 args/phase/wait ABI 时，只有完整 invocation 迁移可以接纳旧档；单独 state 迁移不得冒充完整兼容。旧协议没有迁移时明确拒绝并保留旧档。

## 测试与生成产物边界（用户最新约束）

- SDK是引擎；原创/合成fixture与SDK验证应用放在tests/内。按用户最新要求，真实作品移植实例放在SDK仓库之外的独立工程，通过实际tarball和公开exports依赖SDK，不用workspace源码别名。正式包不得包含游戏、验证证据或日志。
- docs/evidence只跟踪短Markdown报告；原始日志/JSON/截图/trace等保留本地并ignore，CI上传artifact，不提交重复生成记录。
- 使用pnpm打包白名单与独立消费验收检查泄漏；运行目录按tests/player-app、tests/fixtures/game-data使用。

## 本轮远程与预览约束（用户追加）

本轮用户明确授权完成后推送SDK到myouo/galbox，独立实例到myouo/morgana。真实作品原包、解包目录、提取脚本/二进制素材、构建载荷、凭据和日志不得进入GitHub；检查发布引用可达的完整历史。SDK保留现有开发历史；独立morgana按用户要求折叠成一次全新根提交并移除原LICENSE；仅允许对已确认旧远端SHA使用明确force-with-lease，远端变化则拒绝。整理后的PO翻译源允许提交，原KS/TJS与解包数据不提交。

test.morgana.love仅作本地build的可玩预览，自动化网络回归转testsdk.morgana.love。下载限速只在自动化浏览器的CDP模拟中启用，预览/Worker/R2不加入生产带宽限制。原作载荷只在已授权的R2专桶，两个站点的前端发布目录/Worker分开。
