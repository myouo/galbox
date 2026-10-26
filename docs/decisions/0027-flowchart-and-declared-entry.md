# ADR0027：流程图、节点进度与声明入口

状态：已实施并完成有限集验收（evidence/g5-01/REPORT.md），G5-01有限支持集。

1. 一个Program可声明一个版本化flowchart（1–16章节、1–128节点、0–256有向边，作者给有界行列坐标）。图只是作品声明的导航关系，不自动推断所有VM路径。Node的entry可为空，非空必须绑定零参数/void函数，函数入口第一条为该节点的flow.node。正常故事可call同一函数；重入以它作为完整新根执行，根return结束章节，嵌套return保持原调用规则。
2. 新flow.node记录当前节点、持久visited与unlocked，flow.unlock只显式解锁；两者沿正式ProgressBatch/回执原子提交，不占用普通values键。重复标记幂等。Profile.flow绑定graphId/revision/定义摘要，Snapshot.flow绑定完整Program执行定义摘要与声明根节点，定义或旧档不匹配没有迁移则拒绝并保留数据。
3. 解锁可来自持久visited/unlocked，或全部requires节点已访问且unlock布尔表达式成立。unlock与gate只读取profile/read，禁止局部/全局slot依赖，表达式规模有界；条件解锁是当前profile的派生状态，不伪称额外闩锁。gate每次重入仍要成立；需要永久闩锁时使用flow.unlock。剧情自然经过节点不受导航gate阻止，作者控制正常剧情分支。
4. Player.enterNode重新读取并校验最终durable profile，先交接旧Core/profile/history的dirty更新，再创建真实Core候选，从声明函数及默认globals/RNG/舞台执行作者的初始化前导。不复制旧章节运行变量、不任意赋PC、不推测选择或媒体完成。启动预算与合法语义切点、设备准备、head/回执/pending/旧会话失权沿现有路径；候选产生的profile变化与新head同事务。当前禁存区拒绝重入，候选失败保旧会话，提交后失败只恢复当前pending。
5. 新章节保留当前profile/已读/解锁/偏好；不继承旧导入档的onLoad recipe，旧槽策略保留。普通读档/回溯按快照恢复，不重新执行导航gate或入口前导。真正根函数/flow状态/源码绑定均由Core恢复验证。重入与旧读档语义区分；无UI直接改PC。
6. 默认React流程图有连接线、章节筛选、当前/已访问/解锁/锁定状态、标题遮蔽和明确重入确认。元数据是公开作品内容，标题遮蔽仅为阅读体验。显式只读projection有缓存/所有权隔离；未启动时读durable进度，运行中显示working进度，最终资格以事务前durable重验为准。

验收：真实工厂/Builder类型关联与坏图/入口/slot表达式反例；预算1/8/100、单调profile回执、旧快照不回写、根/嵌套帧与定义变更拒绝；真实IndexedDB/刷新/备份完整迁移、gate变化/准备失败/失回执/旧请求/当前禁存；WebGL/Canvas默认图UI与独立tarball/CLI回归。G5-02鉴赏、G6脚本UI、G7规模/性能及真实两作仍单列。
