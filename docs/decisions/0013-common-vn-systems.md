# 0013：通用系统属于 SDK，偏好与剧情分离

按用户要求新增 G0–G7 通用 GalGame 支持目标，见 COMMON_VN.md。现有 TS Core/Host/Pixi/DOM/React/IndexedDB 架构保持；新系统先置于主 SDK 内部模块，真实可用后才增加公开入口。

第一条 G1-01 切片支持主/BGM/voice/sfx 音量 0..1、逐字间隔 0..200 ms（0 为立即显示）。全部输入由同一 wire Schema 生成 validator/types。作品可声明默认值；玩家持久值优先。设置与所有剧情 profile 分离，在稳定 gameId+series 下单独 CAS 修订，导入/旧存档/激活不得回写设置；本切片的故事备份不包含设置，不能暗示包含。

设置先完整验证并串行提交，事务完成后应用 Mixer 与当前 Core 的文字偏好。运行时文字偏好消息经 coordinator 排队，不跳 PC、不记已读；新 Core 在首次运行/恢复时采用当前偏好，Snapshot 揭示位置照旧保存。设置不进剧情 Snapshot，改变间隔重置不足一字的时间余数；0 间隔在下一 tick 或新正文显完，不代表已读。

Mixer 为 scriptGain × roleGain × masterGain：脚本 audio.gain 仍保存其语义增益，用户偏好不能污染 Task.gain 或旧快照。主增益放 master node，角色增益只乘一次，运行中的 source 与后续 source 都更新。

同实例设置写入串行，跨实例 revision 冲突明确拒绝，可显式刷新再重试。失败不显示持久成功、不改变剧情/profile；进入事务后 dispose 仍报告真实 committed/disposed。旧存储没有设置时返回缺省，不重置已有记录。自定义 Store 没有设置端口时公开更新 API 明确 unsupported，旧 session-only setVolume 保持兼容。真实默认 UI 使用持久 API。

其余文字/演出/图文存档/流程图/脚本 UI 按 G 任务逐项实现，不能由实例写第二解释器或任意赋 PC 代替标准引擎能力。
