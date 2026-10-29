# ADR0054：持久预取页数

PlayerPreferences v2与PreferencesPatch增加可选prefetchPages（0..8）。缺省沿用作者LoadingOptions.lookahead，不更改旧档/旧偏好的语义；显式值写入既有IndexedDB偏好CAS，独立于剧情Snapshot。balanced模式动态使用当前偏好，0关闭推测预取；其它模式保持作者选择。只改变提示扫描页数，不改变128指令/16资源边界、分支/扩展停止、当前工作集引用、资源准备屏障及内存上限。调整时只撤销推测引用，不取消必需加载。

默认实例仍2页，提供2/4/8及0选择，八语同步；作者仍可通过LoadingOptions设定预算/并发和策略。较多页不保证会加载更多资源，受程序静态可达性和预算限制。偏好导入/导出/重置、旧v2无字段及真实刷新需要验证。
