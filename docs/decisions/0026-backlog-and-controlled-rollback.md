# ADR0026：历史语音与有界受控回溯

状态：已实施并完成有限集验收（evidence/g4-02/REPORT.md），G4-02有限支持集。不改变opcode/调用/等待ABI，不从文本历史重建剧情。

1. Core的可选historySession与TextState.historyId关联真实确认事件。Coordinator安装会话时提供独立scope，已确认旧ID保留，当前/后续正文使用新scope+prompt。确认前只在Core.canSave的完整正文语义切点捕获真实Snapshot；确认成功才记录，预算yield、显完、旧输入、失败不产生切点。Auto走相同事件路径。禁存/不可恢复媒体等明确记录无切点原因。
2. Journal独立于Snapshot，无递归快照；Snapshot的历史ID精确关联journal，不能凭TextId/正文/行号猜快照。默认32条/500000 JSON字符，上限64/1000000，按窗口淘汰旧点；单点超限记录不可回溯，文本历史/语音仍可用。旧档无ID只支持文本/可验证语音。持久端口可选，缺少时明确memory-only。
3. Journal和幂等摘要回执同事务，绑定profile/活动authority；旧会话不能提交新批次。save/load/导出/接管的flushAll包含历史，失败不报持久成功。槽位含ID，journal在实际IndexedDB保存；便携备份携带完整有界journal并重新绑定恢复profile。跨release完整迁移必须同时处理历史语音/切点，未迁移拒绝，不能静默丢点。
4. rollback只接受当前历史可见ID及当前epoch，当前Core也必须许可保存。加载真实旧切点经原串行prepare/flush/activate/head路径；当前持久profile和偏好保持权威，不回写旧已读/解锁、不猜选择或媒体完成。本地回溯不重复onLoad recipe，但保留其未来读档策略。成功截断当前叙事历史；缺点/坏点/过期请求/提交前失败保留原会话，提交后失败沿pending恢复，不能让旧Core复活。
5. 历史语音是SDK Host拥有的独立设备预览，不分配Core任务或修改PC/已读/自动语音门。同一已验证buffer/element/版本化stream资源、捕获时script gain与当前master/voice偏好；专用AudioContext允许菜单暂停剧情时回放。非菜单暂停（隐藏/失焦/用户/设备）仍暂停预览。停止、换条、离开历史/关闭菜单、load/rollback/dispose取消自己的源和迟到结果；错误/blocked只报告预览，不冒充剧情媒体完成。
6. 默认UI提供逐条语音/停止、明确回溯确认、不可用原因。只支持既有voice recipe和既有编码/恢复边界，不引入精确seek/原生任意音频/无限历史或跨平台认证。

验收：生产Core/Coordinator的预算与确认边界、真实音频/菜单/偏好/暂停/迟到/双实例、RNG/帧/活动任务与已读/解锁保持、IndexedDB刷新/旧档/备份/迁移/坏点/提交失败、默认UI及strict独立tarball。保留旧门槛，不放宽断言。
