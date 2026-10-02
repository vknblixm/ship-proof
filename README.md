# SHIP//PROOF

Deterministic release verification against Sanity-managed policy documents.

## Features

- Sanity-backed release policy records
- Node runtime compatibility checks
- Deprecated dependency detection
- Drift and blocked-state handling
- Interactive verification dashboard
- Core deterministic test suite

## Local setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Sanity project credentials

npx tsx scripts/verify-fixtures.mjs
npm run dev
```

## Verification presets

- `v1-clean` => SHIP
- `v1-broken` => BLOCKED
- `v1-drift` => DRIFT

## Seeding Sanity

```bash
npm run seed
```

Requires `SANITY_WRITE_TOKEN` in `.env.local`.

## Architecture

### Core Logic
- **lib/evaluator.ts**: Deterministic semver matching and release policy evaluation
- **lib/groq.ts**: Sanity Content Lake query client
- **sanity/schemaTypes/releaseCandidate.ts**: Sanity document schema

### API
- **app/api/verify/route.ts**: GET endpoint for release verification

### UI
- **app/page.tsx**: Interactive dashboard with sandbox presets

### Tests
- **scripts/verify-fixtures.mjs**: Core test suite (CLEAN, BROKEN, DRIFT)
- **scripts/seed-sanity.ts**: Seeder for test records
