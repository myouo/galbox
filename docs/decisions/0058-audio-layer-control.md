# ADR0058：具名BGM、延迟包络与终态源控制

在原audio.sources基础增加audio.layers：最多两个声明的具名BGM槽（默认BGM槽保留）、BgmBufferRef/bgmTrack工厂、源gain设置、source fade可选delayMs以及fade/stop/gain/wait的显式inactive=ignore。缺省仍严格拒绝无活动源；ignore只跳过缺失/正常终态，失败源不冒充完成。忽略的fade不创建虚假完成任务，作者不能等待未创建的fade；媒体wait不伪造自然完成。

延迟只作用于包络，媒体在命令执行时立即从零gain启动；Task.duration包含delay+fade，保存完整delay/elapsed/源ID/旧尝试身份，恢复重建物理播放并继续剩余逻辑包络。总时长仍有界。Source gain替换该源上的包络，不修改其它缓冲或用户role偏好。旧默认参数/声明签名保持；新BGM声明进入完整source signature。

真实KAG BGM.exchange默认overlap=0，下一缓冲fade-in delay=outtime；本章两次交换前均为已声明loop。普通play/fadeIn停两槽并回默认槽。SE自然结束后fadeOut/stop为无声动作，本章无wb/wf等待，ws仍由真实完成驱动。原KRKR2公开SetVolume代码夹0..100000，实例保留nominal150并将可听fade-in斜率换算为time/1.5，不能擅自放大音量。

Host对不再播放的历史media用可信release事实检查loop范围，不为已结束音效加载全部历史字节或使用duration0。需要自然结束/具名槽独立/延迟中存档/失败与取消/版本化URI/实际音频和独立消费验收。不是原作存档codec。
