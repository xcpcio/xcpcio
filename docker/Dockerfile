FROM ubuntu:24.04

USER root
WORKDIR /app
COPY ./ ./xcpcio

ENV DEBIAN_FRONTEND=noninteractive

EXPOSE 3000

ENTRYPOINT ["/app/xcpcio/docker/docker_entry.sh"]
CMD ["primary"]
