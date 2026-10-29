# ADR0066：正文阴影与离散淡入

TextStyle可选shadow指定颜色与em单位偏移/模糊（有界）。fade可选samples（2..16个0..1不透明度，按duration等分并保持阶梯值）和minimumIntervalMs（用户基础字速低于此值则立即不透明且不等待淡入）；省略保持既有线性淡入。新增text.authored-opacity能力，公开工厂/链接/保存来源验证沿同一RichText路径。

JP/ZH原MessageLayer采用50/255起始不透明度、每40ms增加65/255，160ms结束，kag.userChSpeed<=10时不用淡入。独立转换器仅匹配含该实现的版本，并跟随cm重置字体、jinobun关闭阴影及显式font。浏览器仍使用字体栅格化，不声称复刻KRKR原抗锯齿重复绘制算法。

shadow三个数均为0显式表示无阴影；未提供shadow时保留既有宿主CSS继承，避免改变旧程序视觉样式。样本不透明度自身有界，允许作者指定结束值；读取完成仍按有限duration及用户字速门禁判定。
