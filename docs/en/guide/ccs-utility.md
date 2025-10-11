<!-- markdownlint-disable MD024 -->

# CCS Utility

XCPCIO provides two powerful Python CLI tools for working with CCS (Contest Control System) contest data.

## Installation

```bash
pip install xcpcio
```

## ccs-archiver

Archive CCS Contest API data to the standard contest package format.

### Basic Usage

```bash
# Archive to a directory
ccs-archiver --base-url https://api.example.com/api --contest-id contest123 -o ./output -u admin -p secret

# Archive to a ZIP file
ccs-archiver --base-url https://api.example.com/api --contest-id contest123 -o contest.zip --token abc123

# Archive to tar.gz
ccs-archiver --base-url https://api.example.com/api --contest-id contest123 -o contest.tar.gz -u admin -p secret

# Archive to tar.zst (Zstandard compression)
ccs-archiver --base-url https://api.example.com/api --contest-id contest123 -o contest.tar.zst -u admin -p secret
```

### Options

| Option             | Short | Description                                            |
| ------------------ | ----- | ------------------------------------------------------ |
| `--base-url`       |       | Base URL of the CCS API (required)                     |
| `--contest-id`     |       | Contest ID to archive (required)                       |
| `--output`         | `-o`  | Output path: directory or archive file (required)      |
| `--username`       | `-u`  | HTTP Basic Auth username                               |
| `--password`       | `-p`  | HTTP Basic Auth password                               |
| `--token`          | `-t`  | Bearer token for authentication                        |
| `--no-files`       |       | Skip downloading files                                 |
| `--no-event-feed`  |       | Skip event-feed dump (large aggregated data)           |
| `--endpoints`      | `-e`  | Specific endpoints to dump (repeatable)                |
| `--timeout`        |       | Request timeout in seconds (default: 30)               |
| `--max-concurrent` |       | Max concurrent requests (default: 10)                  |
| `--log-level`      |       | Log level: DEBUG, INFO, WARNING, ERROR (default: INFO) |
| `--verbose`        | `-v`  | Enable verbose logging (same as --log-level DEBUG)     |

### Advanced Usage

**Archive specific endpoints only:**

```bash
ccs-archiver --base-url https://api.example.com/api \
  --contest-id contest123 \
  -o ./output -u admin -p secret \
  -e teams -e problems -e submissions
```

**Skip file downloads for faster archiving:**

```bash
ccs-archiver --base-url https://api.example.com/api \
  --contest-id contest123 \
  -o contest.zip --no-files -u admin -p secret
```

**Adjust performance settings:**

```bash
ccs-archiver --base-url https://api.example.com/api \
  --contest-id contest123 \
  -o ./output -u admin -p secret \
  --timeout 60 --max-concurrent 20
```

### Output Formats

The tool supports multiple output formats:

- **Directory**: Uncompressed contest package in a directory structure
- **ZIP**: Standard ZIP compression (`.zip`)
- **tar.gz**: Gzip-compressed tarball (`.tar.gz`)
- **tar.zst**: Zstandard-compressed tarball (`.tar.zst`) - recommended for best compression

When creating an archive file, the tool automatically generates checksums (MD5, SHA1, SHA256, SHA512) for verification.

### Authentication

The tool supports two authentication methods:

1. **HTTP Basic Auth**: Use `--username` and `--password`
2. **Bearer Token**: Use `--token`

If no authentication is provided, some endpoints may not be accessible.

## contest-api-server

Start a local CCS API server from a contest package.

### Basic Usage

```bash
# Start server with a contest directory
contest-api-server -p /path/to/contest

# Start server with an archive file
contest-api-server -p /path/to/contest.zip
contest-api-server -p /path/to/contest.tar.gz
contest-api-server -p /path/to/contest.tar.zst
```

### Options

| Option              | Short | Description                                                      |
| ------------------- | ----- | ---------------------------------------------------------------- |
| `--contest-package` | `-p`  | Contest package directory or archive file (required)             |
| `--host`            |       | Host to bind to (default: 0.0.0.0)                               |
| `--port`            |       | Port to bind to (default: 8000)                                  |
| `--reload`          |       | Enable auto-reload for development                               |
| `--log-level`       |       | Log level: debug, info, warning, error, critical (default: info) |
| `--verbose`         | `-v`  | Enable verbose logging (same as --log-level debug)               |

### Advanced Usage

**Custom host and port:**

```bash
contest-api-server -p /path/to/contest --host 127.0.0.1 --port 9000
```

**Development mode with auto-reload:**

```bash
contest-api-server -p /path/to/contest --reload --verbose
```

**Production deployment:**

```bash
contest-api-server -p /path/to/contest.tar.zst --host 0.0.0.0 --port 8000
```

### Supported Archive Formats

The server can directly serve contest data from:

- Uncompressed directories
- ZIP files (`.zip`)
- Gzip-compressed tarballs (`.tar.gz`)
- Zstandard-compressed tarballs (`.tar.zst`)

Archive files are automatically extracted to a temporary directory on startup and cleaned up on exit.

### API Endpoints

Once started, the server provides standard CCS API endpoints:

- `GET /contests` - List contests
- `GET /contests/{id}` - Get contest details
- `GET /contests/{id}/teams` - Get teams
- `GET /contests/{id}/problems` - Get problems
- `GET /contests/{id}/submissions` - Get submissions
- And more...

Access the API at `http://localhost:8000` (or your configured host:port).

## Workflow Example

A typical workflow for archiving and serving contest data:

```bash
# 1. Archive contest data from a live CCS API
ccs-archiver \
  --base-url https://contest.example.com/api \
  --contest-id icpc2024 \
  -o icpc2024.tar.zst \
  --token your-api-token

# 2. Start a local API server from the archived data
contest-api-server -p icpc2024.tar.zst --port 8000

# 3. Access the API at http://localhost:8000
```

This allows you to:

- Create portable contest data snapshots
- Serve contest data offline
- Test and develop against archived contest data
- Share contest data with others
