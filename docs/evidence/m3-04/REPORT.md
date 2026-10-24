# M3-04：事务导入与显式激活

2026-10-25，cwd `/home/myo/Desktop/galbox-sdk`；实现基线 06e4077。最终相关源码摘要见 source-manifest.json，测试结论以本目录最新日志/JSON 为准。

## 可观察行为

- 原档准备只产出受控计划；导入提交原子创建独立 profile、槽位、规则/来源报告与幂等回执，不更换当前 head。必须另外 load 才接管。
- 当前 profile 的 dirty 在最终屏障交接；之后重新读取目标 profile 并执行 recipe。没有把旧预演改 revision 后冒充最新候选。
- 来源 syntheticLoadCount=4：预演/提交后仍 4；load 后 5；同一 pending 恢复仍 5；新 load 后 6。已保存的导入运行继续 onLoad hook，刷新后不会重置到原 global.json，也不会强制切回旧背景。
- 语义 activation id 与物理 owner token 分开，claim 增加资格 sequence；旧 owner 的确认/写入失败，已被取代的 pending 不会复活。提交回包丢失先核验 durable head；无法核验时 commit-unknown 且旧 Core 不恢复。
- 默认 UI 通过公开 Player API 选择来源文件、检查报告、提交、显式载入；槽位选择器标明网页/独立导入进度。Lighthouse 合成来源在作品接入层配置，Core 没有 gameId 分支。

## 实际验证

环境：Node 24.15.0、pnpm 11.28.5、TS 5.9.3、Playwright Chromium 156.0.8078.4，Linux 软件 WebGL。命令使用 TMPDIR=/dev/shm、GALBOX_EVIDENCE_DIR=docs/evidence/m3-04；不存在远程发布或 CI 运行声明。

- `pnpm install --frozen-lockfile`：退出 0，依赖未漂移。
- `pnpm check`：退出 0；新 wire DTO/validator、全部真实工厂类型反例、headless 独立编译与 import 边界通过。
- `pnpm test --reporter=default --reporter=json --outputFile=docs/evidence/m3-04/unit-results.json`：8 文件、50 测试通过，无 skip。
- `pnpm test:compatibility`：4 个 synthetic 场景组通过，N/F 独立报告 needs-input，没有将缺资料计为兼容。
- `pnpm test:browser`：静态构建与 19 个真实浏览器测试全部通过（无 skip/retry），见 browser-results.json。包含真实文件选择/IndexedDB/刷新、独立 profile、保存后的 hook、两作 namespace、资源/媒体、迟到文件读取与加载世代。
- `pnpm test:consumer`：隔离目录安装 tarball、skipLibCheck=false；公共工厂登记扩展/完整迁移/自定义来源；实际浏览器完成导入提交、载入 4→5、内部保存再载入 5→6。
- `pnpm dev` + 实际浏览器访问：HTTP 200，导入面板和激活图片在本目录，dev-result.json 记录独立 profile 与路线选择位置；截图不替代语义断言。

## 关联验收与约束

C06/C07/C08、T18/T19/T21：真实 DB 的 old main 数据不被导入覆写；新分支与槽位同事务；提交相同 ID 不重复建档；跨 profile 覆盖拒绝；profile 增量/候选/head 原子提交；回包丢失按同一计划/ID 重试。

控制故障端口模拟 import/activation 的已提交回包丢失；真实 IndexedDB 执行写入。pending claim 不重新执行 recipe，明确的新 load 才执行下一次。晚 A confirm 在 B 后被拒绝。原测试改为区分语义激活与 owner 恢复，仍保留 profile 副作用不重复、旧候选不复活与重启断言。

最终交接测试在加载准备期间通过真实 Core 将旧工作 count 从 5 改成 15，随后候选基于最新 durable 15 得到 16；预演不回写旧 profile。慢 File.arrayBuffer 的旧准备结果不能清除新计划。旧 M2 行不含分支/metadata 时保留为 main，恢复保留当前 durable profile。

新增 schema 校验防止非法 progress（例如 read unit 为数字）写坏数据；存储 magic key 拒绝。错误/未实现存储能力给出稳定诊断，无固定成功或 skip。媒体启动失败在默认 UI 提供可用重试按钮，菜单暂停时不显示误导性的启用声音动作。

最后一轮曾在 end 的最后异步回执前刷新，只观察到 8/9 页持久已读。现严格按 fixture 规定等待 dirty 清零后刷新，继续断言 9 页；结局 UI 显示提交中/已提交。失败原始日志保留为 browser-failure-flush.log，没有删断言或 skip。

## 范围

只认证公开原创 fixture-save@1 和消费者自制格式；N/F 仍缺 edition、可用资源/行为、原档附件和原作继续参照。未提供原版导出、便携备份、跨内容版本迁移、CLI 或移动真机/其他浏览器/性能预算。原始附件归档由后续阶段承接，当前保存完整标准恢复状态/规则与来源摘要。体积提示未屏蔽，资源整包预加载/长期回执留存的规模优化仍归 M5。
