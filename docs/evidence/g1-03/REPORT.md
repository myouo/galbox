# G1-03：后台演出、音乐与自动阅读

2026-10-28，基线8b9c59a，有限语义见ADR0041。按用户最终要求：失焦/后台继续OP及音乐；退出Auto/快进，普通正文停在下一读者输入点，回来不自动重启Auto。暂停全部仍可选，显式用户/菜单/设备/资源暂停不因focus解除。

新增可选PlaybackPreferences.backgroundPlayback稳定tag3和patch字段；默认continue，旧v1/v2规范化补默认。单一YAML生成TS/validator/Protobuf，公共设置UI可改，不写Snapshot/Profile，不改变Core ABI。可见RAF与隐藏250ms实例timer互斥，后台省略舞台/正文绘制但继续更新音轨增益，退役规则图表面，回前台按当前状态绘制；prepared脚本UI在后台不接输入。隐藏保存先更新正文，保证同切点捕获。dispose/暂停/结束清timer。

实际验证：

- pnpm check：生成/strict/纯Core/导入与仓库门禁通过（check-final.log）。
- pnpm test：40文件255项通过，含旧设置补默认/模式非法值/protobuf；其余控制流、快照、进度和媒体断言保留（unit.log）。
- 10浏览器通过（background3+既有偏好/播放7）；最终初始化焦点取实际document.hasFocus后，新3复验通过（browser.log/browser-final.log）。实测原生35秒音轨时钟在blur后前进，OP同epoch继续，Auto关闭且不能在后台重启/不穿正文；禁止RAF的隐藏边界仍由真实coordinator前进，bus=.4时原生gain=.04、当前正文/图片保存正确；严格暂停保持时钟，focus不解除用户暂停，dispose无后续tick。
- 当前隐藏边界测试采用可控visibility/RAF故障注入，媒体播放/解码/时钟均原生，不伪造完成；不能据此称所有移动OS后台行为已认证。
- 独立consumer实际安装/类型与播放/保存恢复通过。包SHA256=135464bdfce17645fe8acc23e399fdfbcc4394bfde706dbda51b8becb60e312a，232文件508663压缩字节，14入口，无游戏/日志/证据/maps/JSON Schema。
- 独立F工程同一包，实际原作OP同epoch/逻辑时间继续且Auto关闭、原曲波形/358秒loop与原曲刷新恢复、完整10浏览器通过；另有开发服务不热重载验证，见F-01B报告。

raw只在ignored artifacts/background-playback。浏览器可能节流/挂起，250ms为请求频率而非后台硬实时承诺；作者声明的倒计时逻辑继续按其定义，不假造读者选择。旧槽/profile不回写本设置。

依据：[Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)、[Chrome后台计时](https://developer.chrome.com/blog/timer-throttling-in-chrome-88/)。G3-07按源停音/多SE仍未执行。
