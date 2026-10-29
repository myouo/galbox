# ADR0070：滚轮逐次动作与无引用资源释放

InputPreferences/PreferencesPatch.input 新增可选 wheelMode=gesture|step（protobuf 新 tag 8）。缺省 SDK 保持既有 gesture：一个连续手势最多消费一次阅读动作。作品可以声明 step 默认，每次累计到阈值的滚轮事件提交一次语义 step；同一尚未完成的动作期间不积压后续推进，返回仍绑定真实 prompt/epoch。缺失字段用作品默认，现有偏好和 Snapshot 无需重写；用户可以显式选择触控板 gesture 模式并持久保存。读档、焦点和菜单返回清空输入，step 模式保留 150 ms 防尾部误推进。修饰键、横向滚动、编辑器、可滚容器、嵌套根和其他 Player 继续隔离。

实例按源 MainWindow/HistoryLayer 处理菜单：历史上下滚、到底后间隔超过 150 ms 的再次下滚返回，不把返回手势用于阅读；存读档页滚轮循环翻页。DOM 输入只调用公开 Player，不推进 PC。配置、历史排版及右键隐藏其余范围仍分别验收。

AssetCache 增加仅删除 ready 且 refs=0 的有界 trim，保留当前前看资源集合。Host 在成功显示并释放旧帧引用/预取完成后延迟 2 秒启动，每批至多释放两个旧资源，后续批次交还事件循环；不取消 loading/queued、不清全局缓存、不动活动播放/候选/图文/鉴赏的租约。预取窗口改变重新取当前保护集合，销毁取消定时器；显式策略保留的 eager/chapter 资产仍受各自引用保护。再用资源走原摘要/版本校验和激活屏障，存档/profile 不变。

页面隐藏时仅释放本实例 Canvas 滤镜池、颜色 scratch 和 CPU blur 数组，保留可见输出与 back buffer；下次显示先按原预算重新分配并使分层绘制缓存失效。身份滤镜解除后销毁本实例不用的 filter 对象。不能用清除当前像素、活动任务、原存档或全局 Pixi 池换内存数字。浏览器内部/GPU 回收时机仍由设备决定。

验证：真实连续滚轮、手势惯性/返回尾部/读档、多实例；引用竞争、准备/取消和后续重载；Canvas 隐藏/恢复像素及保存；真实作品实际回收和驻留变化。原始资料留独立实例 ignored artifacts。
