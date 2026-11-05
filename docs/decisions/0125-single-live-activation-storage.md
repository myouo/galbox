# ADR0125：持久化当前激活只存一份完整切点

2026-11-06，W1-26。

长历史与大profile同时存在时，热根中的head及activations[head.id]重复完整
Snapshot会使原本可容纳的有效切点超过4M。不得提高预算或裁掉历史/进度。

IndexedDB布局v5在activations的当前head键保存精确的`{headReference:true}`，
完整Activation仅在head。读取先检查唯一引用位置与marker形状，再重建原有
逻辑DatabaseState；公开Store、激活CAS/所有权/状态/回执及Core Snapshot不变。
写入前要求逻辑live entry与head完全相等，不掩盖元数据或切点不一致。

v2/v3/v4保持可读；首次成功写入以原CAS事务升级v5，冷槽/摘要/回执页保留，
失败保留旧布局。热根4M字符、解码工作集4M、冷记录64MiB不变；v5容量按
真实无重复的磁盘JSON计量。无head、错误键/额外字段/多个引用及legacy中的
marker必须拒绝；旧retired ID不能因引用恢复为live。

本次不加入无限历史、档案回收、profile冷分片或更大PortableBackup。合成大
profile/真实Core切点的单元、真实IndexedDB升级/冷恢复/负例、原存储回归和
隔离实包消费后才完成。
