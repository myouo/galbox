# ADR0068：逐帧对象复用与连续阅读加载

范围：复用已校验且引擎独占的静态 Player 数据、Core 只读投影的未变化分支，以及 Pixi 未变化的父子关系。不改变 Snapshot/wire/存档 ABI。未知输入仍走原 schema、descriptor、预算、规范化与链接检查；内部投影仍执行生成的 Snapshot validator 和完整 wire 预算。旧视图必须冻结且不能被后续运行修改，缓存只保留上一投影及弱引用，不累计历史帧。

资源准备期间只冻结剧情提交、逻辑时钟和输入，已有媒体默认继续；显式 resourceAudio=pause 保留需要同步冻结的作品选择。用户/device/background/gallery 等暂停仍按原约定生效。资源等待不伪造媒体结束，不提前提交候选效果；真实结束回调继续串行排队，存档仍拒绝未提交切点。

balanced 在当前窗口滚动时先接续新窗口再取消旧窗口；普通前台准备不清空所有未来预取。只保留预算内的声明资源，进入新 epoch/取消/销毁必须释放。静态 lookahead 索引只缓存引擎独占 Program；模块函数变化须重建。分支不猜用户选择。快速点击、前台优先、取消、预算淘汰、音乐时间连续与长时间内存需要真实浏览器验收。

舞台原子候选只复用已封存 history；stage/tasks/scene/counter 等仍隔离复制并执行原 schema 与语义检查。复用前缓存完整 history footprint，输入/输出均将其计入聚合节点、深度、字符预算，不以清空 history 绕过存档预算。只有只写舞台的内部事务使用此路径；通用 reducer/迁移/未知输入不使用。

Canvas只写back buffer不强制willReadFrequently。经实际像素探测支持时，brightness/grayscale走原生Canvas filter（先灰度后亮度，保持现有矩阵顺序），复用已有color workspace的预算为单个scratch surface；不新增预算额度。功能缺失/探测不符仍用CPU逐像素路径，CPU读回失败仍终止设备且保留旧输出。原生滤镜保留Alpha/组隔离、嵌套与CPU后备像素对照。依据MDN CanvasRenderingContext2D.filter及HTMLCanvasElement.getContext，2026-10-29核对。

DOM正文分层时，Canvas下层从同一Pixi离屏提交直接写入已有下层输出canvas，避免经上层canvas中转；上层画面按可见子树/相机/滤镜/overlay/mix缓存，视频仍每帧绘制。两路输出没有增加canvas或renderer。源状态变化、epoch、截图和显式invalidate仍失效；失败前不覆盖上一提交输出。WebGL保持原路径。
