#!/bin/bash

CUR_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

EXPORT_PATH="/app/export"
if [[ -d "${EXPORT_PATH}" ]]; then
  rm -rf "${EXPORT_PATH:?}"/*
fi

if [[ "${APP}" = "board" ]]; then
  bash bash "${CUR_DIR}/../packages/apps/board/scripts/inject_vars_all.sh"
  APP_PATH="${CUR_DIR}/../packages/apps/board/dist"
elif [[ "${APP}" = "docs" ]]; then
  APP_PATH="${CUR_DIR}/../docs/dist"
fi

if [[ -n "${APP_PATH}" ]]; then
  cp -a "${APP_PATH}"/* "${EXPORT_PATH}"/
  echo "Exported ${APP_PATH} to ${EXPORT_PATH}"
fi

if [[ X"${1}" = X"primary" ]]; then
  echo "Done"
else
  exec "${@}"
fi
