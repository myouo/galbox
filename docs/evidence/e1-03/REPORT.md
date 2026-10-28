# E1-03：本轮用户授权的远程发布

2026-10-28。用户明确授权SDK推送myouo/galbox，独立实例推送myouo/morgana；随后要求morgana删除本地开发历史，并删除远程原LICENSE。实例目标是一个新根提交，使用已确认旧SHA的force-with-lease，仅替换main。旧main=9205fc35eb7f5d870363632a7486cb29f9131da4，原树只有LICENSE。

SDK保留开发历史。历史与索引联合扫描3046个blob/145092506字节无当前凭据命中，无真实游戏原包/解包KS/TJS；SDK原创fixture仍属测试。旧历史中存在早期生成物/原始验收日志，当前树及正式SDK包不包含这些产物，本轮未重写SDK历史。

实例索引88文件，其中16个PO为用户明确允许贡献的i18n文本。逐文件检查无private/public/generated/artifacts/vendor/dist/extracted/unpacked路径，无原包、KS/TJS、二进制媒体/字体、凭据或LICENSE。原作提取资料和原曲/图像只在本地ignored及授权R2专桶；新ignore和提交边界检查覆盖常见KRKR2格式。实例旧历史不会成为新根提交的祖先，也不推旧分支/tag。

实际已推送：SDK实现提交4cfa54fe6aa14246c816de3977ca4f7985c66dd0到myouo/galbox main，保留原历史。morgana提交ccdaf3758ac27bd3faab1f1a452f81a1090c95bc到myouo/morgana main，以精确force-with-lease替换9205fc35eb7f5d870363632a7486cb29f9131da4；GitHub API确认parents=[]、88个文件、16个PO、无LICENSE及原包/解包目录。没有推旧分支/tag。

实例本地旧feat分支已删除，FETCH_HEAD/remote更新后清除旧reflog并gc，git rev-list --all --count=1。两个工作区最终保持干净；SDK此后仅追加验收文档提交并正常快进推送，最终main SHA以git/远端为准。原始推送/校验记录留ignored artifacts，未将凭据写入命令参数或仓库。

最终新PO部署20线上回归通过；preview 52文件3964825解码字节与本地build相同，testsdk承担自动化限速/故障测试。任务验收I1-01A/B、W1-05、E1-03完成；I1父任务和F-01A整作仍在建设。
