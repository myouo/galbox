# F-01B：原作首页与浏览器交互

2026-10-28，实例基线7a0364e。源码/原资产仅在/home/myo/Desktop/galbox-fata-morgana，继续真实SDK tarball/公开exports，不复制引擎或执行TJS，不逆向exe。

禁用游戏区原生contextmenu/selectstart/拖图，CSS禁止文字选择及触控callout。右键不会推进/打开隐藏的SDK菜单，键盘/滑条仍可用。首页按原鲜开title_main显示全部按钮命中区/hover音效，源码资产保持800×600：开始、读取、设置，以及中文等版本的原主页链接/英文等版本的退出。

读取页用原saveload背景、4卡布局与真实SDK槽位/同切点缩略图；读取确认后走Player.load，失败不伪造成功。系统菜单可保存/读取/设置/确认返回标题；标题设置/读取时Core仍停在原choice，标题音乐保持。设置用原opt_base/slider/按钮美术，SDK更新持久音量/正文速度/瞬显/Auto等待/后台策略，恢复源新档默认20ms/1000ms/100%音量；已读速度目前明确同普通速度，不假装独立实现。偏好乐观草稿避免IDB提交前复选框/滑条回跳，SDK仍是持久权威。

主页外链从原shellExecute字面串提取，验证http(s)/novect.net，不执行脚本，noopener/noreferrer；测试拦截目的页而不向外发消息。退出确认后实际dispose并停止音讯；普通浏览器页不能强关，因此显示停止状态及明确重新开始入口，不声称关掉浏览器。菜单焦点/Tab/Escape及取消处理有实际验证。

验证：独立strict/边界、3 Python+20 TS、8语言真实Core/176页与两恢复切点、转换后全部发布摘要通过。新增菜单元数据检查验证实际哈希资产/未知动作/不安全URI拒绝。完整10浏览器通过：旧8语言/存档/波形/前导/producer6项保留；新增首页所有入口/偏好刷新/返回不重启Core、右键/选中阻止、菜单真实图文保存→确认返回标题→真实读档、后台OP不重开/Auto退出、外链/退出实际动作。

开发服务hmr=false，避免agent改码/重新转换时自动重建会话；这只改变开发重载方式，手动刷新仍按游戏启动流程。开发模式验证会同时触发main.tsx及程序资源文件写入，检查导航计数/会话token/epoch不变、OP继续，不把WebSocket数量当重载等价物。最终结果见实例dev-continuity.log。

本轮不扩大为整作或原作逐像素/墙钟AV认证。原独立已读速度、所有书签保护/固定槽制/删除页、精确菜单转场、正常对话/宏CFG、tft、原档等仍未完成。原保存点仍按release拒绝无迁移旧档并保留文件。原始日志/截图/JSON/trace/vendor/public均ignore，SDK包无商业载荷。

raw：实例artifacts/{check-homepage-final,unit-homepage-final,convert-homepage,browser-homepage-all,dev-continuity}.log及artifacts/browser截图；SDK evidence/g1-03记录后台通用实现。
