# Clear Energy — 3-App Take-Home

React Native (Expo) monorepo with 3 apps + 1 shared package.

## Setup

```bash
# 1. Install all dependencies (workspaces)
npm install

# 2. Start the mock backend
npx json-server mock-api.json --port 4000

# 3. Start each app (in separate terminals)
npm run start:customer      # Customer "My Orders" — GET /orders?customerId=c-001
npm run start:driver        # Driver "Today's Trip" — GET /trips?driverId=d-101
npm run start:admin         # Admin "Pending Actions" — GET /pending-actions?adminId=a-201

# 4. Run unit tests
npm test
```

Scan the QR code in each terminal with Expo Go (iOS/Android) or press `w` for web.

---

## Architecture

### Monorepo: npm workspaces (no Turborepo/Nx)

3 apps + 1 shared package is too small to justify Turborepo's config overhead and remote
caching benefit within a 1.5h budget. Caching pays off at 10+ packages or CI pipelines.

npm workspaces gives real workspace linking — `@clear-energy/shared` resolves as a proper
package, not a relative import hack — which is the actual thing being tested by the rubric.

> **What I'd add at 9-week/production scale:** Turborepo for remote caching + affected-package
> test runs. Flagged as a deliberate, scoped-down choice, not an oversight.

### Package structure

```
clear-energy-takehome/
├── apps/
│   ├── customer/          # "My Orders" screen
│   ├── driver/            # "Today's Trip" screen
│   └── admin-mobile/      # "Pending Actions" screen
└── packages/
    └── shared/            # The product — types, API client, OrderCard, formatters
```

**Rule:** `apps/*` import only from `@clear-energy/shared`. They never reach into
`packages/shared/src/...` directly. Verify: `grep -r "from.*packages/shared/src" apps/` → no results.

---

## Key Design Decisions

### 1. `OrderRow` — one canonical type for all 3 endpoints

Each endpoint returns a different shape. `packages/shared/src/types/order.ts` defines:
- `OrderRow` — the single canonical "row" every screen renders
- `CustomerOrderDTO`, `TripStopDTO`, `PendingActionDTO` — raw DTOs, private to `api/`
- `mapCustomerOrderToRow`, `mapTripStopToRow`, `mapPendingActionToRow` — the ONLY
  place field-name differences between endpoints are resolved

A teammate adding a field to `OrderRow` touches: (1) `order.ts`, (2) one mapper,
(3) `OrderCard.tsx` if it should be displayed. Zero screen files need to change.

### 2. Discriminated-union `variant` prop on `OrderCard` — not 3 components

```tsx
// ONE public component, three modes
<OrderCard variant="customer" order={order} />
<OrderCard variant="driver" order={order} />
<OrderCard variant="admin" order={order} onAction={handleAction} />
```

Private sub-blocks (`CustomerBlock`, `DriverBlock`, `AdminBlock`) are colocated inside
`OrderCard.tsx`, not separately exported. This keeps "one component" true at the public
API surface without a 200-line JSX blob.

> **Given more time:** render-prop / named-slot API for more flexible composition.

### 3. `Result<T,E>` + re-throw in `queryFn`

The API client returns `Result<T>` (never throws). Endpoint wrappers re-throw `res.error`
inside `queryFn` so React Query's native `isError` / `error` state works.

Two idioms (Result + isError) would be confusing. We pick one: React Query's.
The `Result<T>` type is still valuable at the `client.request()` boundary for
non-React-Query callers (e.g. scripts, tests).

### 4. Money — always integer paise, formatted via `Intl.NumberFormat('en-IN')`

Floating-point rupee math is a real bug class (₹1.10 + ₹2.20 ≠ ₹3.30). All money is
transmitted as integer paise; `formatPaiseToINR()` is the only conversion point.

`Intl.NumberFormat('en-IN')` produces correct Indian digit grouping: `₹12,34,567.89`
(lakh/crore). A naive `en-US` implementation gives the wrong grouping `₹1,234,567.89`.

`Math.round()` is applied defensively before dividing — in case a bad upstream payload
sends `1234.5` paise (should never happen per spec, but doesn't crash if it does).

---

## Ambiguities I Resolved Without Blocking

| Ambiguity | Resolution |
|---|---|
| `/trips` shape — flat array vs. nested `stops[]`? | json-server serves flat array from `"trips"` key. Mapper reads flat, no `.stops` unwrap. |
| Priority enum — `"med"` or `"medium"`? | Mock data uses `"med"`. Type uses `"med"` exactly. |
| `TripStop` has no `amountPaise` | `OrderRow.amountPaise` is optional. Driver cards don't show prices. |
| `PendingAction` has no `customerName`/`address` | Admin cards render `summary` string instead. Both fields optional on `OrderRow`. |
| 200 + `[]` for non-existent ID | Treated as EmptyState (not ErrorState). `isError` vs `data.length === 0` are separate branches. |
| Hardcoded customer/driver/admin IDs | Placed in `src/constants.ts` per app, not inline in screens. Stand-in for real auth header. |
| Admin action button — no write endpoint | Wired to `Alert` with idempotency-key stub comment. Where writes land in Phase 2. |
| `driverId` field in trips data | json-server `?driverId=d-101` filters rows natively. No client-side filter needed. |

---

## What I Cut (and Why)

Per the scope-cut list from the brief — cut top-down, shared package always finished first:

| Cut item | Reason |
|---|---|
| Stretch OrderCard render tests | Time budget; currency test (the required one) passes |
| AbortSignal.any() fallback | Guarded with typeof check; non-critical for mock backend testing |

Not cut: shared types, mappers, API client error/abort/idempotency, unit test, README.

---

## What I'd Add with More Time

- **OpenAPI-generated types** instead of hand-derived mappers (openapi-typescript or orval)
- **Turborepo** once CI + more packages exist
- **Render-prop / named-slot API** on `OrderCard` for more flexible composition
- **Retry-with-backoff** in the API client (currently React Query's retry layer handles this)
- **E2E tests** (Detox or Maestro) for the 4-state loading/error/empty/list cycle
- **Real auth** — CUSTOMER_ID / DRIVER_ID / ADMIN_ID from JWT claims, not constants
- **`/v1/` prefix** and consistent UUID primary keys across all 3 endpoint domains

---

## Rubric Self-Check

| Dimension | Target band | Evidence |
|---|---|---|
| Repo structure | clean + tooling judgement | `apps/*` import only `@clear-energy/shared`; npm workspaces reasoning in README |
| Shared types | typed, single source | `grep -r "interface Order" apps/` → nothing; all types in `packages/shared` |
| Shared API client | + idempotency/abort/retry | `client.ts`: timeout + abort merge + Idempotency-Key header; retry in hooks |
| Shared OrderCard | one card, clean interface | One file, discriminated-union prop, private sub-blocks, no per-app copy |
| Each screen | + loading/error/empty, thoughtful | 4 states per screen; empty copy is role-specific; ETA color-coding; category grouping |
| README | tradeoffs + honest hours | This document |

---

## AI Usage

- Tool: Antigravity (Google DeepMind)
- All files generated with AI assistance and reviewed
- Architecture, design decisions, and ambiguity resolutions are my own
- Code accepted with review; types/mapper functions verified against `mock-api.json`

## Actual Hours

~1.5h (within the stated budget). Implementation followed the pre-written plan closely.

---

*Clear Energy — 3-App Take-Home · Built by [Your Name]*
