# ADR0046：字符单位等待

G2-05，独立分支，避开另一工作区的G3-07。通用richText.pauseUnits(units)产生pause.units控制，支持1–300字符单位；不在Core识别KAG或作品。SourceRun/TextRun新增union编号7，旧编号不变。

遇到控制时按当前有效interval（含speed指令、用户瞬显优先）采样，duration=units×interval，最多60000ms。已开始的等待在偏好改变后保留剩余时长；之后的控制按新设置采样。瞬显时新的字符等待为0；原固定pause语义不变。点击显完可跳过当前等待，页内confirm仍是独立输入屏障。

RichTextState仅增加可选pauseIntervalMs（字段13），只在活动字符等待期间存在。恢复验证前一token/源身份、1–200采样间隔与remaining<=units×interval；固定等待或非等待切点不得携带它。逻辑时间、停顿/揭示、Auto/Skip均由原Core推进，无Host/React计时器。保存保留采样值和剩余时长，不重新读取当前设置推算旧等待。

既有合法消息/存档ABI不变；使用新控制需新SDK，旧SDK明确拒绝未知变体，不提供假迁移。新源绑定仍按release/文本签名检查。声明/Schema/工厂/Core/DOM/失败反例、真实IndexedDB重建与实包消费共同验收。
