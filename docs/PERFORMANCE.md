# 性能测量与优化

H3-01按用户要求优先处理实际运行热点，状态见tasks.json，设计约束见ADR0031。保留唯一TypeScript Core、Web Host与原存储/恢复语义，不切换语言或引入第二解释器。

当前测量覆盖两组工作负载：

- `pnpm test:performance`：原创标准小说、三次活动创建/释放、真实WebGL/音频/IndexedDB。API与两帧时间分开，Core预算1/8/100的结果一致；不带CPU profiler。
- `pnpm profile:runtime`：Node的0/100/1000/10000条真实Core历史、视图/捕获/恢复/协调器与空flush；浏览器0/100/1000条历史×MemoryStore/真实IndexedDB×回溯开关，实际推进/提交/图文存档/恢复。浏览器矩阵使用Canvas/default DOM，开启CDP CPU采样，不能与无采样基准直接混算。

在同一环境、同一脚本和声明配置下保存before/after原始结果，再执行`pnpm test:performance:comparison`。比较脚本核验Node trace摘要、浏览器逻辑结果、版本和全部PNG字节一致，并检查长历史tick/IndexedDB推进及flush的相对改善。历史条目全部保留，不通过清空状态或跳过持久提交“提速”。路径由GALBOX_EVIDENCE_DIR/GALBOX_COMPARISON_DIR指定，临时文件使用TMPDIR=/dev/shm。

生产优化包括：

1. Core.view的校验只读投影按变更失效，返回深冻结数据。历史封存后共享，普通tick只重新处理活动字段，仍把历史精确计入原节点/深度/字符总预算。capture/外部恢复继续完整校验并私有化。
2. 工作profile、历史展示索引/签名和不可变重试批次只复用已隔离数据。旧视图不回写新状态；可变外部输入不参与只读缓存。
3. HistoryEntry/Record/Commit各边界只私有化一次；父Schema已验证的子树保留完成正文、身份、真实切点和容量检查。存储修订/authority/原子回执不变，重复ID内容仍须一致。
4. 默认DOM渲染器消费只读投影，用户自定义renderer仍有独立拷贝；脚本UI仅复制它所需的ui/wait。截图保留全部计算样式，只合并完全相同的声明。

Core.view可能返回同一对象，旧引用保持不变；其readonly在运行时也被深冻结。Core.capture仍是独立可写wire DTO，适合明确迁移/导出。未按只读契约修改view的JavaScript调用方将被拒绝；不能把视图当可变草稿。

已知边界：显式全量捕获/恢复与每次历史新增仍有随数据增长的工作；IndexedDB当前按命名空间保存/校验完整状态，较大事务仍有成本。10000条Core历史不是“任何10000条内容都能放进4MB命名空间”的承诺，所有相互独立的预算同时适用。性能数值只证明所测工作负载，不是60FPS、全设备、移动真机、所有自定义renderer或大作品认证。G7继续综合与规模验证。

W1-01/ADR0032继续处理长指令串和Web响应性：Core对私有Program建立地址索引，Player使用真正浏览器任务续跑与可取消启动，不再连续queueMicrotask；rAF在逻辑轮次执行中不积压tick。同步输入校验、Core构造及同步插件仍需单独衡量，不承诺任何输入下零长任务。

- `pnpm profile:web`：Node 1000/6000指令与预算1/8/100；浏览器原生禁用WebGL、Canvas、启动/运行长计算各3次，计时器/rAF从首个真实yield开始观测。before/after路径用GALBOX_EVIDENCE_DIR设置；`pnpm test:web-performance`核对脚本/环境/trace和响应门槛。不能以同一优化版本制造before。
- `pnpm profile:graphics`：生产Host固定61提交/960ms，WebGL/Canvas与burst/rAF；none/finish/readback逐一比较，等待+dispose与总成本均保留。GALBOX_GRAPHICS_EXPERIMENT=no-msaa只做测试实验，不修改生产默认。详见evidence/h3-02/REPORT.md；当前软件GPU的提交积压与释放长尾没有被消除。

现有性能脚本证明声明场景，不能把局部执行P95或微任务修复推广为“整个引擎达到绝对极限”。下一主要优化面是W1-02资源工作集和W1-03存储/程序规模，并以实际Web游玩首屏、卡顿、内存和可靠保存为标准。

W1-02加载策略用`pnpm profile:loading`和`pnpm test:loading-performance`复现，说明见LOADING及evidence/w1-02。18图/每HTTP响应60ms/阅读停留150ms/显式并发3/16MiB估算预算，before来自fe86769独立构建；四策略最终逻辑与真实存读档一致。计时不含SDK模块冷加载，每配置一次观测，不称P95。报告分别显示createPlayer、start、推进、实际请求和纹理估算，不能只挑首屏速度掩盖按需/章节后移的等待。缓存工作集估算不等于整个浏览器heap；持久离线与模块规模仍另验。

W1-03A增加`pnpm profile:storage`及`pnpm test:storage-performance`：真实Core快照、IndexedDB 0/16/48槽位，get/put逻辑字符量与时间分列。相同snapshot/profile/head与同driver验证；热操作不读写冷槽位/历史。探针增加序列化开销，不能当无探针玩家延迟。当前热head/profile/回执及4M预算仍是后续边界，见STORAGE和evidence/w1-03a。

H3-03/ADR0068：Player复用不可变release、preferences、slot与integrity视图，仅在来源替换时失效。Core投影以值比较复用未变化且冻结的分支，仍执行Schema与完整wire预算，不改变可写capture或外部输入校验。舞台事务保留封存历史，隔离复制可变舞台；Pixi仅在对象/父子关系/组成员变化时重挂显示树。数值结论以evidence/h3-03/REPORT.md的真实采样为准；64MiB驻留估算不等于浏览器总内存。
