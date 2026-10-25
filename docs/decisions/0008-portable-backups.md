# 0008：便携备份与显式内容迁移

M5-01 的有限支持集：命名空间沿用 Player 的显式 ASCII 系列（1–80 字符），共用解析器。JSON 备份包含同一 gameId/saveCompatibilitySeries 下的全部持久 profile、槽位当前与上一修订、recipe/onLoad 和 provenance。最多 64 profile、128 槽位，总量至多 1000000 JSON 字符并沿用协议 4 MB/100000 节点上限；不含资源字节、原档附件、未保存的活动 Core、activation 权限或回执。导出先 flush，随后单次只读事务捕获。已存但当前 release 无法恢复的数据仍可导出。

恢复先在副本上校验闭包、生产 Core 与 recipe，再原子添加新的 profile/槽位，绝不替换 main、原槽位或 activation head。保留原始修订与 profileBasis；新身份由提交 ID 确定。相同提交精确重试返回回执，不再次运行钩子。失败不删除原数据；提交结果不明提示重试同一计划。恢复完成后显式 load 才激活。只有普通 profile 而没有槽位时，公开 `start(profileId)` 和默认菜单的持久进度列表明确从头开始，不假造旧剧情位置；无参数 start 仍使用 main。

跨 release 不猜地址、文本、ReadUnit 或章节起点。仅接受公共工厂登记的单步完整备份迁移：显式源 release 集合、目标 release、作品与系列；输入深冻结、输出 schema 校验，并保留全部 profile/槽位身份、修订与上一版本。开发者负责完整帧/变量/文本/等待/recipe/已读映射，生产 Core 再校验所有快照；扩展仍遵循完整 invocation 迁移规则。无映射、节点删除、文本不相容时明确拒绝，旧包与旧槽位保留。资源不随包携带，恢复只面向当前已加载 Program；旧 release 运行和跨系列迁移不在本支持集。

备份不转移 session authority；恢复回执只记录持久事实，不允许旧 pending 激活复活。迁移代码是受信任同步 TS，与现有扩展相同，不宣称沙箱。
