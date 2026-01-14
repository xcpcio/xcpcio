FROM ubuntu:24.04

USER root
WORKDIR /app
COPY ./ ./xcpcio
WORKDIR /app/xcpcio

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="/root/.local/bin:$PATH"
ENV PATH="/app/xcpcio/python/.venv/bin:$PATH"

RUN apt-get update && apt-get install -y \
    curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf node_modules \
    && rm -rf packages/*/*/node_modules \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && cd python && uv sync --no-dev \
    && cd ..

ENTRYPOINT ["/app/xcpcio/docker/docker_entry.sh"]
CMD ["default"]
