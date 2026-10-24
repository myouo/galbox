# M3-01 验收

日期：2026-10-25，cwd `/home/myo/Desktop/galbox-sdk`。基线为 `7d463b3`；本轮源文件摘要见 source-manifest.json。

实现：codec 组合工厂、冻结注册、extension.invoke、每调用 SavedInvocation、原子 initialize/reduce/actions/effects、signal wait/resume、完整调用迁移与 Player 接入。约束及 API 见 ../../OPERATIONS.md、ADR-0003。

实际命令均退出 0（环境 TMPDIR=/dev/shm、GALBOX_EVIDENCE_DIR=docs/evidence/m3-01）：

- `pnpm check`：Schema 生成一致性、真实主包/应用和工厂类型正反例、无 DOM/Node headless、导入边界。
- `pnpm test --reporter=default --reporter=json --outputFile=docs/evidence/m3-01/unit-results.json`：5 文件、34 测试，无 skip。
- `pnpm test:browser`：实际构建静态目录；13 个真实 Chromium 回归测试，无 skip/retry。
- `pnpm test:consumer`：tarball 在仓库外安装；skipLibCheck=false；公共工厂 v1 保存等待→v2 完整迁移的 Node 断言通过；浏览器 Player 自定义操作、保存/恢复、旧 attempt 拒绝及未重复初始化通过。

原始结果：check.log、unit.log/JSON、browser.log/JSON、consumer.log/result.json。同机 Node 24.15.0、pnpm 11.28.5、TS 5.9.3、Chromium 156.0.8078.4；软件 WebGL，无人耳/真机认证。未执行远程 CI、推送或发布。

覆盖 C01/C09、T05/T23/T24：真实工厂拒绝错 args/state/resume、同形异 schema 与冲突身份；独立两调用状态；恢复不初始化；旧请求无效；reducer/initialize 抛错、非有限输出、非法动作以及部分已暂存音频效果全部回滚；外部保留输出再修改不污染状态。state-only 不能接纳新的 args/wait ABI，完整迁移后重验并继续得到指定结果。

实施中曾出现泛型 DeepReadonly 对递归 JSON 的编译展开问题：改用从 JsonValue 基元投影的递归只读接口，并保留品牌/元组反例。非有限数不再经 JSON.stringify 变成 null 后进入 state；输入预检现在有结构/大小界限。这些更改重新通过上述全部门槛，没有放宽 strict 或删除断言。

M0–M2 的旧报告只证明基线；本目录的全套回归是当前修改后的证据。SaveBridge/recipe/import 尚未实现，此报告不代表整个 M3 或真实 N/F 兼容通过。下一项 M3-02。
