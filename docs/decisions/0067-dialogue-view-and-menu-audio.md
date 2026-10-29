# ADR0067：临时消息可见性、取消与菜单音频

Player增加显式menuAudio=pause|continue（缺省pause保持已有行为），实例声明continue时菜单只暂停剧情时钟，不暂停已有媒体；用户/device/gallery等暂停仍有效；资源等待的媒体策略由后续ADR0068单独定义，历史语音预览仍沿既有独立会话规则。

DialoguePresentation是Schema验证的数据：最多128个要临时隐藏的舞台对象ID、128对已声明image资源替代。后者供既有合成背景提供无文本框版本；必须同尺寸、受同一个AssetCache预算，不由实例另建渲染器。只在稳定text切点、无图片/组转场时隐藏；位移、粒子和音频可以继续。Host只投影可见性/图像，Core快照不被改写。替代加载失败、取消、旧epoch和销毁不留下半完成视图。

CoreEvent.tick可选text=false停止正文揭示/自动续段，仍推进表现任务；缺省保持旧行为。Player隐藏时关闭Auto/快进、禁止剧情输入；首次step/reveal只恢复显示，不推进PC。加载/菜单/销毁清除临时隐藏，保存截图总是权威正常视图。自定义TextRenderer未实现setVisible时明确unsupported。

右键由实例取消栈处理窗口层级并调用Player显示API；浏览器contextmenu仍preventDefault，以免系统菜单遮挡游戏。一般菜单/章节UI不在Core硬编码。证明真实媒体继续、正文/PC不泄漏推进、动画继续、恢复/截图和资源取消预算。
