#!/bin/sh
set -eu

cd /workspace/apps/worker

fingerprint() {
  find . \
    \( -path './data' -o -path './bin' \) -prune -o \
    -type f \( -name '*.go' -o -name 'go.mod' -o -name 'go.sum' -o -name 'config*.yaml' \) \
    -exec stat -c '%n:%Y:%s' {} \; \
    | sort \
    | sha256sum \
    | awk '{print $1}'
}

last_fingerprint="$(fingerprint)"

while true; do
  echo "[worker-dev] starting worker"
  go run . &
  pid="$!"

  while kill -0 "$pid" 2>/dev/null; do
    sleep 2
    next_fingerprint="$(fingerprint)"
    if [ "$next_fingerprint" != "$last_fingerprint" ]; then
      echo "[worker-dev] source change detected, restarting worker"
      kill "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
      last_fingerprint="$next_fingerprint"
      break
    fi
  done

  if ! kill -0 "$pid" 2>/dev/null; then
    wait "$pid" 2>/dev/null || true
    sleep 1
    last_fingerprint="$(fingerprint)"
  fi
done

