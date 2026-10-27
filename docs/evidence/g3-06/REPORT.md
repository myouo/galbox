# G3-06：介面音效與原作音訊接入

2026-10-28，SDK基线43af5b5，分支feat/interface-sound-cues。有限支持集见ADR0040/MEDIA。保持唯一TS Core/Web Host、独立作品工程/真实tarball、源KS/TJS分析，不逆向exe。

## SDK

单一YAML新增UISoundRequest及稳定Protobuf消息，生成类型/validator。真实uiSound工厂关联audio资源，Player.playUISound返回开始/阻塞/取消回执，所有失败经Promise拒绝；独立诊断不污染剧情错误。短buffer最多30秒、gain0..1，一次一个cue，准备最多10秒。资源沿现有摘要/解码/cache预算与租约，独立惰性AudioContext使暂停菜单仍可响；master×sfx偏好即时生效。新cue/停止/隐藏/blur/用户暂停/激活/dispose取消旧准备或来源，不修改PC/profile，不保存或读档重播UI提示音。

真实验证：

- pnpm check（check-accepted.log）：生成一致性/strict类型/纯Core与导入/仓库边界通过。
- pnpm test（unit-accepted.log）：40文件254项通过；新增实际工厂kind/gain/未知字段、外部输入隔离、protobuf边界0/.25/1。非有限数在更早的INPUT_JSON边界拒绝。
- browser-accepted.log：17项通过（新UI5+音轨/历史12）；最终Promise错误契约后新5复验；再补通知回调重入守卫，最终6项在browser-accepted-final.log通过。订阅回调同步dispose不再建context/抓资源，通知期间更新cue不会被旧呼叫覆盖。真实自然结束/暂停菜单/实际增益与静音、剧情两声源和head/PC不变、替换/迟到租约一次归还、load/dispose、错误kind/element/摘要隔离、10秒超时、真实31秒PCM拒绝均验。
- Chrome trace的DOM采样会引入自动化手势，首次阻塞测试因此失败。该文件改为关闭trace并用CDP userGesture=false建fixture/读取；仍以真实鼠标点击解锁，保留blocked和零资源抓取断言，没有伪造浏览器策略或skip。
- 独立consumer-accepted：真实tarball安装、公共声明/14入口、播放/保存/恢复/备份等通过。SHA256=753b4f63e8c56f8265aeacc1faacb5bc32d115c1a4e2746525282b9c0860f718。
- node scripts/audit-package.mjs：232文件、507752压缩字节，无游戏/测试/日志/证据/maps/JSON Schema，仅npm package.json元数据。没有发布或推送。

raw均为ignored artifacts/interface-audio；新增UI功能没有改动Core任务/存档ABI。

## 独立真实源消费

/home/myo/Desktop/galbox-fata-morgana安装精确新包并冻结锁。strict/边界、3 Python+18 TS、8语言源序列/22页/两恢复切点、最后完整6浏览器通过（browser-audio-all-final.log）；包含原曲恢复身份/attempt/playing断言和producer实际Canvas像素。此前相关针对性2项也通过。开发模式单独原生验证见实例dev-audio-verification.log，原资料/日志/vendor仍403。

独立转换器按title.ks/MessageLayer/SE/BGM/GraphicLayer/AnimationLayer的源组织，接入按钮enterse/clickse、4秒菜单规则离场/3秒黑场/5秒BGM包络、44次静态前导转场与原等待、358.4秒OP曲、22页旁白及其后4秒淡出。OP曲仍用element、loop/replay，UI短SE用buffer。新档按原100%声明音量默认值，不覆盖已有偏好；balanced预取与64MiB逻辑resident预算应用于本实例。

实际Web Audio增益后波形采样：钢琴RMS约0.01672，OP约0.00006464；原进入音1.781秒，雷声15.1626秒且自然保留尾音；旧曲淡出期间gain约0.632，新曲bus=1、真实element循环/时钟前进。测量时decodedAudioBytes=0，resident=62798936，小于67108864。raw audio-proof.yaml和截图只在实例ignored artifacts/browser，截图已检查；这些是浏览器信号/逻辑预算，不是物理扬声器音质或真实RAM/VRAM认证。

八语言不是按行zip：日/韩隐藏菜单层与其他语言clear图等价目标分别解析；意大利保留178999ms（其他179000ms）的44转场总时长；少数版本pagebreak默认表达式只保留为有限声明，不执行TJS。未知操作/动态内容/ASD仍拒绝，所有语言完成后再验资源闭包；重复转换24份protobuf摘要一致（实例audio-reproducibility.log）。并发引用同一SE曾被Builder正确拒绝重复身份，已改Promise memo并加真实并发注册反例。

完整44序列/保存测试以可控浏览器活动时钟缩短等待，未伪造Host完成；另有约24秒原生时间/真实音轨与波形验证。未实跑全部约213秒前导的墙钟AV对照，不认证完整原作运行一致性。

## 尚未覆盖

本轮覆盖当前新档前导/22页中已出现的音讯；其他章节仍随剧情迁移。源fadeout为停止旧buffer，当前以bus降至0、下一曲替换时清旧element；两者之间可有不出声旧源，playbgm音量复位使用最小1ms包络，不能称逐采样同原作。G3-07继续做按源绑定的淡出停止与多个SE buffer，避免用UI cue冒充可保存剧情SFX。

原作点击完成转场、quick/context/其他菜单、glyph/textfade细节、正常对话宏/变量/角色上下文、中日.tft、完整i18n、原档和整作仍未完成。静态页预合成后由SDK实时执行转场，不是预录动画；动态children/任意TJS没有因此被实现。原档/global与原作继续参照仍缺。

依据：[Web Audio Analyser](https://www.w3.org/TR/webaudio/#AnalyserNode)、[Chrome autoplay](https://developer.chrome.com/blog/autoplay/)，以及本地原作系统源码；不以静态源分析冒充原版运行认证。
