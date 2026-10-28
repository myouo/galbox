# G6-02：输入控件初始化时序

2026-10-28。文档提交0bb73f4触发的CI run40714202585中，check和3个浏览器分片通过，另2片分别出现存档名称abcd变成dabc、读档后的stage推进未改变prompt。已取得decoded失败日志；最初gh下载artifact以unexpected EOF失败，随后经GitHub连接器取得完整trace。

代码存在两个迟到副作用：SystemDialog在passive effect后再排RAF抢初始焦点；PressButton在passive effect取消手势，可能跨过可交互DOM已经提交的时间。改为layout effect建立/清理手势身份和对话框初始焦点；已在对话框内的焦点保留。取消旧身份、重复键、嵌套确认和关闭回焦语义保持。无Core/Program/存档ABI变化，不修改或放宽原测试断言/时间。

实际check通过。原两条失败用例各重复6次，12/12通过；presentation、stage、save-system全部19项通过，含真实WebGL/Canvas、移动触控、存档/恢复/覆盖/原子失败、完整两路线。strict独立consumer播放/保存/备份/恢复通过，新tarball SHA256=06efd13b7f452f76c1f206792798e8669bc01fa321d534eaa5881c6c6d354331。新代码CI由本提交对应Actions记录提供；旧0bb73f4失败保留，不混称全绿。

raw在ignored artifacts/prologue-ci（check/build/repeat/ui/consumer及失败日志）。主SDK并行代码未改；SDK子模块提交后重新打包，实例随后验证前端是否与已上线构建逐字节相同，不能凭包名相同沿用证据。

2026-10-29续验：eb11b90 CI check及4个浏览器片通过，编辑器用例已通过；最后stage检查仍超时。完整trace显示两次有效点击已进入light:join，但下一次诊断locator.textContent停在selector等待直到断言期限，不能把这个失败继续归因于未接收点击。改为page.evaluate直接读取同一个诊断DOM，保留全部任务/恢复/像素断言、5秒期限与50ms采样。stage三项各重复3次，9/9通过；不修改生产代码或包字节。新CI按该测试修正提交核验。
