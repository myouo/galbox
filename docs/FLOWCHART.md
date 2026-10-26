# 流程图与声明章节入口

G5-01有限支持集，设计见ADR0027。实例给图、条件与入口函数；SDK负责校验、节点进度、默认图示和正式接管。流程图表示作者声明的导航关系，连线不替代VM控制流，也不自动证明所有分支覆盖。

```ts
import {ProgramBuilder,flowChapter,flowNode,flowchart,flowEdge,
  visitNode,instruction,expr} from 'galbox-sdk/port-kit';
const opening = flowNode('opening', {
  chapter: 'main', title: '序章', entry: 'main', unlock: expr.flag(true),
});
const builder = new ProgramBuilder({gameId:'story',release:'v1',entry:'main'});
builder.flowchart(flowchart('story-map','v1',
  [flowChapter('main','正文')], [opening]));
builder.function({id:'main',entry:'begin',layout:1,params:[],locals:[],returns:'void',
  code:[visitNode('begin',opening),instruction('text.page',{
    at:'page',textId:'page',revision:'v1',speaker:'澪',content:'从这里出发。',
  }),instruction('control.end',{at:'end'})]});
const program = builder.build();
// createPlayer({program, provider, mount, saveCompatibilitySeries:'1'}) 后：
await player.enterNode('opening', player.getSnapshot().epoch);
```

一个图有1–16章节、1–128节点、至多256有向边。节点坐标为column 0–15、row 0–63，位置不能重叠；图定义至多131072 JSON字符，并受Program/表达式原有总预算限制。循环边可声明；边端点与requires节点必须存在，重复身份/边/位置拒绝。公开FlowNodeRef由真实工厂创建，visitNode/unlockNode/flowEdge拒绝伪造引用；Builder同时验证线下JSON数据的同等关系。

entry为null的节点只记录路线。非空entry只接受一个零参数、void函数，函数入口第一条必须是该节点的flow.node。正常剧情可以control.call该函数；从图中重入时它成为新的完整根，默认globals、RNG、空舞台/任务/历史重新初始化，再由同一Core执行作者前导。不得沿用旧章节临时变量或直接修改PC。根control.return结束该章节，嵌套return照常返回；原Program.entry的结束语义保持。前导不达到有界合法语义切点、表达式失败或设备未准备都不能提交新接管。

flow.node到达时将该节点标为visited/unlocked并设置当前节点；flow.unlock只持久解锁。重复标记不增加无意义进度。数据在Profile.flow，独立于普通values键，沿同一ProgressBatch/修订/幂等回执与初始activation事务提交。普通批次只能保持或增加同版本visited/unlocked，不能用旧状态擦除新进度。Profile绑定图ID/revision/图定义摘要；Snapshot.flow绑定整个执行定义（图、函数、globals、资源及RNG）的摘要和合法根。改定义无完整迁移则拒绝，不猜旧节点语义。

节点可进入资格：已访问/显式unlocked，或者全部requires已访问且unlock布尔表达式成立；随后gate仍必须成立，且节点有入口。unlock/gate只读profile和ReadUnit，禁止运行globals/locals的slot表达式。条件解锁是当前profile的派生结果，不额外闩锁；需要永久解锁时用unlockNode。导航gate不会阻止作者正常剧情经过flow.node。reveal默认为unlocked，锁定时默认图遮蔽标题/描述；这是阅读体验，作品源码仍公开可读。

Player.getSnapshot().flowchart提供只读节点/边/章节、当前节点、visited/unlocked/canEnter/原因。投影缓存按会话、profile修订/dirty与当前节点失效，返回数据冻结；每次投影只验证一次进度定义。未开始时读取main持久进度；运行时显示当前working profile。refreshFlowchart刷新未开始视图并交接当前dirty；它不偷偷重写活动Core来接纳别的写者。实际enterNode在最终串行屏障交接旧profile/history、重新读durable profile并重新校验锁/gate；不能把过期按钮当授权。当前禁存、旧epoch、无入口拒绝；提交前失败保旧head/槽位，提交后失败留pending，resumeCommitted不重复初始化进度。

重入保留当前profile分支、已读、解锁和设置；不继承旧导入档的onLoad recipe，原有槽位策略保留。普通load/历史rollback恢复真实快照，不重做入口前导或导航gate；当前profile仍权威。新的章首激活、普通保存/刷新、历史切点和便携备份使用同一flow根/摘要验证。

跨版本备份迁移须处理所有profile.flow和当前/上一/历史快照。flowchartProgressFingerprint(target.flowchart)给出进度定义摘要，flowchartFingerprint(targetProgram)给出执行定义摘要；它们只计算身份，不替代完整迁移及Core校验。节点改名/入口变更必须同时映射进度、根、current和相关帧/等待；准备时验证所有profile与快照，原数据保留。只有profile、没有槽位的备份也必须验证图定义。

默认FlowchartPanel（从galbox-sdk/react导出）提供连线、章节筛选、当前/已访问/锁定状态与可见确认；图在自己的滚动区域内，菜单不会随图横向溢出。确认会说明章内状态重置和普通进度保留。图用DOM/SVG绘制，不要求WebGL；故事仍使用同一Pixi舞台。原创章节 `/?demo=flowchart`，可加 `&renderer=canvas`。

本轮不含任意PC跳转、自动布局、任意函数参数初始化、节点脚本编辑器或G5-02鉴赏系统。数量/字符/存储预算与既有媒体恢复边界仍适用，未认证无限图、完整大作品或所有浏览器。实际通过状态和证据由tasks.json/evidence给出。
