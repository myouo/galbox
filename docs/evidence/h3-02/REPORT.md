# H3-02 图形提交与释放尾延迟归因

2026-10-27。生产基线c71537b，WebHost图形实现本轮未修改。结论：当前Chromium 156/ANGLE SwiftShader环境确有提交积压与context loss长尾；增加同步读取只把等待前移，关闭MSAA也没有稳定总收益，因此未引入这些生产改动。本任务交付受控归因与平台限制，不声称消除了GPU尾延迟。

## 受控工作负载

`scripts/profile-graphics-teardown.mjs`使用真实生产Core/WebHost，原创shore/envelope资源和960ms移动；每次初始一帧+60次16ms更新，共61次真实渲染提交。所有案例完整snapshot字符串相同；burst连续提交，raf由实际requestAnimationFrame间隔。没有另一个剧情Player产生多余帧。每组合3次，清理本实例资源后owned各项为0，globalClears=0，pageErrors为空。原生方法计时本身有开销，不能直接与H3-01无采样整体Player基准混算。

默认实际antialias=true、samples=4，no-msaa实验实际false/0。none直接释放；finish调用真实gl.finish；readback真实读取1×1像素。JSON的finishMs字段代表所选drain的实际耗时。renderMs包含该提交阶段的等待，totalMs为render+drain+dispose，不包含初始化/资源准备。

## 默认设置，三次中位数（ms）

| 后端 | 节奏 | 等待 | 提交阶段 | 等待 | dispose | 等待+dispose | 总计 |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| webgl | burst | none | 33.3 | 0.0 | 1174.4 | 1174.4 | 1224.6 |
| webgl | burst | finish | 28.9 | 0.0 | 1170.9 | 1170.9 | 1199.8 |
| webgl | burst | readback | 30.9 | 1228.6 | 6.9 | 1235.5 | 1266.4 |
| webgl | raf | none | 1050.9 | 0.0 | 455.6 | 455.6 | 1490.0 |
| webgl | raf | finish | 1238.6 | 0.1 | 468.3 | 469.7 | 1706.0 |
| webgl | raf | readback | 1239.0 | 472.1 | 6.4 | 480.0 | 1722.0 |
| canvas | burst | none | 375.7 | 0.0 | 1.2 | 1.2 | 376.7 |
| canvas | raf | none | 1103.9 | 0.0 | 0.5 | 0.5 | 1104.6 |

各列独立取中位数，不能要求中位数相加等于总计中位数。burst/readback的dispose约7ms，但前置读取约1229ms，不能单报7ms当成从1174ms优化成功；rAF组也同样把等待移动到读取。这里gl.finish耗时近0且没有降低后续释放等待，不能凭调用名称断言GPU已经排空。慢调用主要落在原生WebGL.loseContext，证据支持提交/设备释放路径的成本，不证明所有真实GPU行为相同。

no-msaa对照的burst/none总计中位数1407.8ms，对比默认1224.6ms；raf/none约1392.7ms，对比1490.0ms。方向不一致，样本有限，不能作为稳定收益且会改变画质，因此生产仍保留默认抗锯齿。Canvas直接释放约0.5–1.3ms，但burst渲染CPU成本更高；不能由此声称所有Canvas场景都更快。

## 文件与复现

- `fixed-trace.json`、`fixed-trace.log`为最早18案例探索，保留，不作为最后drain完整矩阵。
- `drain-control/fixed-trace.json`及日志：默认24案例。
- `no-msaa/fixed-trace.json`及日志：关闭MSAA的24案例，只有测试覆盖，未进入生产。
- 源文件身份及全套回归见相邻`../w1-01/source-manifest.json`与REPORT；图形Host没有生产修改。

复现：`export TMPDIR=/dev/shm`；`GALBOX_EVIDENCE_DIR=docs/evidence/h3-02/recheck pnpm profile:graphics`；关闭MSAA额外设`GALBOX_GRAPHICS_EXPERIMENT=no-msaa`。不要与其他浏览器性能任务同时跑。WebGL实际使用软件GPU；Safari/Firefox/实体移动设备/GPU尚未验证。

继续按实例及时清理设备，不延迟到计时区外，不调用全局缓存清空。当前限制进入WEB_READINESS/G7；后续资源工作集和背压方案须以实际端到端测量决定，不能用本归因报告代替大作品性能认证。
