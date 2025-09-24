# Task

<import>

你的活动范围仅限于 ./ 之下，请务必不要超出此范围

</import>

您需要写一个 api server：

* 使用 python3，基于 fastapi 和 asyncio
* 用一个单文件写出来即可，不用拆文件，并且需要将所有功能封装成一个 class，class 命名为 ContestAPIServer
* 写入 ./xcpcio/ccs/contest_api_server.py 中
* 这个 APIServer 需要基于 fastapi 提供 swagger api docs，api docs 中的 response_model 请使用 ./xcpcio/ccs/model/__init__.py 中的东西
* 在本地有一个 contest package dir，你需要基于这个 dir，提供 contest api，但是 contest package api 需要作为一个配置项可配置，而不是写死
* contest package dir 的文件结构可以查阅 [Contest_Package.md][Contest_Package.md]
* contest api 的相关接口你可以查阅 [Contest_API.md][Contest_API.md]
* 本地的 contest package 你可以使用参考这个路径： ./output/2024hk
* 关于 [Contest_API.md][Contest_API.md] 中定义的那些数据结构，已经生成好了，你可以查阅 ./xcpcio/ccs/model/__init__.py，你可以直接使用

[Contest_Package.md]: ./ccs-specs/Contest_Package.md
[Contest_API.md]: ./ccs-specs/Contest_API.md
