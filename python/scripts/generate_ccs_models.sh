#!/bin/bash

set -euo pipefail

CUR_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
PYTHON_DIR="$(dirname "${CUR_DIR}")"
CCS_SPECS_DIR="${PYTHON_DIR}/ccs-specs"
CCS_MODELS_DIR="${PYTHON_DIR}/xcpcio/clics/model"

BRANCH="${1:-2023-06}"
CCS_REPO_URL="https://github.com/icpc/ccs-specs.git"

MODEL_DIR_NAME="model_${BRANCH//-/_}"
OUTPUT_DIR="${CCS_MODELS_DIR}/${MODEL_DIR_NAME}"

if [[ -d "${CCS_SPECS_DIR}" ]]; then
  echo "Please remove existing ${CCS_SPECS_DIR} directory first"
  exit 1
fi

if [[ -d "${OUTPUT_DIR}" ]]; then
  echo "Please remove existing ${OUTPUT_DIR} directory first"
  exit 1
fi

echo "Generating CCS models for branch: ${BRANCH}"

pushd "${PYTHON_DIR}"

echo "Cloning CCS specs repository (branch: ${BRANCH})..."
git clone --branch "${BRANCH}" --depth 1 "${CCS_REPO_URL}" ccs-specs

echo "Creating output directory: ${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

ENTRY_POINT="${CCS_SPECS_DIR}/json-schema/event-feed-array.json"

if [[ ! -f "${ENTRY_POINT}" ]]; then
  echo "Error: ${ENTRY_POINT} not found in ccs-specs directory"
  exit 2
fi

echo "Generating Python models using datamodel-codegen..."
uv run datamodel-codegen \
  --input "${ENTRY_POINT}" \
  --input-file-type jsonschema \
  --output-model-type pydantic_v2.BaseModel \
  --target-python-version "3.11" \
  --output "${OUTPUT_DIR}/model.py"

echo "Creating __init__.py file..."
cat >"${OUTPUT_DIR}/__init__.py" <<EOF
"""
CCS (Contest Control System) models for branch ${BRANCH}.

Auto-generated from https://github.com/icpc/ccs-specs/tree/${BRANCH}
"""

from .model import * # noqa: F403
EOF

echo "CCS models generated successfully!"
echo "Output directory: ${OUTPUT_DIR}"
echo "Generated files:"
ls -la "${OUTPUT_DIR}"

echo "Done!"

popd
