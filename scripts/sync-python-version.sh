#!/bin/bash

set -e

CUR_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
BASE_DIR="$(realpath "$CUR_DIR/..")"

# Get version from package.json
VERSION=$(node -p "require('$BASE_DIR/package.json').version")

echo "📦 Syncing Python package to version: $VERSION"

pushd "$BASE_DIR/python"

uv version "$VERSION"
python -c "
import re
with open('$BASE_DIR/python/xcpcio/__init__.py', 'r') as f:
    content = f.read()
updated = re.sub(r'__version__ = \"[^\"]*\"', f'__version__ = \"$VERSION\"', content)
with open('$BASE_DIR/python/xcpcio/__init__.py', 'w') as f:
    f.write(updated)
"

popd

echo "✅ Updated Python package version to $VERSION"
