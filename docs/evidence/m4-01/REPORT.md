# M4-01：真实 CLI 与标准模板

2026-10-25；cwd `/home/myo/Desktop/galbox-sdk`；基线 b4e1851。相关源摘要在 source-manifest.json。Node 24.15.0、pnpm 11.28.5、TS 5.9.3、Vite 8.3.5；TMPDIR=/dev/shm。

实现 @galbox/cli 的 init/validate/assets build/dev/build，有限 ProjectConfig Schema → TS/standalone validator，标准 Builder/port/React 项目。SDK 提供受控 PortRegistration；Core 不导入 Node/Vite/CLI。

实际验证：

- pnpm check 退出 0：SDK/CLI 严格编译、生成一致性、headless/导入边界。
- pnpm test（JSON reporter）退出 0：51 单元测试，无 skip。
- pnpm test:cli 退出 0：仓库外含空格目录安装 SDK 与 CLI 两个 tarball，执行 16 个真实命令；初次/frozen 安装、资源发布、checkJs+TSX 严格类型、静态构建、HTTP dev 服务、实际浏览器播放/保存/刷新恢复均通过。
- 反例：init 非空目录、未知命令、错误命令选项、被篡改资源摘要、路径逃逸均真实失败；错误资源也阻断 build。

原始命令及退出码/stdout/stderr 在 commands.json；结果/安装 realpath/两 tarball SHA-256 在 result.json；实际截图 template.png。安装路径在 /dev/shm/galbox-cli-*，不是 workspace alias。两个已验证本地包保留 artifacts/。

初次独立安装暴露 pnpm 11 不再读取 package.json 的 pnpm.overrides，改为项目 pnpm-workspace.yaml，并取消 ignore-workspace。ESM-only exports 不能经 require 条件解析；现从项目直接安装的 SDK 显式公共 ESM exports 加载，保留工厂身份域。依据见 CLI.md。未放宽 strict、未绕过工厂。

validate 不修改发布数据；assets build 显式生成/校验后原子更新；build 不默许错摘要，也不清理未标记的非空 dist。init 先在自己创建的 staging 构造后原子发布，不覆盖现有文件。

这不是远程 CI/npm 发布或原作兼容认证；dev 当前服务已发布数据，源/资源更改后运行 assets，登记更改后重启。M4-02 诊断/必要行为清单、M4-03 完整独立开发任务尚未由此报告计为完成。
