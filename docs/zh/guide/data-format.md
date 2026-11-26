# 数据格式

Board 的配置分为三个文件：

- `config.json`
- `team.json`
- `run.json`

## config.json

- [配置生成脚本](https://github.com/XCPCIO/XCPCIO-Board-Spider/blob/main/generate-config/gen-config.py)
- 一场比赛所有的配置都在这个文件中，可以看看配置生成脚本来得知有哪些配置项。

## team.json

- 这个文件中存了所有队伍的信息。

```json
{
  "team_id": {
    "team_id": 1,
    "name": "队名",
    "organization": "组织名",
    "official": 1,
    "unofficial": 1,
    "girl": 1
  }
}
```

- `team_id` 可以是 string 也可以是 number。
- 其中，`official`, `unofficial`, `girl` 是比较通用的 group。
  - 如果设置了 `unofficial` 会有一个雪花标志。
  - 如果设置了 `girl`，会有一个女生标志。
  - 如果不是该组，不要将属性设成 0，直接不要有这个 key 即可。
- 如果有自定义 group 的需求，可以参考浙江省省赛的配置文件。

## run.json

- 这个文件中存了所有提交的信息。

```json
[
  {
    "team_id": 1,
    "problem_id": 0,
    "timestamp": 60,
    "status": "correct"
  }
]
```

- `timestamp` 以 s 为单位的相对时间：
  - 如果是 Domjudge 的榜单，它的时间戳是以 s 为单位的，但是在榜单中是以 min 为单位的。所以可能需要转换一下，比如 1min20s(timestamp=80) 应该转换成 1min(timestamp=60)。
  - 对于其它需要 s 为单位的榜单，虽然前段展示的是以 min 为单位的，但是实际的排名计算是以 s 为单位的。
- `status` 目前只支持三种状态：
  - `correct`
  - `incorrect`
  - `pending`
