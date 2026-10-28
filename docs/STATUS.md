# galbox-sdk 当前状态

2026-10-28，基线8b9c59a，本轮按用户优先级完成G1-03后台演出与F-01B有限首页/交互；G3-07仍todo，F-01A整作迁移仍in_progress。固定TS/Pixi双设备/DOM/可选React/IndexedDB/protobuf，真实工程在SDK外，不逆向exe。

G1-03/ADR0041：playback.backgroundPlayback默认continue，旧v1/v2补默认；失焦/隐藏退出Auto/快进，OP与音轨继续，普通文本到下一输入点停住，回来不恢复Auto。可显式选择pause，用户/系统菜单/设备/资源暂停独立。隐藏250ms实例timer驱动同一coordinator，不做无用绘制但仍更新真实音轨增益；隐藏保存刷新正文后同切点捕获；dispose/结束清timer。无硬实时/全平台后台保证。

验证：check/生成/strict/纯Core/导入/仓库通过，40文件255单元；10相关浏览器（新3+原7）及初始化焦点修正后新3复验通过。实包consumer播放/存档/恢复/公共类型14入口通过；232文件508663字节，无游戏/日志/证据/maps/JSON Schema。SHA256=135464bdfce17645fe8acc23e399fdfbcc4394bfde706dbda51b8becb60e312a。证据evidence/g1-03/REPORT.md，raw在ignored artifacts/background-playback。

独立/home/myo/Desktop/galbox-fata-morgana冻结精确包，禁原生右键/selectstart/拖图/CSS文字选中。首页全部原按钮可用：开始、读取、设置、原外链/不同语言的退出。原opt/saveload美术，真实SDK图文保存→确认回标题→读档，偏好/默认值/即时拖动/后台设置持久，安全外链与实际dispose停止。原作独立已读速度暂显示同普通速度，未伪装独立功能；原固定槽制/保护/完整菜单转场仍待。原前导44/原曲358s/22页保持。

独立验证：3 Python+20 TS、8语言真实Core序列/两恢复切点/资源闭包、严格边界和完整10浏览器通过。新首页/偏好刷新/读写/焦点/右键选择/链接退出及后台OP同epoch、Auto关闭通过；旧原曲实际波形/原曲刷新恢复/前导/原图像素6项保留。开发hmr=false，源码/程序资源写入后导航计数与会话token/epoch保持，演出继续，原资料/日志/vendor仍403。它解决开发改码引起的重开，不把窗口blur当成重启指令。用户需手动刷新一次加载新版本。

下一G3-07按源淡出后停止与多个剧情SE缓冲，然后正常对话/炉火/宏注册CFG。普通剧情、click-skip、glyph/textfade、tft/完整i18n、原档/global与原作对照仍未完成；当前不是整作认证。原槽保留，无隐式旧release迁移。只本地提交，不推送发布；独立pnpm dev在4180默认Canvas，SDK pnpm dev为原创验证应用。
