# 榜单集成

我们提供榜单托管服务以及比赛期间的榜单同步服务。

## DOMjudge

如果你们将 DOMjudge 的 scoreboard 放置在公网环境中，我们这边可以直接爬取 HTML 进行解析，但是会存在一些缺点：

- 无法拿到正确的 submissions，只能通过 scoreboard 中的数据 fake 出来

我们更建议你们使用 [dump-to-xcpcio][dump-to-xcpcio]，在比赛中，
将 DOMjudge 的相关数据推送给我们，如果采用这种方式，需要提前 [联系我们](#contact-us) 申请 token，
并且我们强烈建议你们在热身赛时进行榜单同步，观测该脚本对服务器的影响，以防止正式赛时出现问题，该方案有如下优点：

- 无需公网 IP，办赛方可以不需要将 DOMjudge 的榜单防止在公网的环境中，只需要有访问公网的能力，将 DOMjudge 的部分数据推送到 xcpcio 的服务器中即可。
- 可以获取更加精确的数据，比如 submissions 不再需要 fake。
- 对服务器压力较低，该脚本每 5s 会请求若干个 DOMjudge 的 API，然后将数据推送到远端，无需担心外部流量访问

## 其它判题系统

如果使用的 OJ 未在上述列表中，请 [联系我们](#contact-us) 共同商讨榜单同步方案。

## 联系我们 {#contact-us}

- **Email**: <board@xcpcio.com>
- **GitHub Issues**: <https://github.com/xcpcio/xcpcio/issues>

[dump-to-xcpcio]: https://github.com/xcpcio/domjudge-utility/tree/main/cmd/dump-to-xcpcio
