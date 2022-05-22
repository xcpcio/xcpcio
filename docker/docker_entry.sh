#! /bin/sh

set -e -x

BOARD_PATH="/app/board/dist"
EXPORT_PATH="/app/export"
EXPORT_BOARD_PATH="${EXPORT_PATH}/board"
INDEX_HTML_PATH="../dist/index.html"

if [ -z "${PUBLIC_PATH}" ]; then
    PUBLIC_PATH=""
fi

sed -i "s|__PUBLIC_PATH__|${PUBLIC_PATH}|g" "${INDEX_HTML_PATH}"

if [ -n "${DATA_HOST}" ]; then
    sed -i "s|__DATA_HOST__|${DATA_HOST}|g" "${INDEX_HTML_PATH}"
fi

if [ -n "${DEFAULT_TITLE}" ]; then
    sed -i "s|__DEFAULT_TITLE__|${DEFAULT_TITLE}|g" "${INDEX_HTML_PATH}"
fi

if [ -n "${BAIDU_ANALYTICS_ID}" ]; then
    sed -i "s|__BAIDU_ANALYTICS_ID__|${BAIDU_ANALYTICS_ID}|g" "${INDEX_HTML_PATH}"
fi

if [ -n "${GOOGLE_ANALYTICS_ID}" ]; then
    sed -i "s|__GOOGLE_ANALYTICS_ID__|${GOOGLE_ANALYTICS_ID}|g" "${INDEX_HTML_PATH}"
fi

if [ -d "${EXPORT_BOARD_PATH}" ]; then
    cp -a "${BOARD_PATH}"/* "${EXPORT_BOARD_PATH}"/
fi

if [ X"${1}" = X"primary" ]; then
    cd board
    exec npm run start
else
    exec "${@}"
fi
