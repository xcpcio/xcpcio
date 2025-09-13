#!/bin/bash

CUR_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

VERSION=$(cat <"${CUR_DIR}/../package.json" | grep version | sed 's|  \"version\": \"||g' | sed 's|\",||g')

echo "current package version: $VERSION"

export BOARD_CDN_HOST="https://cdn.jsdelivr.net/npm/@xcpcio/board-app@${VERSION}/dist"

bash "${CUR_DIR}/inject_vars_all.sh"
