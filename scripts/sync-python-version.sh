#!/bin/bash

set -e

CUR_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
BASE_DIR="$(realpath "$CUR_DIR/..")"

# Get version from package.json
VERSION=$(node -p "require('$BASE_DIR/package.json').version")

echo "📦 Syncing Python package to version: $VERSION"

pushd "$BASE_DIR/python"

hatch version "$VERSION"

popd

echo "✅ Updated Python package version to $VERSION"
