# E1-05：远程CI反馈闭环

2026-10-28。用户明确要求配合远程CI查漏补缺。原始日志/trace/artifact仅在ignored artifacts/ci-followup；外部操作仅为已授权SDK Git推送及Actions读取，无npm实际发布。

- 83f1576，run40629719622：浏览器3失败。后台策略与视频截图时序已由E1-04修复；Canvas鉴赏trace显示创建context约40457ms，业务流程只需数秒，45秒预算被环境建立耗尽。
- eaa1f38，run40632652298：check/单元/compatibility通过，浏览器171/172，仅Canvas鉴赏仍超时，后续CLI/consumer/release被阻断。
- 本地使用TMPDIR=/dev/shm复跑WebGL/Canvas鉴赏各2次：4通过，但Canvas仍有25–36秒尾延迟。d282bd9把Canvas标题匹配与互补集分到独立CI任务，并保留原超时、断言、单worker和独立artifact；本地候选测试列表22+154=176，互补覆盖不漏测。
- d282bd9，run40635073665：两个浏览器任务均success；主任务check/单元/compatibility/CLI/实包consumer通过，继续发现test:release失败。npm dry-run返回按包名包装的对象，旧解析器假定顶层name，导致undefined不等于galbox-sdk。
- 修复npm报告解析，同时接受旧flat报告和单一正确包名包装；错误包名/多包/空值/异常形状拒绝。原包名、版本和文件清单断言保留；新增2项负例/互通单元及实际SDK/CLI dry-run通过。不是放宽校验或实际发布npm。

G3-07候选完成后将跟踪其准确提交SHA的全部CI任务；最终run/结果待补齐。任务未据局部或前一个SHA通过提前标done。
