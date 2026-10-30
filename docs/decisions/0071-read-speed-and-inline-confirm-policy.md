# ADR0071：已读字速和可忽略行内确认

TextPreferences/patch 增加 readIntervalMs（-1继承普通字速）、skipInlineConfirmations、readSkipInlineConfirmations；均为可选字段，新偏好默认-1/false/false，旧设置升级补默认。已读取当前profile的稳定ReadUnit，入段/应用设置时决定有效字速，不每帧扫描目录。普通skip标记对所有段落生效，readSkip标记仅额外作用于已读段落，与已读字速独立；不把nonstop解释为字速0。

RichTextSourceRun/TextRun.confirm新增可选skippable，缺省true；显式false不能被上述偏好忽略。旧Program/签名和Snapshot字段保持不变，新增明确false时属于新的源定义，旧消费者不得静默接纳。读速/跳确认是当前系统偏好，恢复后由Host重新应用；已消费的游标仍由Snapshot保存。暂停中的设置变化不替用户确认，下一次文字tick/reveal按当前策略处理；强制确认、字符单位等待的已采样余量、自动续段和页末真人等待仍区分。

忽略行内确认不自动推进普通页末，不伪造输入。确认身份变化仍更新prompt，counter溢出在修改时钟/正文前拒绝。保存/刷新、已读/未读、继承/显式速度、途中变更、强制确认及旧快照/偏好需要真实工厂与负例验证。
