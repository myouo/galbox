# ADR0051：读档时自动迁移已知内容版本

2026-10-29。公开defineSavedGameMigration工厂登记至多32个精确source release→当前target release。旧Program可按需取得；先Schema/链接与旧Core验证原快照，再调用受信任完整迁移，结果重新通过目标Core。输入深冻结，输出重新私有化。不得仅改release蒙混恢复闭包，不识别作品或猜未知选择。

Player.load在旧会话freeze/dirty交接之后准备迁移，并沿原资源准备、head/revision CAS、激活/失权路径提交。失败/取消保留当前会话与原槽位；旧槽位与上一修订不改写，用户正常保存才写当前版本，因而无需靠覆盖原档达到自动读取。策略适用于快速、手动、自动及previous槽位。

迁移可显式声明已读别名：两端必须是对应Program声明的ReadUnit；只在当前持久profile确实已读源单位时追加新单位，与新head在同事务提交。不得导回旧profile值/解锁或玩家设置。原rollback journal仍保留其来源版本，未知旧检查点不可伪造为目标检查点。旧recipe/onLoad和模块程序迁移本阶段明确拒绝；不属于KRKR2原生存档codec。

实例负责旧32/93页与新章切点、文字揭示/历史、活动任务及来源身份的完整映射，使用正式Core重建候选并保留已发生选择；未知发行版继续明确拒绝且原档保留。
