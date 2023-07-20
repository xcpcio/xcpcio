#! /bin/bash

CUR_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

if [[ -z "${APP}" ]]; then
    APP="board"
fi

if [[ X"${1}" = X"primary" ]]; then
    exec bash "${CUR_DIR}/packages/apps/${APP}/docker/docker_entry.sh"
else
    exec "${@}"
fi
