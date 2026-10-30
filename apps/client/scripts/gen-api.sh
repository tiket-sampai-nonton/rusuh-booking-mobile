#!/bin/sh
# gen-api.sh — regenerate OpenAPI types (RBT-010). Reproducible codegen so the
# generated .d.ts in src/infrastructure/api/generated/ are never hand-edited.
# Run from apps/client:  npm run gen:api
set -e

CONTRACTS="../../.genesis/docs/api-contract"
OUT="src/infrastructure/api/generated"
mkdir -p "$OUT"

gen() {
  # $1 = output basename, $2 = contract filename (without extension)
  npx openapi-typescript "$CONTRACTS/$2.openapi.json" -o "$OUT/$1.d.ts"
}

gen user "1. User Service API"
gen queue "2. Queue Service API"
gen booking "3. Booking Service API"
gen payment "4. Payment Service API"
gen notification "5. Notification Service API"

echo "✅ Generated API types in $OUT"
