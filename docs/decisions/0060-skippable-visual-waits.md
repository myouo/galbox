# ADR0060：显式可跳过视觉等待

task.join/wait.delay可选skippable，默认保持旧行为。只允许普通有限stage/animation组或delay；不能跳过音频/视频自然结束、粒子和无限motion。可跳过等待携带独立prompt/epoch，step/advance只完成当前等待成员，不给其它运动、音频包络、粒子或正文补时间。拒绝旧prompt、重复输入、非法成员；一次输入不能顺便推进下一段正文。

snapshot保存prompt并与源skippable声明、counter和组闭包核验。非skippable等待仍没有prompt，强制等待不变。Player键盘/滚轮/默认UI沿同一step路径，不开旁路。用于KAG wt/wait canskip=true；canskip=false和ws真实音频等待分别保持。

有限逐轴motion也允许组内跳过，结束在已验证的零偏移终点；循环motion仍拒绝。跳过只结束被等待的具体调用，不消耗其它任务的逻辑时间。
