# 图文存档与槽位系统

G4-01 有限支持集，设计见 ADR0025。SDK 提供捕获、事务、策略和默认 UI，实例只选策略/命名/皮肤。当前状态和实际证据见 tasks.json，不代表流程图、回溯或全平台认证已经完成。

```ts
const player = await createPlayer({
  program, provider, mount, saveCompatibilitySeries: '1',
  saves: { manualSlots: 12, autoSlots: 3, auto: 'on-prompt' },
});
await player.start();
const saved = await player.saveGame({ label: '灯塔的第一封信' });
// 覆盖须使用列表中观察到的修订，避免覆盖另一个实例的较新修改。
await player.saveGame({ slot: saved.slot, expectedRevision: saved.revision });
await player.load(saved.slot, 'previous');
await player.quickSave();
await player.quickLoad();
```

`saveGame` 默认手动、图文必须成功；PNG 为 320×180、最多256 KiB，语义由同源 Schema 和真实 parser/工厂验证。`saveGame({image:'none'})` 明确选择没有图片的捕获。旧 `save(slot?, expectedRevision?)` 无图接口和旧槽仍可用，不自动把旧档升级成有图。自定义 Store 缺少 `commitSave/saveReceipt/listSlots` 时新系统明确 unsupported，旧接口不受此约束。

Player 与激活共用串行屏障，等合法边界后 freeze，同步捕获 Core Snapshot、正文 DOM 的计算样式/滚动/字体和重绘舞台的像素，再异步栅格化；完成后 thaw。Core 的权限、资源屏障、媒体/插件恢复限制继续生效。图片不含菜单/诊断，不靠后来截图给旧快照补图。存储延迟期间可继续剧情，合法旧捕获不回写旧 profile，也不因后来禁存而变非法。捕获失败/中途 dispose/abort 不提交；提交已完成后 dispose 不撤回成功。

默认正文捕获包括已揭示内容、Ruby、安全文字效果、ADV/NVL/多窗口、窗口主题与已准备字体。自定义 TextRenderer 要实现同步 `capture(snapshot,fontCSS):TextCapture`，可以把它转发给 `createDomTextRenderer(context).capture`。SVG drawing 在该调用中必须已独占复制/冻结；返回后不得读后来 DOM。缺端口默认拒绝；需要旧无图保存可显式选 none。任意网页、伪元素、外部图片/CSS 动画/滤镜不是正文截图契约。受限 iframe/CSP、SVG foreignObject 或设备绘制不支持时明确失败，不保存仅舞台的假完整图。当前实际验证浏览器范围见证据，不承诺所有浏览器。

流式影片截图是捕获瞬间的设备帧，replay/stop/forbid 仍决定恢复；图片不保证精确媒体采样点。玩家显示偏好只影响捕获当下图像，旧档不会回写偏好。无布局尺寸（例如 display:none 的 mount）拒绝图文捕获。

槽位公开只读视图含 kind、标题、修订、capture（唯一 id/实例捕获序号/逻辑时间/墙钟/正文摘要/可选 PNG）与 hasPrevious。capture 的正文、身份和逻辑时间必须与 Snapshot 相符。`refreshSaveLibrary` 刷新其他实例写入；`renameSave(slot,expectedRevision,label)` 与 `deleteSave(slot,expectedRevision)` 使用乐观修订。重命名增加修订而保留上一图片/快照；删除不删 profile、不改变 activation head。`load(slot,'previous')` 单独加载上一有效切点，当前槽保留，当前已读/解锁/偏好保留。

手动槽默认12，允许1–24；默认自动槽3，允许1–8；自动保存默认 off。on-prompt 在稳定、可保存的 text/choice 提示自动捕获，最多一项自动工作在途，捕获前提示已经变化则舍弃该自动请求，继续当前最新提示。循环槽选空位或最旧捕获时间；不在每次 tick/reveal 保存，也不在 load 后立刻覆盖。quick 和 auto 名称为系统保留，按 profile 前缀隔离。备份恢复的历史槽仍保留原种类，新快速槽使用恢复 profile 的固定身份。自动策略是实例配置，不随旧 Snapshot 回写。

`DefaultUI` 菜单提供图文管理、命名新建、覆盖/删除确认、重命名、上一修订和列表刷新；默认快捷保存/快捷键用图文系统。业务页面可以直接使用导出的 `SaveLibrary` 或替换外观。示例 `/?demo=layout&autoSave=1` 使用原创《灯塔来信·双页值班簿》，可加 `&renderer=canvas`。

保存的完整 payload 规范化后计算 SHA-256（固定 @noble/hashes 2.4.0），数据库事务同时写当前/上一快照、元数据/PNG 和固定大小回执。重试同 ID 只接受原 payload，避免每个回执再保留一份整图/快照。保存不会接管 head。丢回复先读回执，已提交返回 `committed:true,reconciled:true`；无法核验抛 `SaveOutcomeError`（outcome=unknown，含 commitId/slot），不假报无副作用。当前实例 `saveSystem.pending` 和 `retrySave(id)` 保留原 payload；刷新后凭已记录 ID 用 `inspectSave(id)` 核验历史提交。跨刷新不自动重发尚未确认的内存 payload。已知未提交失败和修订冲突保持原槽/上一修订与回执不变。

IndexedDB 和 MemoryStore 都在完整事务候选上修改并隔离输入/输出。命名空间最多4 MB JSON；便携备份原有1 MB限额保留，超限明确拒绝，不能截断图片、删旧档或报成功。缩略图 Schema/头部/尺寸/编码上限检查不等同对任意不可信 PNG 的完整解码认证；实际新图由浏览器编码，显示/合成还需浏览器解码。暂不含云存档、图片编辑或无限槽位/无限规模承诺。
