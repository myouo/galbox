# W1-03A 存储冷热分离与旧激活瘦身

2026-10-27，基线92d3e18，perf/segmented-storage。A的有限支持集已实现并验收；W1-03总体仍进行中。程序模块/执行依赖加载属于B，热记录细分、留存与容量属于C，不以本报告声称整个W1-03完成。

## 实现与约束

槽位与每个profile的history journal从命名空间热行拆出；槽位列表读取独立摘要，不为展示缩略图读取整个剧情快照。相关payload/summary/header/回执同事务写入，失败没有半份结果。当前profile、偏好、head、各类回执仍为热数据，原4M逻辑JSON字符总预算/1M便携备份预算保留。逻辑计量精确包含转义键和分隔符，索引是额外物理开销，不能说物理占用等于逻辑JSON长度。

数据库版本2阻止旧SDK(version1)继续双写；旧行只读可用，首次写事务完成迁移。迁移abort保留旧行，版本号不会降级。未知布局/缺失载荷/长度不符明确失败，不删旧档；无关设置可继续写入。写入参数在入队前私有化。

被取代的activation只留下superseded/retired身份标记，当前head和live entry仍完整且身份/sequence/owner匹配。旧ID不可复活；所有提交回执仍保留，旧档不能回写旧profile。原快照/备份格式与唯一TS Core保持。

## 相同工作负载对照

profile-storage使用生产Core实际产生60条历史的35,978字符快照，实际IndexedDB保存0/16/48个槽位，每种配置对偏好与普通进度各2次热身+10次记录。get/put探针统计传入/读出的JSON字符量，探针会增加序列化开销；这里不是无探针的玩家API延迟，也不是物理磁盘字节量。

before为修改生产代码之前的92d3e18编译SDK/harness；after为本轮实现。相同driver SHA、Chromium版本、snapshot SHA、槽位数和最终profile/head状态已断言一致。比较脚本同时要求热操作不读取冷复合键及48槽位显著降低写入量，未提高容量上限或丢掉槽位内容。

| 槽位 | 操作 | 前P95 | 后P95 | 前最大写入字符 | 后最大写入字符 |
| ---: | --- | ---: | ---: | ---: | ---: |
| 0 | preferences | 2.6 ms | 3.4 ms | 72798 | 72867 |
| 0 | progress | 2.6 ms | 2.7 ms | 75507 | 75576 |
| 16 | preferences | 16.6 ms | 2.4 ms | 650041 | 73640 |
| 16 | progress | 22.5 ms | 2.6 ms | 652750 | 76349 |
| 48 | preferences | 44.7 ms | 2.0 ms | 1804569 | 75208 |
| 48 | progress | 45.6 ms | 2.7 ms | 1807278 | 77917 |

热行仍含当前head快照、所有profile与回执，目录也随记录数增长；因此不宣称任意规模的恒定成本。旧激活的完整快照已移除，但身份标记数量仍增长，进一步留存规则留C。

## 实际验证

- install/check：frozen lock、最后严格类型/生成一致性/headless/设备边界通过。
- unit-third：34文件227项通过；新增精确容量、转义键、摘要隔离、旧激活瘦身/拒复活、当前head一致性。
- browser.log/results：完整146项，0 skipped/flaky/unexpected；新增真实冷热隔离、目标写入原子abort、调用方变更不污染待提交数据、版本升级/旧SDK拒绝、迁移abort/重试、损坏冷记录保留/热设置继续及全量备份拒绝。
- 两处原来直接读取root.slots的浏览器图文断言改为用生产Store读取持久槽位，保留原截图、字段、帧深度和刷新断言；没有删skip或放宽严格度。
- consumer-final：仓库外tarball、strict声明/native ESM与真实浏览器通过，额外断言真实DB版本2、目录/冷快照和退役ID拒绝接管；未借workspace私有路径，清理exit0。
- cli：65真实命令、模板/扩展/迁移/导入、流式HTTP与实际保存/刷新恢复通过。
- compatibility：4 synthetic通过，N/F仍needs-input，不声称真实原作兼容。
- release：基线92d3e18，13入口/0删除，新增6个存储格式类型与parser；Snapshot/备份协议版本不变。两个包pack/publish dry-run通过，actualPublish=false。
- 标准performance：3活动周期/228输入，API P95 15.2ms，dispose最大61.0ms，原4ms Core/50ms API/500ms释放门槛通过；不借探针结果宣称所有性能指标均改善。
- dev：实际pnpm dev，原生--disable-webgl，390×844触控模拟；从冷行重建只读检查视图（不伪造存储），断言DB/layout均为2；图文表单、刷新/两皮肤、demand→balanced、当前profile和设置恢复，单Canvas、0 pageerror。

galbox-sdk 0.1.0 SHA256=`5540abe5d2139d3d440f34450e493813a2949b503e1a045bb7e80e0193d08869`。

@galbox/cli 0.1.0 SHA256=`1cddf7c26ee098dc7e954da685b740c473d787768bbf45c009787262715fc5da`。

consumer/CLI/release/artifacts实际字节一致。测量revision为执行时HEAD基线，源码由source-manifest与最后本地提交绑定。最初Schema的minLength/maxLength触发Ajv CommonJS helper，生成检查真实失败；改用等价有界Unicode正则并保留UTF-16 key检查，未删除ESM/strict检查，失败日志保留。

运行：export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev；http://127.0.0.1:4173/?demo=interface&loading=balanced。构建pnpm build；完整browser前先停dev释放4173/4174，consumer/CLI/perf顺序执行。

下一W1-03B：定义版本模块清单、函数接口/稳定地址/摘要和真实按执行依赖加载、取消及恢复闭包。C继续热行/回执/留存/容量。W1-04持久缓存/离线/平台及G7/N/F/M6仍未完成。无外部推送发布部署。
