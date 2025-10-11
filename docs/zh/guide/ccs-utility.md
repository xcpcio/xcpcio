<!-- markdownlint-disable MD024 -->

# CCS Utility

XCPCIO 提供了两个强大的 Python CLI 工具，用于处理 CCS（Contest Control System）比赛数据。

## 安装

```bash
pip install xcpcio
```

## ccs-archiver

将 CCS 比赛 API 数据归档为标准的比赛包格式。

### 基本用法

```bash
# 归档到目录
ccs-archiver --base-url https://api.example.com/api --contest-id contest123 -o ./output -u admin -p secret

# 归档为 ZIP 文件
ccs-archiver --base-url https://api.example.com/api --contest-id contest123 -o contest.zip --token abc123

# 归档为 tar.gz
ccs-archiver --base-url https://api.example.com/api --contest-id contest123 -o contest.tar.gz -u admin -p secret

# 归档为 tar.zst (Zstandard 压缩)
ccs-archiver --base-url https://api.example.com/api --contest-id contest123 -o contest.tar.zst -u admin -p secret
```

### 选项

| 选项               | 简写 | 描述                                               |
| ------------------ | ---- | -------------------------------------------------- |
| `--base-url`       |      | CCS API 的基础 URL (必需)                          |
| `--contest-id`     |      | 要归档的比赛 ID (必需)                             |
| `--output`         | `-o` | 输出路径：目录或归档文件 (必需)                    |
| `--username`       | `-u` | HTTP 基本认证用户名                                |
| `--password`       | `-p` | HTTP 基本认证密码                                  |
| `--token`          | `-t` | Bearer token 认证                                  |
| `--no-files`       |      | 跳过文件下载                                       |
| `--no-event-feed`  |      | 跳过 event-feed 转储 (大型聚合数据)                |
| `--endpoints`      | `-e` | 指定要转储的端点 (可重复使用)                      |
| `--timeout`        |      | 请求超时时间（秒）(默认: 30)                       |
| `--max-concurrent` |      | 最大并发请求数 (默认: 10)                          |
| `--log-level`      |      | 日志级别: DEBUG, INFO, WARNING, ERROR (默认: INFO) |
| `--verbose`        | `-v` | 启用详细日志 (等同于 --log-level DEBUG)            |

### 高级用法

**仅归档特定端点:**

```bash
ccs-archiver --base-url https://api.example.com/api --contest-id contest123 \
  -o ./output -u admin -p secret \
  -e teams -e problems -e submissions
```

**跳过文件下载以加快归档速度:**

```bash
ccs-archiver --base-url https://api.example.com/api --contest-id contest123 \
  -o contest.zip --no-files -u admin -p secret
```

**调整性能设置:**

```bash
ccs-archiver --base-url https://api.example.com/api --contest-id contest123 \
  -o ./output -u admin -p secret \
  --timeout 60 --max-concurrent 20
```

### 输出格式

工具支持多种输出格式:

- **目录**: 未压缩的目录结构比赛包
- **ZIP**: 标准 ZIP 压缩 (`.zip`)
- **tar.gz**: Gzip 压缩的 tarball (`.tar.gz`)
- **tar.zst**: Zstandard 压缩的 tarball (`.tar.zst`) - 推荐使用，压缩率最佳

创建归档文件时，工具会自动生成校验和（MD5、SHA1、SHA256、SHA512）用于验证。

### 身份认证

工具支持两种认证方式:

1. **HTTP 基本认证**: 使用 `--username` 和 `--password`
2. **Bearer Token**: 使用 `--token`

如果不提供认证信息，某些端点可能无法访问。

---

## contest-api-server

从比赛包启动本地 CCS API 服务器。

### 基本用法

```bash
# 使用比赛目录启动服务器
contest-api-server -p /path/to/contest

# 使用归档文件启动服务器
contest-api-server -p /path/to/contest.zip
contest-api-server -p /path/to/contest.tar.gz
contest-api-server -p /path/to/contest.tar.zst
```

### 选项

| 选项                | 简写 | 描述                                                         |
| ------------------- | ---- | ------------------------------------------------------------ |
| `--contest-package` | `-p` | 比赛包目录或归档文件 (必需)                                  |
| `--host`            |      | 绑定的主机地址 (默认: 0.0.0.0)                               |
| `--port`            |      | 绑定的端口 (默认: 8000)                                      |
| `--reload`          |      | 启用自动重载（开发模式）                                     |
| `--log-level`       |      | 日志级别: debug, info, warning, error, critical (默认: info) |
| `--verbose`         | `-v` | 启用详细日志 (等同于 --log-level debug)                      |

### 高级用法

**自定义主机和端口:**

```bash
contest-api-server -p /path/to/contest --host 127.0.0.1 --port 9000
```

**开发模式（自动重载）:**

```bash
contest-api-server -p /path/to/contest --reload --verbose
```

**生产环境部署:**

```bash
contest-api-server -p /path/to/contest.tar.zst --host 0.0.0.0 --port 8000
```

### 支持的归档格式

服务器可以直接从以下格式提供比赛数据服务:

- 未压缩的目录
- ZIP 文件 (`.zip`)
- Gzip 压缩的 tarball (`.tar.gz`)
- Zstandard 压缩的 tarball (`.tar.zst`)

归档文件会在启动时自动解压到临时目录，退出时自动清理。

### API 端点

启动后，服务器提供标准的 CCS API 端点:

- `GET /contests` - 列出比赛
- `GET /contests/{id}` - 获取比赛详情
- `GET /contests/{id}/teams` - 获取队伍信息
- `GET /contests/{id}/problems` - 获取题目信息
- `GET /contests/{id}/submissions` - 获取提交记录
- 以及更多...

通过 `http://localhost:8000` 访问 API（或您配置的 host:port）。

---

## 工作流示例

归档和提供比赛数据的典型工作流:

```bash
# 1. 从实时 CCS API 归档比赛数据
ccs-archiver \
  --base-url https://contest.example.com/api \
  --contest-id icpc2024 \
  -o icpc2024.tar.zst \
  --token your-api-token

# 2. 从归档数据启动本地 API 服务器
contest-api-server -p icpc2024.tar.zst --port 8000

# 3. 通过 http://localhost:8000 访问 API
```

这使您可以:

- 创建可移植的比赛数据快照
- 离线提供比赛数据服务
- 针对归档的比赛数据进行测试和开发
- 与他人共享比赛数据
