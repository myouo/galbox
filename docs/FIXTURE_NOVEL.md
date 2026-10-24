# 原创验证作品：《灯塔来信》

用途：给正式 galbox-sdk 提供可公开的功能/恢复反例。M0–M2 实现位于 fixtures/standard-novel、apps/playground/public 与 tests/，M3 合成格式部分仍是后续规格。它不是《水仙》或《海市蜃楼之馆》的替代认证。

## 1. 内容与素材

固定逻辑画幅 1280×720，一个海边灯塔故事。14 个不同 TextId：opening.1–3、shore.1–4、tower.1–4、ending.shore、ending.tower、epilogue。单条路线阅读 9 页。Codex 编写简短原创中文台词，不复制商业作品文本。

制作两个背景（海岸/灯塔）、两层可移动对象（灯光/信封）和按钮装饰。用简单原创 SVG/PNG，实际通过 AssetProvider 加载；图像舞台用 Pixi，不能仅画一个占位矩形然后称图片管线通过。可选择固定可取得的基础字体，不声称原作排版保真。

用可复现脚本生成短 WAV：低音量 BGM、两条语音代用提示音及点击音。文件实际获取/解码/播放，菜单可调音量。音频素材只验证媒体管线，不声称人声语音或精确循环/续接。

## 2. 状态与可检查结果

| 状态 | 初值 | 规则 |
| --- | --- | --- |
| run.visits | i32 0 | prepareSignal(base) 调用 incrementChecked(base) 并返回 base+1，首次得到 1 |
| run.route | none | choice 后为 shore 或 tower |
| profile.shoreUnlocked | false | 确认海岸结局后设 true |
| profile.towerUnlocked | false | 确认灯塔结局后设 true |
| read units | 空集合 | 确认 advance 后记录该 TextId 的 ReadUnit；只显完文字不算已读 |
| profile.syntheticLoadCount | 0 | 仅 M3 合成加载 recipe 每个新的激活加 1；同激活重试不重复 |

键和集合可作为固定 profile/文本协议结构，不要求把通用动态对象语言加入 source values。

opening.3 前执行嵌套调用并把结果写入 visits；不能让 UI 修改它。然后启动两个任务：A alpha 变化持续 400 ms，B 位置变化持续 1200 ms；G 为封闭 all-success 组。G 成功后开放路线选择。两路线结尾分别更新对应解锁，不相互清除。

## 3. 必须保留的稳定位置

| 地址/位置（可统一具体名称） | 用途 |
| --- | --- |
| main:opening-start | 新游戏入口与安全点 |
| helper:prepare-signal、helper:increment | 参数/返回值/嵌套帧 |
| main:effects-join | A/B 部分完成时的可恢复等待 |
| main:route-choice | 两路线选择与旧 prompt 拒绝 |
| shore:ending、tower:ending | 解锁/profile 持久化 |
| main:epilogue | 结尾与 end flush |

以 A/B 共同启动时刻为 t=0，在相对虚拟时钟 t=600 ms 捕获 effects-join：A 已完成、B 剩余 600 ms。恢复后 A 不重新发完成语义；B 在新 Host 身份下继续，G 只成功一次，visits 仍为 1。

正文支持揭示/显完/advance，不由一次输入完成两个阶段；菜单关闭不推进正文。提供开发诊断视图检查地址、visits、route、任务、等待、保存资格和 pending profile，但诊断代码不能修改生产状态来实现故事。

## 4. 代表操作序列

1. 新游戏，显完第一句但不 advance，已读集合不增加。
2. advance 并到任务组，以 A/B 共同启动为零点，在相对 t=600 ms 保存；推进到选择后重新载入，验证部分任务恢复。
3. 选 shore，完成结局但不手动存档；等待声明的 progress flush 后刷新，shoreUnlocked 仍为 true。
4. 载入较早槽位，按既定 profile 策略保留解锁；旧槽位异步保存不能覆盖新进度。
5. 新游戏走 tower，得到第二个结局；两路线 run.route 各自正确。
6. 故障夹具让资源/媒体迟到、存储回包丢失、两个 load 交错；只允许声明的当前结果接管。

期望状态以 fixture 数据和明确动作序列记录。不要从运行结果自动生成“期望值”再比自己；人工定义关键变量、消费次数、任务结果与 profile 应有值。

## 5. M3 合成格式 fixture-save@1

这是原创的旧格式模拟协议，不以 NScripter/KAG 命名。输入包包括 slot.bin 和 global.json。

slot.bin 的确定格式：4 字节 ASCII `GBFX`，1 字节版本 `1`，4 字节 little-endian 无符号 payload 长度，随后 UTF-8 JSON payload，最后是 payload 的 32 字节 SHA-256。总长度必须等于 9+payloadLength+32；初始 payload 上限 64 KiB。摘要通过 codec context 的确定字节摘要端口计算，Core 不做设备 I/O。

payload 固定字段：format=`fixture-save@1`、edition=`lighthouse-synthetic-1`、locator=`legacy:route-choice`、visits=1、route=`none`。仅支持这一明确保存位置；其他 locator 返回 unsupported，不猜章节。

global.json 含对应 format/edition、shoreUnlocked、towerUnlocked、readUnits、syntheticLoadCount。缺少它时返回 needs-input，不把关键状态补成默认 false。解析文件结构/长度/版本/摘要，不执行内容中的代码。

mapping 绑定这份合成来源和目标 release/内容范围，把位置映射到 main:route-choice 前的合法恢复状态。recipe 重建已知舞台并在候选 profile 上增加 syntheticLoadCount，结束在待激活的选择状态；不替玩家选择。导入提交仅保存基线/recipe，prepare 模拟不把增量持久化。

导入建立 profile 的初始基线；每次 recipe 都基于当前导入 profile 中的 syntheticLoadCount 递增，后续 load 不把 global.json 的初值覆盖回来。正式 load 一次产生新的 activationId 并使计数加 1；同 ID 的失败重试保持这个结果。再明确 load 一次是新激活，再加 1。A 已提交但接管失败后 B 取代，重启不能让 A 接管或再加一次。

用另一份同形但不同 SourceKey/schema 的合成 mapping 验证登记拒绝；测试损坏摘要、错长度、错 edition、缺附件、过大输入、计划过期。全部报告标为 synthetic；这些通过不改变 N/F 的资料阻塞状态。
