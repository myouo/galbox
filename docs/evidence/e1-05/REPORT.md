# E1-05：远程CI反馈闭环

2026-10-28。用户明确要求配合远程CI查漏补缺。原始日志/trace/artifact仅在ignored artifacts/ci-followup；外部操作仅为已授权SDK Git推送及Actions读取，无npm实际发布。

- 83f1576，run40629719622：浏览器3失败。后台策略与视频截图时序已由E1-04修复；Canvas鉴赏trace显示创建context约40457ms，业务流程只需数秒，45秒预算被环境建立耗尽。
- eaa1f38，run40632652298：check/单元/compatibility通过，浏览器171/172，仅Canvas鉴赏仍超时，后续CLI/consumer/release被阻断。
- 本地使用TMPDIR=/dev/shm复跑WebGL/Canvas鉴赏各2次：4通过，但Canvas仍有25–36秒尾延迟。d282bd9把Canvas标题匹配与互补集分到独立CI任务，并保留原超时、断言、单worker和独立artifact；本地候选测试列表22+154=176，互补覆盖不漏测。
- d282bd9，run40635073665：两个浏览器任务均success；主任务check/单元/compatibility/CLI/实包consumer通过，继续发现test:release失败。npm dry-run返回按包名包装的对象，旧解析器假定顶层name，导致undefined不等于galbox-sdk。
- 修复npm报告解析，同时接受旧flat报告和单一正确包名包装；错误包名/多包/空值/异常形状拒绝。原包名、版本和文件清单断言保留；新增2项负例/互通单元及实际SDK/CLI dry-run通过。不是放宽校验或实际发布npm。

最终代码提交3e311870f9d01971960b6ae404d329cc7141d26a，run40637434057全部success：主check任务（含CLI、独立实包、实际SDK/CLI release dry-run和包检查）及Canvas 22项/其余154项浏览器，合计176项。无放宽超时、删除断言、skip或自动重试。准确SHA/完整任务/日志保存在3e31187-result.json和3e31187.log，见[GitHub Actions](https://github.com/myouo/galbox/actions/runs/40637434057)。G3-07功能验收完成；并行文本等待分支的CI不是本报告证据。


810a3a5（仅验收文档）的run40639300311复跑进一步暴露stage用例的轮询退避边界：第二次读档后一次textContent RPC耗时4232ms，返回调用开始时的join状态；默认100/250/500/1000ms退避在剩余约400ms时提前停止。已核对固定Playwright版本的pollAgainstDeadline实现。改为固定50ms取样，保留原5000ms等待与45000ms用例门槛及全部双路线/像素/恢复断言；本地stage全文件连续3次共9项通过，TS检查通过。

为减少长时间软件GPU进程的累计压力，互补的剩余浏览器集再分四片，单worker/每例超时保持。新增真实check:browser-shards，用Playwright发现全部测试并逐片比对ID集合，拒绝遗漏/重复/空片；当前22+42+43+34+35=176。CI禁止test.only，分片artifacts独立。该次CI修正仍待最终SHA远程复验，E1-05恢复in_progress，不能用上一绿灯替代。
