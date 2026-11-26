# Data Format

Board configuration consists of three JSON files:

- `config.json`
- `team.json`
- `run.json`

## config.json

- [Configuration Generation Script](https://github.com/XCPCIO/XCPCIO-Board-Spider/blob/main/generate-config/gen-config.py)
- All configuration for a contest is stored in this file. You can refer to the configuration generation script to understand available configuration options.

## team.json

This file stores information for all teams.

```json
{
  "team_id": {
    "team_id": 1,
    "name": "Team Name",
    "organization": "Organization Name",
    "official": 1,
    "unofficial": 1,
    "girl": 1
  }
}
```

### Team Properties

- **`team_id`**: Can be either string or number
- **Common Groups**: `official`, `unofficial`, `girl` are commonly used groups
  - Setting `unofficial` will display a snowflake icon
  - Setting `girl` will display a female icon
  - If the team doesn't belong to a group, don't set the property to 0 - simply omit the key entirely

### Custom Groups

For custom group requirements, you can refer to the Zhejiang Provincial Contest configuration files as examples.

## run.json

This file stores all submission information.

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

### Submission Properties

- **`team_id`**: Team identifier (string or number)
- **`problem_id`**: Problem identifier
- **`timestamp`**: Relative time in seconds from contest start
- **`status`**: Submission result, can only be:
  - `"correct"` - Accepted submission
  - `"incorrect"` - Wrong answer/runtime error/etc
  - `"pending"` - Still being judged

### Timestamp Handling

- **DOMjudge**: Uses seconds as timestamp unit
- **Some Systems**: May use minutes, requiring conversion for accurate ranking calculations

::: tip
When implementing data conversion, ensure timestamp units are consistent with your judging system to maintain accurate ranking calculations.
:::

## Example Configuration

For complete configuration examples, check the [XCPCIO Board Spider repository](https://github.com/XCPCIO/XCPCIO-Board-Spider) which contains sample configurations and generation scripts for various contest scenarios.
