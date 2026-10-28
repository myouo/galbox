# E1-03：本轮用户授权的远程发布

2026-10-28。用户明确授权SDK推送myouo/galbox，独立实例推送myouo/morgana；随后要求morgana删除本地开发历史，并删除远程原LICENSE。实例目标是一个新根提交，使用已确认旧SHA的force-with-lease，仅替换main。旧main=9205fc35eb7f5d870363632a7486cb29f9131da4，原树只有LICENSE。

SDK保留开发历史。历史与索引联合扫描3046个blob/145092506字节无当前凭据命中，无真实游戏原包/解包KS/TJS；SDK原创fixture仍属测试。旧历史中存在早期生成物/原始验收日志，当前树及正式SDK包不包含这些产物，本轮未重写SDK历史。

实例索引88文件，其中16个PO为用户明确允许贡献的i18n文本。逐文件检查无private/public/generated/artifacts/vendor/dist/extracted/unpacked路径，无原包、KS/TJS、二进制媒体/字体、凭据或LICENSE。原作提取资料和原曲/图像只在本地ignored及授权R2专桶；新ignore和提交边界检查覆盖常见KRKR2格式。实例旧历史不会成为新根提交的祖先，也不推旧分支/tag。

两个remote均已配置，发布前检查与新PO/双域名验证已准备。推送及远端SHA最终核对待执行，不提前宣告完成。
