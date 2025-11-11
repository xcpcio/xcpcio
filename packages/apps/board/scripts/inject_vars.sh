#!/bin/bash

TARGET_FILE="${1}"

CDN_HOST=""

if [[ -n "${BOARD_CDN_HOST}" ]]; then
  CDN_HOST="${BOARD_CDN_HOST}"
fi

DATA_HOST="${BOARD_DATA_HOST}"
DATA_REGION="${BOARD_DATA_REGION}"
DEFAULT_LANG="${BOARD_DEFAULT_LANG}"
REFETCH_INTERVAL="${BOARD_REFETCH_INTERVAL}"
BAIDU_ANALYTICS_ID="${BOARD_BAIDU_ANALYTICS_ID}"
UMAMI_JS_URL="${BOARD_UMAMI_JS_URL}"
UMAMI_WEBSITE_ID="${BOARD_UMAMI_WEBSITE_ID}"

sed -i "s|__CDN_HOST__|${CDN_HOST}|g" "${TARGET_FILE}"

if [[ -n "${DATA_HOST}" ]]; then
  sed -i "s|__DATA_HOST__|\"${DATA_HOST}\"|g" "${TARGET_FILE}"
fi

if [[ -n "${DATA_REGION}" ]]; then
  sed -i "s|__DATA_REGION__|\"${DATA_REGION}\"|g" "${TARGET_FILE}"
fi

if [[ -n "${DEFAULT_LANG}" ]]; then
  sed -i "s|__DEFAULT_LANG__|\"${DEFAULT_LANG}\"|g" "${TARGET_FILE}"
fi

if [[ -n "${REFETCH_INTERVAL}" ]]; then
  sed -i "s|__REFETCH_INTERVAL__|\"${REFETCH_INTERVAL}\"|g" "${TARGET_FILE}"
fi

if [[ -n "${BAIDU_ANALYTICS_ID}" ]]; then
  sed -i "s|__BAIDU_ANALYTICS_ID__|\"${BAIDU_ANALYTICS_ID}\"|g" "${TARGET_FILE}"
fi

if [[ -n "${UMAMI_JS_URL}" ]]; then
  sed -i "s|__UMAMI_JS_URL__|\"${UMAMI_JS_URL}\"|g" "${TARGET_FILE}"
fi

if [[ -n "${UMAMI_WEBSITE_ID}" ]]; then
  sed -i "s|__UMAMI_WEBSITE_ID__|\"${UMAMI_WEBSITE_ID}\"|g" "${TARGET_FILE}"
fi
