#! /bin/bash

CUR_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

if [[ -z "${APP}" ]]; then
    APP="board"
fi

exec bash "${CUR_DIR}/../packages/apps/${APP}/docker/docker_entry.sh" "${@}"
