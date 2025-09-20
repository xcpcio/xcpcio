FROM ubuntu:24.04

USER root
WORKDIR /app
COPY ./ ./xcpcio
WORKDIR /app/xcpcio

ENV DEBIAN_FRONTEND=noninteractive
ENV NVM_DIR=/root/.nvm
ENV PATH="/root/.local/bin:$PATH"
ENV NVM_VERSION="v0.40.3"

# Install system dependencies, uv, nvm, and build project
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install 24 \
    && nvm use 24 \
    && nvm alias default 24 \
    && corepack enable pnpm \
    && pnpm install --force \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && cd python && uv install \
    && cd ..


EXPOSE 3000
ENTRYPOINT ["/app/xcpcio/docker/docker_entry.sh"]
CMD ["primary"]
