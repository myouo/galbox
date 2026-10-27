# 舞台、相机与并行效果（G3-01）

SDK使用同一TypeScript Core和单Pixi舞台（WebGL2优先、Canvas基础兼容）。Core解析表达式并保存逻辑效果，Host重建图像对象，不让React推进动画、PC或制造媒体完成。图像效果不包含DOM正文/UI。

```ts
import {stageImage,stageTween,stageFilter,stageCamera,stageTransition,stageShake,stageFade,expr as E} from 'galbox-sdk/port-kit';
const letter=builder.asset('image',letterAsset);
const next=builder.asset('image',nextBackground);
stageImage('letter:put','letter',letter,{x:300,y:360,anchorX:.5,anchorY:.5}, {z:2});
stageTween('letter:move','move','letter',{x:E.variable(distance),rotation:15},
  {duration:E.integer(1200),relative:true,easing:'ease-in-out',policy:'replace'});
stageFilter('mist','mist',{kind:'camera'},{blur:2,grayscale:.5},{duration:1000});
stageCamera('zoom','zoom',{zoom:1.1},{duration:1000});
stageTransition('background:cross','cross','background',next,{duration:1200});
stageShake('wind','wind',{kind:'camera'},6,3,120,{duration:800});
stageFade('night','night','#102030',.25,{duration:1000});
// 用普通task.join等待选定成员；不join则与正文/其它任务并行。
```

G3-05新增 `stageRuleTransition(at, task, objectId, targetImage, grayscaleRule, {duration, vague:64})`，从单张静态图向目标图按灰度门槛转场。三张图必须尺寸一致，rule为不透明灰度图，vague=1..256，duration/easing沿用舞台时钟。from/to/rule、来源签名与进度进入Protobuf快照；取消冻结当前合成，finish精确到目标。活动效果可先finish；已cancelled的冻结画面或分层画面需stageImage建立新基底，不能递归叠加规则转场或replace活动asset写者。规则图与from即使在冻结后也属于恢复资源闭包。

两后端复用同一有界像素合成器，静态相位不重复计算。`graphics.maxRuleBytes`默认64MiB，估算为每像素21字节和每表面512字节查表；Canvas还要求与其back buffer/滤镜预算合计不超`maxCanvasBytes`。这是逻辑工作区估算，不是实测RAM/VRAM。尺寸/规则格式/读回/预算失败在候选接管前拒绝；不支持任意shader、原生children聚合或所有KRKR alpha类型。见[ADR0039](decisions/0039-rule-image-transitions.md)。

新工厂接收有限number或TypedExpression<i32/f64>，duration为number或i32表达式。未知字段、资源种类、非有限结果、越界、层级环和冲突明确拒绝。Builder自动声明stage.effects/expressions/values.extended；raw Program仍经Schema和完整链接。参数只在启动求值一次，快照保存解析后的from/to/fields/duration/easing和源签名，变量后来变化或load不重算。

Pose包含x/y/alpha、scaleX/Y、rotation、skewX/Y、pivotX/Y、anchorX/Y；位置/pivot为逻辑像素，rotation/skew是度。scale -100..100（负数镜像），rotation ±360000，skew ±85，anchor 0..1，alpha0..1，其余位置范围±1000000。相对模式只加提供的字段，不暗做最短角路径。easing为linear/ease-in/ease-out/ease-in-out的固定多项式。

stageStyle可设parent（null解除）、z、visible、clip矩形（null解除）、blend。父节点需已存在，最多8层，不能成环；父对象删除同时删除后代并取消其活动任务。坐标为局部，不自动保持世界位置。clip是对象局部矩形，作用于该对象和后代；blend=normal/add/multiply/screen作用于图像。对象/图像舞台滤镜仅blur0..32、brightness0..4、grayscale0..1；不是任意CSS/GLSL或全部滤镜库。

相机以(640,360)为屏幕中心，x/y为观察点、zoom=.01..100、rotation为度，正旋转在Host作相反画面变换。fade是相机外的逻辑画幅颜色遮罩，alpha0..1。shake不改权威pose，用Core活动时间的确定性三角波叠加偏移，amplitude0..1024、period16..10000ms；easing控制衰减包络，结束/取消清偏移。

crossfade保存最多4个不同图像的权重，不截GPU位图。替换从当前混合继续，超出4资产先拒绝；完成收敛为目标单图，取消冻结当前混合。权重按premultiplied RGBA累加到透明图像组，再合成，半透明来源同样有效。中间render texture受viewport裁切和有界blur padding约束，不作为已测VRAM报告。

任务按scope/属性锁定。x与rotation可并行，pose和filter/shake/crossfade可并行，相机与对象独立；同属性重叠时reject或将旧任务标superseded，再从当前值开始。替换整个旧逻辑任务，未覆盖的旧字段冻结。task.cancel冻结并标cancelled，task.finish显式到终点并completed；它们只用于舞台/旧动画，不伪造音频结束。组为all-success，旧成员取消/替换不能冒充完成。旧stage.animate与新pose共用x/y/alpha锁。

Snapshot.scene保存相机/舞台滤镜/遮罩，object保存变换/裁切/图层/滤镜，Task.stageTask保留解析参数/源签名。恢复校验图层资产/权重、父图、任务phase/字段/源/静态参数、活跃写锁及当前属性与elapsed的一致性；缺scene/改源/坏进度明确拒绝而保留旧档。新stage.effects Program读取缺scene旧档需完整内容迁移；旧无scene Program保持旧路径。Core时钟而不是Host回调完成舞台任务，暂停/后台停止推进，预算1/8/100不改变结果或产生保存点。

限制：128对象、256保留任务、4转场图层、8层父图；不是长作品规模认证。非矩形mask、空容器节点、任意shader、路径/骨骼、其它转场/滤镜未导出，不以扩展点计已实现。全平台、视觉延迟/60FPS、实际VRAM未认证。只有图像舞台参与这些效果。

原创《灯塔来信·光影回信》在http://127.0.0.1:4173/?demo=stage ，输入fixtures/stage-novel/build.ts。运行时把distance从140改成9999，已启动相对移动仍到410；真实保存/刷新/两路线和WebGL像素验证使用同一生产路径。它不代表真实两作兼容。

H2-01设备兼容扩展见 GRAPHICS.md：Canvas复用上述逻辑状态与基础场景图，既有blur/brightness/grayscale与隔离crossfade按ADR0022的Canvas离屏栈与预算实现；模糊有光学近似容差，不能扩大成任意shader/全平台逐像素保证。
