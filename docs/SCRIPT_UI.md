# 剧本 UI 控件

G6-01有限支持集，ADR0029；实际验收状态见tasks.json。SDK提供控件状态/输入/保存恢复与Web DOM绘制，作品声明屏幕、资源、布局和分支。默认系统菜单仍使用React。新章节 `/?demo=ui`，可加`&renderer=canvas`。

```ts
const name = uiInput('name', '旅人', {
  text: '署名', maxLength: 24, rect: {x:100,y:200,width:700,height:70}
});
const ok = uiButton('ok', {
  text: '确认', rect: {x:100,y:400,width:300,height:70}
});
const screen = uiScreen('letter', '回信', [name, ok]);
builder.ui(uiCatalog('screens', 'v1', [screen]));
// author:string 与 result:string 是已声明的真实Variable。
showUI('show', screen);
waitUI('wait', screen, result,
  [{control:ok, target:'next'}], [uiField(name, author)]);
hideUI('next');
```

这些工厂位于port-kit；UIControl/UICatalog/UIState/UIWait/UIAction/UIEvent及parse函数位于protocol。uiLabel、uiImage、uiButton、uiToggle、uiRange、uiInput返回真实不透明控件引用；uiField把toggle/range/input分别关联bool/i32/string槽。工厂核验引用来源与屏幕成员，链接再次校验kind、重复身份/目标/字段写入、作用域、图片资源和范围，不依赖类型品牌保护外部JSON。

目录1–16屏，每屏1–64控件，一次一个活动屏幕，逻辑1280×720；声明最多262144 JSON字符，每屏图片目标RGBA估计至多16MiB。颜色仅#RRGGBB、字号12–48，静态矩形/背景；不执行任意HTML、JS或CSS。图片来自Host已经私有化/校验的资源，生成本实例DOM用PNG，不将URL写入快照；此额外估计不是浏览器总RAM认证。

ui.show每次按声明重新初始化全部控件并产生新generation；ui.hide移除当前屏幕。ui.text/visible/enabled以及ui.toggle/range/input用类型化纯表达式更新当前屏幕属性；公开工厂分别为setUIText/setUIVisible/setUIEnabled/setUIToggle/setUIRange/setUIInput。值求值/范围失败不部分改控件。range为有限整数格点（min<max、step整除跨度），input为有界单行字符串（最多256 UTF-16代码单元，作品可声明更小上限，不接收换行/NUL）。其它程序/资源/存储预算仍适用。

ui.wait只接受当前活动屏幕，声明按钮ID→当前函数内地址及字段→槽映射。编辑期间值只属于UIState；按绑定按钮时统一复制字段与按钮ID，然后Core改变控制流。字段即使隐藏仍可作为声明的提交数据；隐藏/禁用控件不接收编辑或点击。至少有一个可见启用的绑定按钮，防止无合法继续路径。没有第二剧情线程、任意回调或偷偷写玩家设置；标准脚本继续后可自行用条件/赋值/已有系统指令处理值。

Snapshot.ui绑定完整目录、图片资源及UI指令，保存当前屏幕、show来源/generation、全部控件和ui.wait continuation。Core是唯一权威；控件没有保存在React组件或DOM中作为另一份剧情状态。等待开始为prepared，真实DOM准备/图片解码后activate；恢复保留值和调用帧，更新attempt、再次prepared，不重放show。其它剧情等待时控件可见但只读。UI等待不会被Auto/Skip或RestoreRecipe猜过。

Player公开activateUI(prompt,attempt,generation,epoch)和uiAction(action,prompt,attempt,generation,epoch)，后者生成输入ID并进入原Coordinator；低层Core使用完整UIEvent。uiAction的type决定value类型，Core还核对目标控件kind/范围。epoch/prompt/attempt/generation都参与裁决；旧身份/重复输入不能推进，非法事件失败不破坏原值。默认DOM对按钮指针/键盘分别保留按下身份，并在等待变化、读档或暂停时替换旧控件节点，旧DOM/IME完成回调不能改写新页面。

IME组合期间是设备草稿；compositionend才提交Core，保存/图像捕获采用最后已确认值。焦点、光标位置、按住键、未提交IME不入档。Player.dispose取消就绪工作并释放本实例DOM、ResizeObserver和图像；其它Player不受影响。自定义嵌入不需要React也会获得生产DOM控件；低层Core可由嵌入方自行绘制并提交同样的UIEvent。

现有自动槽触发仍限正文/普通选项；表单用显式手动/快速保存，不在每次编辑时自动落槽。

图文保存仍在同一Core捕获屏障内复制舞台/DOM正文/脚本UI，原生输入值和已验证PNG嵌入SVG后合成320×180缩略图。超出捕获大小或设备失败明确拒绝，不能省略UI后报告成功。UI设备绘制失败时暂停并显示UI_RENDER_FAILED，可保存逻辑状态后重建Player恢复；无法完整绘制时图文保存拒绝SAVE_CAPTURE_UI。资源/主线存档不因UI绘制失败而删除。

跨发行版或目录/UI指令变化要显式完整迁移所有当前/上一修订/历史快照；uiFingerprint用于获得目标身份，但不能只替换摘要掩盖控件/等待/字段ABI变化。备份沿原有原子Store恢复为独立分支，旧槽保留。存档中没有浏览器节点、字体对象、临时URI或JS回调。

当前不提供屏幕堆栈、拖放/画布任意命中、多行编辑器、任意CSS/HTML、响应式约束布局或可视化编辑器。完整默认界面/作品皮肤/移动布局由G6-02继续，原创综合规模与跨模块压力由G7验证，不能把本任务当所有GalGame UI已齐备。
