# 加载策略与资源生命周期

W1-02提供四种显式策略。SDK默认保留eager，已有项目不自动改变启动/失败时机；面向在线发布的作品可从balanced开始测量，移动流量用户可选择demand。策略在创建Player时指定，实例负责资源/章节声明，调度、校验、引用计数、释放和恢复由SDK负责。

| 策略 | 何时加载 | 适合的情况 | 代价 |
| --- | --- | --- | --- |
| `eager` 完整预载 | createPlayer准备整个有界目录 | 小作品、本地资源、希望开场后尽量少等待 | 首屏最慢、流量与驻留最大；必须容纳全部资源 |
| `demand` 节流按需 | 先准备基础资源，每次只准备当前切点依赖 | 流量敏感、低内存、分支多但只玩一条路线 | 遇到未下载的CG或声音可能等待 |
| `balanced` 均衡预取 | 当前依赖优先，背景预取有限直线后续资源 | 普通在线阅读，阅读时间可覆盖部分下载 | 可能下载最后未使用的少量资源；快进仍可能等待 |
| `chapter` 章节预载 | 根据活动调用栈对应的声明资源组，先准备当前章 | 作者掌握章节边界、希望章内连贯演出 | 章首等待更明显；作者必须控制组大小和预算 |

eager对于声明为versioned-url的流式媒体只准备元数据和租约，仍需网络播放，不保证整轨已经下载。

“离线整包安装”是第五种产品方案，但属于W1-04，当前没有把它作为有效mode导出。内存缓存会随关闭消失，普通HTTP缓存也不等于可恢复离线安装。浏览器缓存默认存在驱逐可能，不能承诺永久离线。[MDN存储说明](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

## 配置

```ts
import {createPlayer} from 'galbox-sdk/player';
import {loadingPolicy} from 'galbox-sdk/port-kit';

const player = await createPlayer({
  program, release, provider, mount, saveCompatibilitySeries: '1',
  loading: loadingPolicy({
    mode: 'balanced',
    concurrency: 3,
    maxResidentBytes: 96 * 1024 * 1024,
    lookahead: 2,
  }),
});
```

`concurrency`为1–8，eager默认1以保留旧项目请求时序，其余默认3；`lookahead`为0–8页，默认2，只对balanced生效；每次最多扫描512条已知控制流指令和16个资产，不执行变量、随机数、插件或选择，不跨越未知控制流猜测分支。当前文字、舞台（含转场两端）、活动/重放媒体意图、剧本UI图像都先准备，再提交表现。

chapter还需`chapters: [{id: 'prologue', functions: ['prologue', 'prologueHelper'], assets: ['room', 'hero', 'openingMusic']}]`。函数不得同时属于两组；资源/函数必须存在。按活动栈从内到外找到最近的声明组，未声明函数仍有按需安全路径。它不是Program网络分模块，也不自动推导所有章节资源。

字体、标题背景/logo及系统成就图标属于基础资源，启动时准备并常驻；这保证默认及自定义文本渲染器、标题和系统页不会引用未准备字体/小图。不要把大量大图声明成系统图标。创建时选择策略后暂不支持在运行中切换；可以关闭实例后以另一策略读取原存档，策略不进入剧情快照。

除eager外均要求已经验证的正式release manifest，才能在下载前知道资产身份和事实。manifest事实仍不是“已验证全部字节”；实际资源取用时继续摘要与内容检查，网络媒体保留原versioned-url等级。无manifest的旧项目仍可eager下载检查后生成派生release。

## 三种预算不能混为一谈

- release原目录/格式预算继续有效，包含原资产数、编码总量、尺寸/时长及RGBA/PCM规则；本轮没有只靠提高限制宣称支持大作。
- `maxResidentBytes`为新增的设备准备/驻留估算上限（默认256MiB，最大1GiB）。图像按CPU解码和纹理两份RGBA估算，PCM按实际解码数据，Blob媒体/字体按声明与准备占用计入；解码期间另预留该资源的编码输入。**这不是整个浏览器heap/GPU的硬上限**，不包含不可精确控制的解码器内部、UI数据URL、捕获图、Pixi中间缓冲与浏览器缓存；Canvas合成预算仍单列。
- 下载同时受并发数和`maxAssetBytes`限制；多个在途请求的最大下载缓冲可达并发数乘以单资源上限，拼接和校验复制还有短期倍数开销，不能只用压缩文件大小代替驻留估算。

当前画面、候选画面及预览中的资源会固定，LRU只淘汰无人使用的资源。旧图与新图须同时容纳，预算不足明确报`RESOURCE_RESIDENT_BUDGET`，不会销毁旧画面凑空间。预取请求可去重、取消和被必需请求提升优先级；预取失败不推动剧情或使故事失败，真正用到时重新尝试。

## 等待、失败与恢复

Coordinator运行到稳定切点后，先准备依赖，再分发声音/影片效果并提交新正文和画面。准备期间仍显示上一提交视图，`loading.phase`为`loading`，capture/save/flush拒绝`RESOURCE_PREPARING`；旧图不是此时可保存的新权威切点。网络时间不计为新页阅读延迟。默认UI显示准备提示；失败显示重试按钮，也可调用`player.retryResources()`。

失败保留该轮目标与未分发效果；重试不重复变量/RNG/历史更新。读档候选在持久head事务之前准备资源，旧请求取消或迟到不能接管。已提交之后的故障仍走原committed-pending恢复，不伪装回滚。资源等待本身暂不可保存，失败时须重试或关闭实例后读取已有存档；不能把缺图静默当成成功。

CG/音乐/历史语音/场景回放沿既有会话隔离处理。deferred CG借用已验证的本实例图像并固定租约，准备完成后取消信号不再解除可见图片引用，直到视图明确release；旧eager CG保留独立图像预览路径，其临时副本不纳入新驻留估算。场景回放使用同一Player及独立Store/缓存；不清空其他实例资源。下载校验与设备驻留分开，但同一图像的CPU图像/GPU纹理当前共同持有和淘汰；独立字节缓存与“先下载、按需解码”的持久方案留W1-04。缓存当前按Host隔离，跨实例共享、持久缓存、离线下载管理和运行时策略切换不在此有限支持集中。

`player.getSnapshot().loading`报告模式、等待/失败状态、活动/排队数、驻留估算及峰值、命中/未命中和淘汰数；命中不等于HTTP命中或节省了相同大小的实际流量。网络节流测试应统计实际请求字节与时间。

浏览器的`saveData`提示不是普遍可用的能力，不能依靠它替所有人选择策略。应用可在创建前结合用户选择做推荐，但应保留明确选择和不支持提示。[MDN saveData](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData)

试玩：`pnpm dev`后使用`?loading=eager|demand|balanced|chapter`，可与`demo=interface`或`renderer=canvas`组合。playground章节示例将其小型样例整体声明为一章；真实作品应按实际章节声明。验收与限制以tasks.json及evidence/w1-02为准。

## 连续阅读与音频（ADR0068）

普通翻页先取得当前资源，再滚动后续预取窗口；重叠下载继续，当前依赖提升为前台优先。静态地址索引按引擎拥有的函数表复用；新旧显示资源与编码暂存都计入预取可用预算。窗口不会为命中当前资源重复收费。仍不猜选择分支、不扩大驻留预算。

`createPlayer({resourceAudio:'continue'})`为默认：资源等待冻结剧情时钟、输入和提交，已播放音乐继续。作品需要同步冻结媒体时显式设为`pause`。暂停菜单另用`menuAudio: 'continue' | 'pause'`（默认pause）；用户/device/background暂停继续有效。自然结束事件仍入队，不用假事件跨过等待。`loading.phase`可用于延迟显示加载提示，快速缓存命中不必闪烁。
