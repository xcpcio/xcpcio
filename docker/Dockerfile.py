FROM ubuntu:24.04

USER root
WORKDIR /app/xcpcio
COPY python/ /app/xcpcio/python
COPY docker/ /app/xcpcio/
COPY package.json /app/xcpcio/

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="/app/xcpcio/python/.venv/bin:$PATH"

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && cd python && uv sync --no-dev \
    && cd ..

ENTRYPOINT ["/app/xcpcio/docker/docker_entry_py.sh"]
CMD ["default"]
