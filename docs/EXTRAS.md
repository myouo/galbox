# 鉴赏、成就与隔离回放

G5-02有限支持集，设计见ADR0028。Program声明版本化目录和解锁条件，SDK提供资源校验、持久解锁、预览会话与默认界面。

```ts
const cg = cgExtra('postcard', [shoreImage, towerImage], {title:'两面的风景'});
const music = musicExtra('theme', themeAudio, {title:'海风', gain:.3, loop:true});
const scene = sceneExtra('memory', 'memoryFunction', {title:'回声中的场景'});
const badge = achievement('collector', {title:'第一封收藏', icon:letterImage,
  unlock:expr.profile('bool','collected',bool(false))});
builder.extras(extrasCatalog('collection','v1',[cg,music,scene,badge]));
// 正常剧情使用unlockExtra(at,ref)，场景函数首条为sceneMarker(at,scene)。
await player.openCG('postcard', cgMount);
await player.selectCGVariant(1);
await player.closeExtra();
await player.playMusic('theme');
await player.closeExtra();
const replay = await player.openSceneReplay('memory', sceneMount);
// 用ReplayUI或回放Player的input/step/chooseInteraction/skipVideo控制该场景。
await player.closeExtra();
```

工厂位于port-kit，目录和进度parser/type位于protocol，Player API位于player，ExtrasPanel/ReplayUI位于react。CG工厂只接受image引用，music只接受audio，sceneMarker只接受真实scene引用；伪造引用/错误资源kind/错误入口在运行时同样拒绝。目录1–128条、CG1–16差分，目录JSON字符至多131072；条件沿既有512节点/16层纯表达式范围，禁止运行globals/locals slot读取。其它Program/资源/存储预算同时适用。

scene.entry必须是零参数void函数，入口第一条extras.scene绑定该条目。正常主线可以调用同一函数并解锁它；鉴赏以专用replayScene根运行，根return结束回放、嵌套return正常。它无需主线流程图，也不会把流程图导航当隔离回放。

Profile.extras保存与目录/资源/场景源绑定的单调unlocked集合。extras.unlock显式永久解锁，extras.check检查所有条件；新运行初始化、profile写入、确认正文也自动检查。满足条件即锁存，后来flag复位或读旧档不撤回。检查先在候选profile完成，出错不改变原profile、读入等待、声音停止效果或不可变批次。CG/音乐/场景/成就共用真实进度事务与回执；同profile的所有槽位共享解锁，独立导入/备份profile分支保持隔离。启动前可按持久profile显示满足条件的资格，打开时仍重验；不把单次预览当获得新成就。

Snapshot.extrasSignature和Profile.extras都绑定目录及对应资源；场景目录还绑定函数/globals/RNG/流程图和完整资源集。定义变化无完整迁移则拒绝并保旧数据。extrasFingerprint(targetProgram)用于显式迁移身份；调用方仍须迁移所有profile、当前/上一/历史快照，摘要更新不能替代语义迁移。

一个主Player同时一个鉴赏会话。ready或合法可保存切点可打开；主Coordinator暂停自己的extras原因、freeze并flush，再读取当前durable profile核验head、修订和解锁。主线输入受暂停保护，保存/加载/重入/导入等系统动作拒绝EXTRAS_ACTIVE；先关闭鉴赏。已进入不可取消提交的旧保存仍返回真实结果，尚未捕获的排队图文保存不能thaw鉴赏持有的freeze。自动保存遇此暂停可在关闭后重试。

CG每次重新acquire、私有化并SHA256验证，独立DOM图像/Blob URL有取消和尺寸校验；切差分不移动主线纹理。成就图标由已验证缓存图像生成有界96×96缩略图，缺少绘制能力时显示不可用，不改变成就状态。音乐使用独立音频Context，既有buffer/element/版本化HTTP流路径，gain乘当前master/BGM偏好，支持整轨loop和自然结束；没有任意seek承诺。流的URL版本等级不会因试听自动升级为完整摘要等级。

场景复用正式Player/Core/WebHost与生产MemoryStore（testing.MemoryStore也复用此实现），以当前durable profile内容副本为初值、临时修订从0开始。所有已读、变量、访问、解锁都只写该内存Store。每个Host一套Pixi舞台；主线和预览是两个独立实例，当前主线暂停。场景实例context=gallery，默认ReplayUI只提供正文/选择/互动/媒体，不提供保存/导入/章节导航/嵌套鉴赏。普通主Player的load/rollback/import和备份恢复拒绝临时replayScene快照。主线Context、PC、RNG、等待、head不重建；正常暂停期间已排队的主线回执仍由原协调器在恢复后裁决。

关闭、打开失败、取消、dispose清理各自图像/源/子Player；迟到资源归还且不能显示到新会话。关闭需核验主线仍拥有head且profile修订未变；已被替代或外部修改后停止旧Core/旧设备，明确重新开始或读档。无法读取head时保持主线冻结，EXTRAS_HEAD_UNKNOWN允许用户重试关闭，不假报已经恢复。菜单/extras自身暂停允许预览，用户/隐藏/失焦/设备暂停继续作用于预览。暂停原因只解除自己持有的一项。

当前偏好会作用于音乐/场景，但不会从旧快照回写。回放使用父Player私有的已校验Program、release、预算和设备策略，外部修改最初options对象不会改变回放内容。资源provider、操作注册表、custom renderer等受信任适配器仍须遵守其契约；同realm JS不是任意插件的安全沙箱。

默认菜单的“鉴赏与成就”提供分类、锁定遮蔽、CG差分/缩放、音乐重试、场景交互与关闭。原创建模章节 `/?demo=extras`，可加`&renderer=canvas`。场景运行时有主/子两个Canvas，关闭回到主Canvas；不能把这称为单实例双后端或另一套演示解释器。

支持边界：有界目录/媒体/内存/存储、每Host设备预算；父子总峰值内存/低配/移动设备/大作品和跨平台兼容另验，未认证无限图库。其它G6/G7和真实N/F/M6未完成，实际任务状态/命令结果见tasks.json/evidence。
