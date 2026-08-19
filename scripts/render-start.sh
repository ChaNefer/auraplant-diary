#!/usr/bin/env bash
set -euo pipefail

node apps/api/dist/db/migrate.js
node apps/api/dist/index.js
