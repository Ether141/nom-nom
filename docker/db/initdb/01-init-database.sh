#!/usr/bin/env bash
set -e

psql --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE nomnom;
EOSQL

pg_restore \
  --username "$POSTGRES_USER" \
  --dbname nomnom \
  --verbose \
  /docker-entrypoint-initdb.d/nomnom.dump