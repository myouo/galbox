# ADR0045：绑定音源的包络与具名SE缓冲

状态：接受；G3-07有限支持集。来源核对仅在独立工程只读进行：BGM的fadeOutAndStop在当前buffer的fade完成后停止该buffer；SE按声明的buf选择独立源。SDK不识别作品，也不提交原脚本或素材。

## 范围与身份

新增能力`audio.sources`，依赖既有audio.extended/expressions。Program可声明最多8个唯一`sfxBuffers`；Builder的`sfxBuffer(id)`返回类型化引用，`sfxTrack`只接受该引用及audio资源。原audio.track继续表示bgm/voice/默认sfx槽；具名sfx使用同一media任务/Host路径，并保留角色音量和sfx bus。

新增`audio.source.fade`（工厂audioSourceFade/audioFadeOutAndStop）与`audio.source.stop`（audioSourceStop）。source为已声明audio.track的任务名，执行时解析为最近一次活动media调用的逻辑task ID；包络保存该ID，随后同名或同缓冲新源不会继承旧包络。未知/非活动源明确拒绝，求值/冲突失败不提交部分状态。

包络在Core活动时间推进，保存from/to/easing/duration/elapsed和指令签名；修改目标源的script gain，独立于角色偏好/bus/duck。达到目标后包络completed；stop=true只将绑定源cancelled（不是自然completed）。源提前结束/停止则包络cancelled，被替换则superseded，失败则failed；等待不能假成功。reject/replace只裁决同一逻辑源的包络。

## 旧指令与恢复

旧audio.play/无buffer的audio.track只替换默认槽。audio.stop/audio.gain按原channel角色操作，扩展到该角色所有活动缓冲；直接gain修改会supersede该角色的活动源包络。audio.fade仍是角色bus包络，作用于该角色所有源。具名SE不会影响voice/BGM或独立UI cue。

Snapshot Task追加可选buffer/sourceFade字段及audio-source-fade种类；旧字段号码/旧指令必需参数不变。新Program声明新能力，旧SDK应拒绝；旧Program/快照在新SDK保留原义，不隐式迁移release。完整ABI迁移仍按原契约处理。

恢复闭包保留包络指向的源（含已结算但仍可达结果）；逻辑ID不变、Host epoch/attempt更新。活动replay源从0重播，包络从保存进度继续，不声称采样点续播。活动包络指向restore=stop源时明确禁存/拒绝恢复，避免生成孤立包络。buffer声明变化进入恢复身份绑定；损坏引用/重叠缓冲/错签名/增益不一致均拒绝，保留旧槽。

初始激活与读旧档分开：初始media意图即使restore=stop也应实际启动，不能应用读档取消策略；初始候选可进入这些禁存切点，后续普通capture/restore仍拒绝。该规则同样适用于既有media自然等待，保持与旧audio.play/video初始激活边界一致。

## 边界与验收

不引入任意无限轨道、精确seek、原生插件或通用KAG解释器。初版代码模块暂不支持新能力，必须显式拒绝，归W1-03B2。标准单体路径、真实工厂/类型负例、Core预算和失败原子性、原生buffer/element、保存刷新/迟到回调、独立tarball及远程CI共同验收。
