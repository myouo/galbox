# G2-04 页内确认与KAG前端接续

2026-10-28，SDK基线5e9e17a，分支feat/inline-text-confirmation。有限语义按ADR0038；不包含完整KAG解释器、原版存档或整作表现认证。

## 实现

单一YAML生成confirm run（稳定union tag6）和可选waitingForClick（tag12），真实richText.confirm工厂、Core/串行编排、DOM、Auto/Skip和默认UI一起落实。输入阶段使用新prompt，逻辑historyId不变；进入/解除等待或显完段落不推进PC、不插入历史或整页已读。reveal停在下一confirm，明确显完会完成此前已经显示的fade，未来段落不被越过。

首尾/连续确认、等待前剩余时间不预付下一段、分段instant时间组、Unicode边界均有语义断言。新输入prompt溢出在输入/tick改变正文、时钟或profile前拒绝。无confirm的旧档保留原行为；新源签名不自动兼容旧内容，旧SDK不识别新run时拒绝。

默认UI区分页内继续和最终下一页；on-prompt自动存档按输入阶段触发，并用槽位环保持有界。Auto保留语音/效果与延迟门槛，Skip保持已读限制。保存闭包包含当前控制游标和确认状态。

## 实际验证

- check-accepted：类型/生成/纯Core/导入与仓库门禁通过。
- unit-accepted：38文件246项通过，新增8个测试包含真实工厂、预算1/8/100、历史/NVL/已读、重复/过期输入、段中/等待/解除后protobuf与MemoryStore恢复、损坏flag/cursor/null组/源签名拒绝、Auto/Skip与prompt耗尽原子拒绝。
- browser-verified：17聚焦浏览器通过，含WebGL/Canvas同页输入、真实图文保存/IndexedDB/刷新、单条历史/NVL、默认UI与自动槽位环，以及原文字/窗口/播放/偏好回归。最后修改此前已确认段的显完效果后，browser-accepted另7项最终复验通过（新的4项+文字3项）。未把旧全量151计为本轮重跑。
- 首次新增浏览器测试误把跨实例的数字epoch当全局唯一，改为同一实例再次激活后的真正过期epoch拒绝，并保留跨刷新恢复断言；未删除必要的输入隔离断言。
- package/release：实包226文件/497984压缩字节，无游戏/证据/日志/Schema JSON/maps；对5e9e17a公共API 14入口/0删除，pack/dry-run通过，无实际发布。SDK SHA256=d0b01e30c1ccc19a15357a0ced51958b6e9419a47b5ff41c1bdeaa007e93c071。

原始日志/机器结果均ignored artifacts/inline-confirm；报告只提交短MD。

## 独立真实源消费

/home/myo/Desktop/galbox-fata-morgana安装上述tarball，冻结锁、strict/skipLibCheck=false、3 Python+13 TS通过。每语言选取实际含[l]的受支持字面正文段落，用port-kit工厂和生产Core核对同页文本、页尾单次历史以及protobuf等待点恢复；源位置/摘要只在ignored artifacts/ast/inline-source-coverage.yaml。没有把未支持段落跳进游戏流程。

生产开场转换器也共用literal文本流下沉路径；原作22页本来没有[l]，没有插入假的控制。实际8语言176页转换和独立原作界面3浏览器通过，GUI无额外实验/诊断。可玩范围仍22页，OP/规则图/音轨/其余菜单及正常对话上下文待做。

前端依据第一方KAGParser修正反引号、裸true、参数模式、源顺序字典覆盖与标签:2/:3别名；宏模板可有未闭合if。701份KS全部保留为raw控制IR，得到3337个宏定义候选和依赖表；结构化子树只用于闭合片段，未把raw IR当执行语义。相关参考：[KAGParser](https://github.com/krkrz/KAGParser/blob/master/KAGParser.cpp)、[KAG标签](https://krkrz.github.io/krkr2doc/kag3doc/contents/Tags.html)。新知识已补到kag-krkr2-porting技能，校验通过。
