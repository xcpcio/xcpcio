#! /bin/bash

CUR_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

BOARD_PATH="/app/board/dist"
EXPORT_PATH="/app/export"
EXPORT_BOARD_PATH="${EXPORT_PATH}/board"

bash "${CUR_DIR}/../scripts/inject_vars.sh" ${BOARD_PATH}/*.html

if [[ -d "${EXPORT_BOARD_PATH}" ]]; then
    cp -a "${BOARD_PATH}"/* "${EXPORT_BOARD_PATH}"/
fi

if [[ X"${1}" = X"primary" ]]; then
    cd /app/board || exit 1
    exec npm run start
else
    exec "${@}"
fi
