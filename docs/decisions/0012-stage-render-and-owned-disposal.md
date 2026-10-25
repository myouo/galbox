# 0012：按舞台变化绘制，按实例释放资源

H1-01 对 090d6ee 的真实 Player/固定 Pixi 8.22.0 探针复现了销毁长尾。baseline 1616 ms，其中 WEBGL_lose_context 占 1604.4 ms；468 次 render 请求全部提交。只改 scoped destroy 仍约 1619 ms，但不再清空外部全局池；试验性相同舞台去重将提交数降到 275/633、长尾降至约 288 ms。探针含 CPU profiler/测试包装，最终以未包装的生产性能脚本复验，不把试验结果当成最终门槛。

生产支持集仍是单 Pixi 舞台的 id/asset/x/y/alpha/z。Host 保留上一成功提交的舞台值副本，完整比较这些字段及顺序；只有相同时跳过 GPU render。DOM 正文、Core 事件、profile/历史、消息队列与逻辑时间照常推进。新 epoch 清缓存，读档/接管即使舞台相同也重建一次；动画字段变化仍绘制。缓存不引用外部可变视图，不成为剧情或存档权威，无新增协议/操作/API。

使用 Pixi 显式 `{removeView:true,releaseGlobalResources:false}`，仍销毁本实例纹理、舞台、renderer/context、声音和输入。布尔 true 会触发 GlobalResourceRegistry.release，包含并非本实例独占的全局缓存，违反隔离。不得用延后释放、跳过 context loss 或提前宣称拥有资源归零来掩盖长尾。

app.init 未完成时 dispose 可能尚看不到 renderer。初始化若在取消后才完成，必须销毁局部 app 后拒绝，不能仅依靠已经幂等返回的 dispose。用真实延迟初始化验证新建 context 已丢失、canvas 未挂载、外部全局池未清空，以及同会话其他 Player 仍可推进和存储。

此修改不改变存档/等待/调用/已读语义。GPU 同步销毁剩余等待属于实测限制，不承诺任意驱动 <50 ms；H1 目标是消除重复静态绘制和越权清理，并在相同参考场景显著降低已有秒级长尾。

首次未包装生产复验三个活动周期为 412.5/541.9/360.2 ms，保留 target-missed；不放宽 500 ms 参考门槛。进一步受控探针对变化后的生产 Host 比较非阻塞 flush：活动销毁约 480→105 ms。交互/读档提交并不只发生在 RAF 内，故每次真正提交图像后 gl.flush，让命令及时执行；不调用 finish、不等待 GPU fence、不推迟释放。与 [MDN 的 flush 建议](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#flush_when_expecting_results) 一致；该来源只说明 API 行为，改善幅度由本机实测决定。
