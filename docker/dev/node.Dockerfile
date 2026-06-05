FROM node:22-bookworm-slim

ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    make \
    g++ \
    openssl \
    python3 \
  && npm install -g pnpm@8.15.0 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

