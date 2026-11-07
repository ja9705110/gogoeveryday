#!/usr/bin/env bash
# 重建本機資料庫並執行引擎測試：PGPORT=54329 bash tests/run.sh
set -euo pipefail
cd "$(dirname "$0")/.."
P="psql -h ${PGHOST:-/tmp} -p ${PGPORT:-54329} -U postgres -v ON_ERROR_STOP=1 -q"
$P -c "drop schema if exists public cascade; drop schema if exists private cascade; drop schema if exists auth cascade; create schema public;" >/dev/null 2>&1
$P -f tests/local_stub.sql >/dev/null 2>&1
for f in migrations/*.sql; do $P -f "$f" >/dev/null 2>&1 || { echo "migration failed: $f"; $P -f "$f"; exit 1; }; done
$P -f tests/engine_test.sql 2>&1 | grep -E "ok -|FAIL|ERROR|PASSED|CONTEXT|DETAIL" | sed 's/^psql:[^ ]* //'
