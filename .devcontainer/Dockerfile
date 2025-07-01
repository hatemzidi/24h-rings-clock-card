FROM python:3-bookworm
LABEL authors="tom"

ARG DEBIAN_FRONTEND=noninteractive

SHELL ["/bin/bash", "-l", "-euxo", "pipefail", "-c"]

RUN apt-get update; \
    apt-get full-upgrade -y; \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
    ; \
    apt-get install -y libopenjp2-7 libtiff6 tzdata sqlite3; \
    apt-get install -y python3-dev python3-venv autoconf libssl-dev libxml2-dev libxslt1-dev libjpeg-dev libffi-dev libudev-dev zlib1g-dev libturbojpeg0 \
    pkg-config libavformat-dev libavcodec-dev libavdevice-dev libavutil-dev libswscale-dev libswresample-dev libavfilter-dev ffmpeg libgammu-dev build-essential;\
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

ENV NVM_DIR=/usr/local/nvm

RUN mkdir -p "$NVM_DIR"; \
    curl -o- \
        "https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh" | \
        bash \
    ; \
    source $NVM_DIR/nvm.sh; \
    nvm install v24.2.0

# Install Home Assistant.
RUN python3 -m pip install wheel; \
    pip3 install homeassistant; \
    pip3 install home-assistant-frontend; \
    pip3 install zlib_ng isal; \
    pip3 install PyNaCl; \
    mkdir -p /config

COPY configuration.yaml /config/configuration.yaml
COPY ui-lovelace.yaml /config/ui-lovelace.yaml