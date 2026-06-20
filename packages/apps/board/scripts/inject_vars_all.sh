#!/bin/bash

CUR_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

find "${CUR_DIR}/../dist" -type f \( -name "*.html" -o -name "*.js" \) -print0 | while IFS= read -r -d '' file; do
  echo "${file}"
  bash "${CUR_DIR}/inject_vars.sh" "${file}"
done
