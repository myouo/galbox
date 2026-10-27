# Steam KRKR2 独立迁移的资料与边界

2026-10-27。用户提供本地安装目录并要求：独立实例安装SDK包、尽可能还原原作表现、游戏内不出现实验/诊断/SDK工具栏，以及以KAG/KRKR2脚本组织为主线、不逆向exe。

独立工程/home/myo/Desktop/galbox-fata-morgana，有独立Git和file tarball依赖，无workspace路径/SDK私有源码导入。SDK仓库只有通用旁白修复与短元数据报告，游戏脚本/资源/构建载荷全部留在独立工程ignored private/public/artifacts。

Steam app303310/build21523397，9个XP3（共享+8语言）6284条文件，804311540字节已按公开XP3分段/raw/zlib格式读取，长度与Adler32均通过，源包SHA复验不变。原始槽位/global与加载后继续参照仍缺，F-01未解除全部资料门槛，F-02未开始。

已按真实脚本梳理startup→Initialize（KAG3.26/语言包和资源搜索）→first（宏/插件）→title→scenario。Config与MessageLayer的参数组合决定真实坐标，例如title locate x535还要加marginL70。正文由jinobun/gray/draw_name/c等项目宏组成；不是任意标签直接映射一个SDK opcode。不同语言系统代码/菜单/字库也不同，源码有独立与重复标签，不能按行配对翻译。

当前严格转换连续22页旁白，每语言生产Core逐页与2次protobuf恢复，共176页；这一段22个GUID八语言一致，只证明该切片。当前各语言9文件的重复参数等语法被严格前端拒绝，不是全KAG支持，也不是原作损坏认证。

用户纠正后，已去除旧prototype所有额外页面说明、诊断、语言下拉、SDK工具栏与自造结束提示，使用原标题背景/菜单图、4:3画幅和源字体/位置/颜色参数。源标题仅开始按钮已接通；其余菜单动作、OP44转场/原音轨、页内[l]、中日.tft字形与后续章节尚未还原，F-01A保持进行中。i18n仍是按语言独立发布/存档；SDK locale设置/翻译目录与跨语言已读继承I1-01未完成。

独立测试：3个Python提取器故障边界与6个TS词法/转换边界；strict/skipLibCheck=false的实包消费；最新纯原作UI有3真实浏览器测试，覆盖8语言、原图标题/4:3/无额外UI、Canvas原生禁用WebGL、保存缩略图/刷新/双语言独立保存与22页结束。初次截图发现正文缺position:absolute跑到顶部，已修正并加入相对位置断言和目视复验；旧实验UI证据不作为新UI通过依据。字体裁剪逐字检查，俄文最初缺37字，改原Config的Merriweather，西文改Libre Baskerville。

曾仅运行隔离exe副本尝试画面对照，没有反汇编或修改exe；未得到可用画面，按用户要求停止该进程及独立prefix。没有用黑屏或静态素材合成冒充运行原作的对照证据。

详细组织与复跑命令在独立工程docs/ARCHITECTURE.md、README.md、STATUS.md；实际日志/包SHA/截图在其artifacts。该报告不是完整游戏/原版存档/像素一致认证。下一步以KAG AST、宏依赖、参数与调用语义继续，而不是继续exe方向。

独立开发模式曾在默认扫描期间OOM，限制入口/排除提取与临时目录监视后真实dev浏览器通过，原始资料/日志/依赖包HTTP拒绝403；证据位于独立artifacts/dev-result.yaml。该配置修复不改变SDK包或剧情。
