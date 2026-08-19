#!/usr/bin/env bash
set -euo pipefail

npm install -g pnpm@9.15.0
pnpm install --frozen-lockfile --filter @monodiary/api... --prod=false
pnpm --filter @monodiary/timeline-core build
ls -la packages/timeline-core/dist || true
pnpm --filter @monodiary/api build
