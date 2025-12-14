#!/bin/bash

# shellcheck disable=SC1091
[ -s "/app/python/.venv/bin/activate" ] && source "/app/xcpcio/python/.venv/bin/activate"

if [[ "${1}" == "default" ]]; then
  echo "Done"
else
  exec "${@}"
fi
