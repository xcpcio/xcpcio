#! /bin/bash

CUR_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

BOARD_PATH="${CUR_DIR}/dist"
EXPORT_PATH="/app/export"

bash "${CUR_DIR}/../scripts/inject_vars.sh" "${BOARD_PATH}"/*.html

if [[ -d "${EXPORT_PATH}" ]]; then
    cp -a "${BOARD_PATH}"/* "${EXPORT_PATH}"/
fi

echo "done"
