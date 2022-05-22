#! /bin/sh

set -e -x

BOARD_PATH="/app/board/dist"
EXPORT_PATH="/app/export"
EXPORT_BOARD_PATH="${EXPORT_PATH}/board"

if [ -z "${PUBLIC_PATH}" ]; then
    PUBLIC_PATH=""
fi

sed -i "s|__PUBLIC_PATH__|${PUBLIC_PATH}|g" /app/board/dist/*.html

if [ -n "${DATA_HOST}" ]; then
    sed -i "s|__DATA_HOST__|${DATA_HOST}|g" /app/board/dist/*.html
fi

if [ -n "${DEFAULT_TITLE}" ]; then
    sed -i "s|__DEFAULT_TITLE__|${DEFAULT_TITLE}|g" /app/board/dist/*.html
fi

if [ -n "${BAIDU_ANALYTICS_ID}" ]; then
    sed -i "s|__BAIDU_ANALYTICS_ID__|${BAIDU_ANALYTICS_ID}|g" /app/board/dist/*.html
fi

if [ -n "${GOOGLE_ANALYTICS_ID}" ]; then
    sed -i "s|__GOOGLE_ANALYTICS_ID__|${GOOGLE_ANALYTICS_ID}|g" /app/board/dist/*.html
fi

if [ -d "${EXPORT_BOARD_PATH}" ]; then
    cp -a "${BOARD_PATH}"/* "${EXPORT_BOARD_PATH}"/
fi

if [ X"${1}" = X"primary" ]; then
    cd /app/board
    exec npm run start
else
    exec "${@}"
fi
