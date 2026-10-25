# 0015：播放控制、真实语音完成与输入偏好

G1-02 有限支持集：自动阅读（正文显完且当前 voice 播放真实结束后累计活动时间）、已读/允许未读的按住快进、可配置 keyboard code 的推进/菜单/自动/快进/快存/快读、字体缩放/框背景透明度、恢复作品默认值及独立设置 JSON 导入导出。未实现系统不接受伪配置。偏好 v2 包含旧 audio/text 和新 playback/input/display；旧 v1 通过同源 Schema 验证后完整迁移，修订与已有值保留。

Coordinator 的同一个队列处理模式/暂停/媒体结束，Core 仍只接收正常 reveal/advance/step 输入。每个 tick 在 Core 到达语义切点、派发效果后最多产生一个系统动作，预算续跑不重复决策。自动只推进 text；choice/end 停自动，group/delay/operation 等待不猜结果。延迟仅从正文显完与 voice gate 满足后的活动 tick 起算，不从资源下载或音频 startup ack 起算。暂停保留已累计时间但不补后台时间。

音频 Task.status 的 completed 仍表示 startup ack，不改旧 ABI。HostPort 新增可选播放结束回调，真实 source.onended 经队列按 epoch/task/attempt 核对；替换/stop/旧回调不冒充自然结束。当前 voice channel 有 pending/playing/blocked/failed/loop 时自动不得前进；声明 stop 的恢复没有播放源，replay 则重建后等待真实结束。模式与实际设备完成在恢复时重建，不把旧 auto/skip 或设备句柄放进 Snapshot；每次新 epoch 从 manual 开始。

快进只在 text 等待发 step，读前检查最新工作 profile；默认遇未读即回 manual，显式 skipUnread 才跨未读。它不跳 group/delay/flush/逻辑运算，不替用户选择，也不伪造媒体完成。所有系统动作有唯一 inputId，停止/冻结/换 epoch 后失效。

按键 adapter 只绑定本 Player 的 stage/default UI 或调用者明确给定的目标，keydown 记录 prompt/epoch、keyup 重验，不用浏览器全局快捷键推进多个实例。编辑控件不劫持输入，按钮的 Enter/Space 保留原生可访问激活；配置快捷键作用于非控件区域。重复 keydown、失焦、暂停、菜单、读档与映射变化清理瞬态，按住快进也清理。

显示辅助只影响 DOM CSS 变量，不改 textId/revision、PC 或已读；透明度仅背景，不淡化正文。缩放不声称提供自动分页/NVL，G2 另行定义。设置备份显式 JSON，仅玩家设置，不是故事备份；原故事备份继续不包含设置。恢复默认使用实例 preferencesDefaults，通过同一 CAS/提交路径。
