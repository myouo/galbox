# 0017：ADV/NVL 窗口、主题与正文端口

G2-02 有限支持集：Program.textLayout@1 在1280×720逻辑画幅内声明最多8窗口/16主题。每窗ADV或NVL、矩形/层级、初始显隐、主题、容量；主题提供安全颜色、边框、padding、字体大小/行距/字距/对齐及system或已登记TrueType字体。工厂与Schema关联资源/身份，未知窗口/主题/字体、越界矩形或坏容量明确拒绝。不接受任意CSS/HTML；竖排、禁则、自动分页/溢出重排、字体glyph覆盖认证另留后续，NVL以可滚动容器和显式clear分页。

Snapshot.textLayout保存定义/字体来源规范签名、active窗口、各窗显隐/主题与已确认entries；Snapshot.text仍是唯一当前揭示权威，附window{id,at}。ADV开始新段替换已确认内容，NVL保留已确认段再附当前段；容量满拒绝，要求显式清页，不暗丢内容。确认翻页才写ReadUnit/全局history/窗口entry。后继choice仍显示旧段，重复引用必须一致。旧段冻结，不因新偏好改变旧continuation。选择窗口不抹掉其它窗口；清窗仅清该窗显示，不删全局历史/profile。一个剧情流，不做多个窗口各自独立PC或假并行文字任务。

text.window.select/clear/visible/theme均由Core执行，只有剧情运行时可到达；待输入文本必须属于active且visible窗口。text.clear在layout模式清active窗。恢复严格检查layout/字体签名、全部窗口身份/容量/主题、当前和历史段来源、已确认条目与history闭包及当前prompt关系。新Program缺layout状态、旧Program多layout状态、来源变更不猜迁移，保留旧槽位。

字体作为font/ttf资源进入相同provider/摘要/有界预加载/清单事实路径。中立检查有限SFNT TrueType目录与必要表；FontFace.load作实际浏览器验证，必要字体失败在激活前拒绝。每个Host独有family和FontFaceSet登记，dispose只移除自有字体；取消后的迟到load不登记。仅统计编码字节，不假称测量字体解码内存或所有字形覆盖。系统字体为显式fallback。

Player.textRenderer工厂在资源/字体就绪后创建，接收独立Program副本、mount、已准备fontFamily查询。端口render/applyDisplayPreferences/dispose只处理表现，不持有或写Core/PC；默认createDomTextRenderer可包装复用，渲染输入是独立只读快照。dispose不再调用renderer.render；失败/迟到创建仍清理自有资源。默认DOM按同一窗口状态渲染，resize缩放逻辑画幅，用户字号/背景偏好叠乘作品主题。NVL自动滚到新段，滚动位置是设备表现，不保存DOM行号。
