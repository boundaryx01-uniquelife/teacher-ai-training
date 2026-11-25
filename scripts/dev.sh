#!/usr/bin/env bash
# Starts netlify dev. Strips --use-openssl-ca (not allowed in worker NODE_OPTIONS) and keeps the CA bundle via NODE_EXTRA_CA_CERTS.
export NODE_OPTIONS="$(echo "${NODE_OPTIONS:-}" | sed 's/--use-openssl-ca//g')"
[ -f /root/.ccr/ca-bundle.crt ] && export NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt
exec npx netlify dev --offline "$@"
