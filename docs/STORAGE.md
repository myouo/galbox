# 浏览器存储与规模边界

W1-03A（ADR0034）将每个槽位及每个profile的历史journal分离为冷记录。热记录保存profile、偏好、当前head、激活标记与各类回执；目录仅含冷记录身份/字符量，槽位列表读取独立摘要（包括实际缩略图），不会为列出槽位而解析全部剧情快照。

一次保存仍在同一个IndexedDB事务提交槽位、上一修订、摘要、目录与回执。一次设置或普通进度提交只处理热记录。这里降低的是读写放大，并未取消容量约束：完整逻辑命名空间仍为4,000,000个JSON字符，可携带备份仍为1,000,000个JSON字符。次级摘要索引会复制metadata，物理占用不等于逻辑计量；每份副本随同一槽位事务更新/删除。

## 升级与失败

数据库版本为2，对象仓库仍为namespaces。namespace字符串键保留热数据与storageLayout；slot/history/slot-summary使用[namespace,kind,id]复合键。该布局是内部实现，应用应使用Player/Store接口，不把热记录的空slots字段当成没有存档。

旧版连接收到versionchange后关闭；旧SDK再次open(version1)得到VersionError，防止新旧格式双写。版本2打开后，可以只读旧单行布局；第一次写入按namespace在同一事务迁移。发生验证失败/配额失败/abort时，旧行仍完整，冷记录不会留下半份。数据库版本号本身不会降回1，回退旧SDK前需按明确恢复方案处理，不能把“数据保留”说成浏览器版本可回滚。依据[IndexedDB标准](https://www.w3.org/TR/IndexedDB/)。

请求回调内同步校验/规约与排入后续请求，不在活动事务中等待网络、摘要或任意异步工作。成功只在oncomplete报告，失败等onabort结果。保存、进度、导入与激活的输入在异步数据库操作之前私有化，调用方随后修改对象不会改变提交内容。

所需冷记录缺失、大小不符或Schema/语义非法时明确拒绝，不删除损坏原文。无关偏好更新不读取损坏槽位；全量备份则必须读取/验证完整闭包。摘要列表不能替代读档校验。

## 激活与幂等性

新激活将上一head的完整快照替换成{id,sequence,status:superseded,retired:true}标记。当前head与当前激活仍保留完整信息。旧ID继续存在，因此迟到请求、旧pending、重复claim/confirm都不能重新接管。当前head必须匹配live entry；各类提交回执保持原有幂等语义，没有按时间删掉回执或通过重用ID压缩账本。

MemoryStore使用同一durable规约，也保留该退役行为。这个标记不是原版存档兼容认证，也不是清空已读或历史来提速。

## 尚未解决

当前head及profile/回执仍在热记录里，热记录本身变大后仍有复制/校验成本；旧激活标记数量也会增长，import/backup回执的签名仍可能较大。W1-03C负责记录粒度、明确留存与更大容量，而非简单提高上限。完整Program仍整体链接，真正的程序模块/按需执行/恢复闭包属于W1-03B。

性能复现：先基线、后候选分别运行`GALBOX_EVIDENCE_DIR=... pnpm profile:storage`，再`pnpm test:storage-performance`。探针统计实际get/put载荷的JSON字符量，探针自身有序列化开销，所测时间不能等同无探针的玩家API延迟。原始证据在evidence/w1-03a。

## 压缩冷记录（ADR0102，W1-03C 增量）

IndexedDB 内部 layout v3 将 slot/history 编码为有界 gzip ArrayBuffer，索引分别记录
解压字符数和实际存储字节数。ADR0103 将压缩冷记录的磁盘总量独立限制为64MiB；实际热根（含目录）、每个
解压记录和单次解码工作集仍不超过4M。旧v2迁移前仍按旧4M总量核对。v1 单行/v2 分段库只在成功写入时原子
迁移；压缩准备失败/冲突/配额中断保留原布局。相同长度的旧 v2 冷写入也会在
提交事务中逐项复验；v3 根单调 revision 防止相同尺寸覆盖绕过 CAS。

编解码不持有活跃 IDB 事务；有限乐观重试在最终 readwrite 事务核对根后一起
提交冷数据、摘要、删除和根。v3 热路径仍单事务，不读其他冷记录。损坏/CRC/
声明长度或解压超预算显式拒绝，不改变已有槽位。旧 SDK 不认识 v3 时必须拒绝
而非写回。平台需 CompressionStream/DecompressionStream 的 gzip 支持。

Snapshot/portable backup 的 wire 与上限不变；多槽库可能超过单个备份包或
4M 解码工作集，导出会明确拒绝，不为导出放宽预算。MemoryStore 仍是原逻辑
JSON 预算。此增量不等于完成热根拆分/回执留存；不会删除任何成功回执。
