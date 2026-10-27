# ADR0038：正文页内确认

G2-04有限集：richText.confirm()生成零宽confirm控制，表达同一正文页内的点击等待（KAG [l]的通用基础）。不清空正文、不新增历史条目、不标整页已读，也不推进PC；最终页尾确认仍独立进行。不加入通用KAG/TJS解释器。

RichTextState使用可选waitingForClick=true，cursor指向对应confirm token。旧无confirm源的快照保持原格式；新控制使用新的稳定protobuf union tag，旧SDK不识别时明确拒绝。源签名改变不能通过单独状态修补接纳旧档，不宣称隐式跨内容迁移。

step在尚未显完当前段时只显完该段并停在confirm；已等待时解除一次确认，继续下一段。reveal不越过confirm；advance只解除已到达的确认或完整页尾。进入页内等待、解除等待或主动显完新控制页当前段时更新输入prompt，保留逻辑historyId，旧prompt/重复inputId不能消费后续段。自动时钟不把等待前的剩余时间预付下一段。

富文revealedAt允许按完整段显完的null组，按confirm划分验证；没有confirm时保持旧的整页instant约束。保存与恢复保留段内揭示、暂停/效果时间和确认游标。Auto每次确认使用本页语音自然完成条件和autoDelay；skip仍遵守整页已读策略，并逐个语义确认边界推进。

验收覆盖真实工厂/预算1/8/100、Unicode边界、连续/首尾confirm、相同页ID与PC、历史/已读只在页尾提交、重复/过期输入、段中/等待/解除后的protobuf和持久恢复、游标/flag/instant伪造拒绝、Auto/Skip及真实浏览器图文保存/刷新。独立作品只安装重新打包的SDK，原脚本中的[l]必须由转换器实际生成confirm。

默认UI在页内确认处显示继续，独立作品UI仍由作者的原作界面决定。自动存档on-prompt按新的输入阶段触发并保持有界槽位环；它不是页末历史/已读提交。
