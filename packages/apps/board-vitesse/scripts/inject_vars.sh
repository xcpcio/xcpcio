#! /bin/bash

TARGET_FILE="${1}"

DATA_HOST="${BOARD_DATA_HOST}"

if [[ -n "${DATA_HOST}" ]]; then
    sed -i "s|__DATA_HOST__|\"${DATA_HOST}\"|g" "${TARGET_FILE}"
fi
