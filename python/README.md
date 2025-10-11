# xcpcio-python

Python library and CLI tools for XCPCIO.

## Features

- **Type Definitions**: Pydantic models for contest data structures (teams, submissions, problems, etc.)
- **Constants**: Shared constants for submission statuses, time units, and penalty calculations
- **CCS Archiver**: CLI tool to archive CCS API data to contest package format
- **Contest API Server**: CLI tool to serve contest packages via CCS API
- **Cross-Language Compatibility**: Mirrors TypeScript types for data consistency

## Installation

```bash
pip install xcpcio
```

Or install with [uv](https://github.com/astral-sh/uv):

```bash
uv add xcpcio
```

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/xcpcio/xcpcio.git
cd xcpcio/python

# Install dependencies with uv
uv sync
```

### Testing

```bash
# Run tests
uv run pytest

# Run specific test file
uv run pytest tests/test_types.py
```

## Documentation

For detailed documentation, visit:

- [CCS Utility Guide](https://xcpcio.com/guide/ccs-utility)

## License

MIT License &copy; 2020-PRESENT [Dup4](https://github.com/Dup4)
