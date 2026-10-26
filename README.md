# galbox-sdk

强类型、可嵌入的视觉小说 Web SDK。已有 M0–M5 有限 alpha 底座；完整常用 GalGame 功能正在按 G0–G7 建设：同一正式 TypeScript Core 驱动原创《灯塔来信》，使用同一 Pixi 舞台（WebGL2 优先、Canvas 兼容后备）、DOM 正文、React 默认 UI、Web Audio 与 IndexedDB。

《水仙》《海市蜃楼之馆》的真实资料仍缺，当前不声明商业作品兼容。完整任务状态见 [tasks.json](docs/tasks.json)，当前摘要见 [STATUS](docs/STATUS.md)，范围见 [能力表](docs/CAPABILITIES.md)。

## 运行

Node >=22.12，pnpm 11.28.5。依赖版本已固定。

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
```

打开 `http://127.0.0.1:4173`。开始阅读后，一次输入显完、下一次推进；走完海岸或灯塔路线。菜单提供保存、读档、历史、音量与重新开始。普通已读和结局解锁自动持久；刷新后可读取快速存档。失焦清除瞬态快进；菜单、用户暂停和隐藏状态分别管理。

本次环境的 `/tmp` 配额已满，运行需要临时文件的命令前使用 `export TMPDIR=/dev/shm`。这不影响项目目录写入，不要求清理其他项目。普通环境无需此设置。

## 构建与验证

```bash
pnpm check           # 生成一致性、主包/应用严格类型、无 DOM/Node headless 编译、导入边界
pnpm test            # 生产 Core/协调器、Schema/链接/恢复负例、提交和激活故障
pnpm test:browser    # 构建静态应用/独立测试 harness，再运行真实 Chromium 集成
pnpm test:consumer   # tarball、仓库外临时安装、公开声明检查、独立浏览器播放/保存恢复
pnpm build           # SDK ESM/声明与 apps/playground/dist 静态目录
```

`pnpm fixture` 从原创 Builder 输入重新生成素材和 Program；`pnpm generate` 更新 Schema 生成物。`check:generated` 是只读漂移检查。`pnpm dev` 会先构建 SDK，不使用源码路径别名伪装公开包消费。静态产物可由任意 HTTP 静态服务器提供；本地预览用 `pnpm exec vite preview --config apps/playground/vite.config.ts --host 127.0.0.1`。

## 嵌入

公开入口：`galbox-sdk` / `player`、`protocol`、`core`、`port-kit`、`react`、`testing`。React 是可选 peer，headless 入口不加载 Pixi/React/DOM。

```ts
import { createPlayer, createHttpProvider } from 'galbox-sdk/player';
const program: unknown = await (await fetch('./program.json')).json();
const player = await createPlayer({
  program, provider: createHttpProvider(program, new URL('./', location.href).href),
  mount, saveCompatibilitySeries: '1',
});
await player.start(); // 由用户动作调用，满足浏览器声音策略
const view = player.getSnapshot();
const wait = view.core?.run.wait;
if (wait?.kind === 'text') await player.step(wait.prompt, view.epoch);
await player.save('quick');
await player.load('quick');
player.dispose();
```

默认 UI 使用 `DefaultUI` / `usePlayer`，并导入 `galbox-sdk/react/style.css`。在 `.galbox-player` 容器内放置一个 `.stage` mount 和 `<DefaultUI player={player}/>`；正文 DOM 由 Host 管理。完整接入实例见 [playground](apps/playground/src/main.tsx)；只使用 tarball 的最小项目见 [consumer](tests/consumer/main.ts)。

内部快照接入当前持久 profile，不覆盖新的解锁。冲突不会自动合并非单调字段；`discardAndLoad` 是显式放弃当前未持久进度的入口。已提交存储操作不会因 dispose 被报告为无副作用取消。

初始能力与限制见 [CAPABILITIES](docs/CAPABILITIES.md)，细节决策见 [ADR-0002](docs/decisions/0002-m0-m2-semantics.md)。有状态扩展与迁移用法见 [OPERATIONS](docs/OPERATIONS.md)。后续从 `CODEX_CONTINUE.md` 和任务表推进 N/F 与 M6 的真实资料/兼容门槛，不将本检查点称作最终两作支持版。

合成来源工厂和不可变准备计划见 [SAVE_BRIDGE](docs/SAVE_BRIDGE.md)。`pnpm test:compatibility` 明确区分 synthetic 通过与真实 N/F 缺资料；导入、独立进度与每次加载的事务钩子已实现。菜单选择 fixtures/synthetic-saves/data 下的 slot.bin 和 global.json，先检查报告、提交，再显式载入。

标准项目 CLI 已提供 init/assets build/validate/dev/build/saves analyze/verify，见 [CLI](docs/CLI.md)。完整第三方扩展、调用迁移、自制来源与浏览器任务见 [DEVELOPER_WORKFLOW](docs/DEVELOPER_WORKFLOW.md)。

```bash
pnpm test:cli  # 仓库外安装两 tarball、严格类型、50 个真实命令及两个浏览器工作流
node packages/cli/dist/main.js init /path/to/new-story \
  --sdk-tarball artifacts/galbox-sdk-0.1.0.tgz \
  --cli-tarball artifacts/galbox-cli-0.1.0.tgz
```

CLI 的 dev 服务最后一次验证的发布数据；修改 story/resources 后运行 pnpm assets，更改登记后重启。工具不会把声明覆盖或 synthetic verify 当作真实 N/F 认证。

便携备份与显式内容迁移见 [BACKUPS](docs/BACKUPS.md)，默认菜单可下载备份并恢复到独立进度。

本地 alpha 范围、包摘要和 API 差异见 [ALPHA](docs/ALPHA.md)，实际平台和性能长尾见 [PLATFORMS](docs/PLATFORMS.md)。未执行真实 npm 发布、Git 推送或部署。

`pnpm test:performance` 记录当前参考环境的实际原始样本；`pnpm test:release` 真实编译 API 基线并重新 pack/publish dry-run，需要完整 Git 历史，不执行实际发布。

H1-01 绘制/销毁加固见 [证据](docs/evidence/h1-01/REPORT.md)：不重复绘制静态舞台，保留共享 Pixi 全局池，取消后的迟到 renderer 也清理；本机三次完整活动销毁为 111.6/230/119 ms，API/存档格式不变。

完整通用功能目标与 Core/Host/系统/UI/作品实例的边界见 [COMMON_VN](docs/COMMON_VN.md)。流程图、图文存档、富文本/文本框和剧本 UI 等仍在任务表中，实例可自写不等于 SDK 已支持；N/F 资料阻塞不阻塞这些通用能力。

G0-02 原创通用验证章节：[灯塔来信·值班簿](http://127.0.0.1:4173/?demo=expressions)，使用正式表达式/插值/RNG 与存档恢复；API 与支持边界见 [EXPRESSIONS](docs/EXPRESSIONS.md)。当前仍只启用 bool/i32/string，G0-03 浮点/集合和其它通用 G 项继续建设。

G1-02 通用播放系统：默认工具栏可开启自动阅读或按住已读快进；菜单可以配置等待、未读策略、实例按键、字号和背景透明度，导入导出 JSON 或恢复作品默认。Auto 等待真实 voice 结束并在选项处停止；读档从手动开始，玩家偏好独立保留。规则与公开 API 见 [PLAYBACK](docs/PLAYBACK.md)、[SETTINGS](docs/SETTINGS.md)。富文本/Ruby/NVL、图文存档、流程图/鉴赏和剧本 UI 仍按后续 G 任务建设。

G2-01 原创章节：[灯塔来信·信纸上的光](http://127.0.0.1:4173/?demo=text)。使用正式 `richText`/`richPage` 工厂表达 Ruby、样式、换行、速度/停顿和文字效果，Core/DOM/Auto/存档共用正文状态；API、恢复规则与有限支持范围见 [TEXT](docs/TEXT.md)。NVL/多文本框和声明式主题布局仍由 G2-02 接续。

G2-02 原创章节：[灯塔来信·双页值班簿](http://127.0.0.1:4173/?demo=layout)。正式 SDK 提供 ADV/NVL、多窗口、主题切换与清页、TrueType准备和可包装的正文 renderer 端口；窗口/历史/保存恢复及有限支持规则见 [TEXT_LAYOUT](docs/TEXT_LAYOUT.md)。完整通用能力继续按任务表推进。

G0-03 原创章节：[灯塔来信·补给簿](http://127.0.0.1:4173/?demo=data)。正式SDK计算并保存位模式f64、精确i64、有序列表/字典与普通profile；构造/算子、失败边界及完整迁移规则见 [DATA_VALUES](docs/DATA_VALUES.md)。完整舞台/媒体和其它通用G系统仍在后续任务中。

G3-01 原创章节：[灯塔来信·光影回信](http://127.0.0.1:4173/?demo=stage)。正式SDK承接二维变换/层级/相机/基础滤镜/转场/震动与并行任务，参数只求值一次，活动状态可保存恢复；支持集、冲突规则与限制见 [STAGE](docs/STAGE.md)。后续长媒体、图文存档、流程图等继续按任务表建设。

无 WebGL 的环境可直接自动使用基础 Canvas 模式，或打开 `http://127.0.0.1:4173/?renderer=canvas`；设备选项和已知效果边界见 [图像兼容性](docs/GRAPHICS.md)。Canvas 现支持有界滤镜与隔离转场；预算和模糊近似边界见图像兼容文档。

影片/矩形热点/活动期限原创章节位于 `/?demo=interactive`（可加 `&renderer=canvas`），API与保存边界见 [影片](docs/VIDEO.md)、[互动](docs/INTERACTIONS.md)。完整通用功能与真实两作仍以任务表为准。

版本化渐进媒体章节 `/?demo=streaming` 使用正式SDK与通用CLI/Vite Range服务；调用方显式接受URL版本等级，详见 [串流与完整性](docs/STREAMING.md)。完整SHA与版本地址不混用，慢速HTTP渐进证据单独记录。

G4-01 图文存档使用正式 SDK 的同切点舞台+DOM 正文捕获、原子回执、上一修订和手动/自动/快速槽；默认菜单可管理图片、命名和确认覆盖/删除。示例 `/?demo=layout&autoSave=1`，支持 `&renderer=canvas`；API/策略/故障边界见 [存档系统](docs/SAVES.md)。

历史语音与有界受控回溯见 [HISTORY](docs/HISTORY.md)：原创 `/?demo=history` 使用正式SDK保存确认切点、独立回放与当前profile激活，默认界面提供回溯确认；支持Canvas。实际任务/验证状态见任务表。

剧情流程图与声明章节入口见 [FLOWCHART](docs/FLOWCHART.md)：原创 `/?demo=flowchart` 提供访问/显式及条件解锁、章首重新初始化、当前profile校验与默认连线/筛选/确认界面，可加 `&renderer=canvas`。
