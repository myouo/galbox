# ADR0062：静态函数预取与回放目录文字隔离

第一门按原场景函数与共享转场函数编译。balanced允许跟随已加载Program中的静态call/return，使用候选扫描栈而不执行参数、表达式或修改Core。最多512条、32层、16个资产；重复控制位置/栈停止。未知函数/条件/选择/扩展仍停止，不触发代码模块下载。正文续段按textId计作一页。

文本拆分增加extras目录的title/description，复用已存在title文本槽形状，槽址为extras:<id>:<field>。回放entry、解锁表达式、资产引用留在Program，绑定仍验证完整目录digest与槽身份。不扩大到任意变量/UI/表达式的隐式翻译。
