# 默认游戏界面与作品皮肤

G6-02有限支持集，ADR0030；实际验收状态见tasks.json。`DefaultUI`在Program声明presentation时使用完整`GameUI`，没有声明的既有作品保留经典布局。已配置作品也可直接使用公开`GameUI`；未配置时该组件明确提示配置要求，不在标题背后启动一个不可见故事。新CLI模板声明默认皮肤，作品无需自写系统状态机。

```ts
builder.presentation(gamePresentation({
  id: 'paper', revision: 'v1',
  palette: {background:'#f3eee2',surface:'#fffaf0',text:'#253f46',
    muted:'#50666b',accent:'#b0673d',border:'#9aaca8'},
  radius: 4, fontSize: 16,
  title: {background:coverImage,logo:letterImage,subtitle:'把远方折进信纸。'},
  font: {family:'serif',asset:interfaceFont},
  labels: {start:'开始阅读'},
  toolbar: ['menu','history','auto','quick-save','skip']
}));
```

工厂在port-kit，GamePresentation/Palette/Labels、SystemScreen和parser来自protocol；Player API来自player，DefaultUI/GameUI与独立系统面板来自react。实际工厂关联image/font引用，链接器再次核验资源kind；颜色只允许#RRGGBB，字号14–22、圆角0–24，文本有界，工具栏1–6项、必须包含menu且不重复。任意CSS/HTML/URL/JS、任意动作名均不进入配置。

完整页面包括标题、系统菜单、保存、读取、历史、设置、流程图、鉴赏和数据管理。保存/读取提供6卡分页和种类筛选，覆盖/删除需确认；菜单保留明确的放弃未提交进度后读快速档，以及无图快速保存恢复入口；历史回溯、节点重入和鉴赏使用已有生产组件。数据页提供便携备份、已登记原档导入、独立进度选择。未声明流程图/鉴赏的作品不显示对应入口，直接请求也明确拒绝。

PlayerView.presentation为私有化后冻结的只读配置，systemScreen是Player的临时系统页面。`await player.showSystemScreen('settings')`等API只管理页面及menu暂停，不推进PC。返回标题保留当前运行，继续阅读恢复它；重新开始有默认确认。成功激活才自动回到故事，准备失败仍保原页面/运行。系统页面不写Snapshot/Profile，旧档不会回写旧皮肤或用户偏好。

切换页面先关闭本实例鉴赏和历史试听。导航代次包括兼容setMenu的迟到关闭；过期结果不能覆盖后来页面。鉴赏关闭无法核验head时仍冻结并显示错误，不假报导航完成。GameUI按Player实例隔离本地组件状态和异步消息；替换Player时旧设置写入只能落原Store，不能污染新界面。其它Player不被本实例菜单暂停。

标题背景/logo由Host已验证图像生成有界PNG并缓存，最大1280×720/480×180；旧prepare阶段的临时Blob URL不会被当作新图像地址。字体使用已准备font资源及声明的系统fallback，装饰图像不可用有明确提示，图像节点/缓存随所有者清理。没有新增Pixi舞台。仅改变presentation且执行定义/资源目录不变时，原剧情快照可继续；增删资源、改变UI/剧情定义仍遵守既有迁移规则。

分屏页面在小视口/横屏矮视口使用带安全区间距的viewport对话框、独立滚动内容和横向导航。主要操作目标至少44px，标题内容可滚动。Tab限制在当前页面或最内层确认框，Escape或配置的菜单按键取消确认/返回故事（编辑字段中的普通字符保留，Enter/Space优先激活按钮，重复按下不再次关闭），退出后恢复仍有效的原焦点；不通过全局focus监听争抢另一实例。系统对话框中的按键不会触发背后剧情热键。

生产PressGesture供正文/选项/互动/回放和脚本按钮共同使用：主指针ID、按下语义身份、12px移动阈值和释放命中共同裁决；滚动/取消/跨控件释放不提交。键盘按下和释放配对，repeat不制造新操作。原生字段保留浏览器/IME规则；异步设置写入期间不禁用正在拖动的滑条，状态提示等最终提交后更新。

在标准DOM结构（`.galbox-player`直接包含`.stage`与DefaultUI）中，声明presentation的主故事表单在窄视口按控件声明顺序重排并展开到视口。嵌入/回放表单保持其容器内滚动，其他画面保持既有逻辑画幅。适配是Web显示规则，不修改Snapshot内的作者矩形或控件值。横竖屏重新布局，不重置表单。主表单纵向截图按比例容纳到320×180（两侧留黑），保留完整可见界面；不把纵向画面截成16:9后声称完整。TextCapture可选择fit:'contain'，未声明时保留原有正文捕获规则。

默认界面皮肤独立于作者声明的正文窗口/TextTheme和脚本控件样式；不会把旧存档中的逻辑UI颜色偷偷改写为当前系统皮肤。工具栏/标题资源、系统页面由同一配置控制；要替换更复杂外观，可消费公开Player和系统面板。配置标签覆盖导航/标题入口与工具栏，系统面板说明和错误信息当前为中文；其它本地化可替换公开组件。当前不含任意菜单脚本、标题影片/音乐策略、任意HTML布局或可视化皮肤编辑器。

原创 `/?demo=interface` 与 `&skin=paper` 只变配置，复用同一剧情、资源目录、鉴赏、流程图和表单；可加`&renderer=canvas`。触控模拟覆盖窄/矮视口、滚动、拖动取消和键盘焦点，不替代移动真机/Firefox/Safari认证。综合规模、性能归因与真实两作仍见G7/N/F/M6。


ADR0071/0072：已读速度与行内确认由 text.readIntervalMs（-1继承）、skipInlineConfirmations、readSkipInlineConfirmations 指定；richText.confirm({skippable:false})保持强制确认。普通跳确认开关也作用于已读段，页末仍需输入。偏好持久化，不回写旧档；HistoryText（react公开出口）静态展示字号/斜体/颜色/Ruby，支持历史指定调色板与respectRevealed。

隐藏正文时，dialoguePresentation 的 source 是 Program 图片；hidden 可从可选独立 PresentationAssetCatalog 引用。通过 protocol.parsePresentationAssetCatalog 构造version:1、assets与resources，分别传给 createPlayer({presentationAssets,...}) 和 createHttpProvider(program, base, {presentationAssets})。图片目录最多128项、不允许覆盖Program ID，实际摘要/尺寸/资源预算和取消由同一Host校验；不进入release/profile/stream catalog，不改变既有剧情存档身份。隐藏时首次step只恢复正文，保存仍捕获权威舞台；临时变体释放租约后按同一闲时策略回收，eager仍保留其全部剧情资源。
