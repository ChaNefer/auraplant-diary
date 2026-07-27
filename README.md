# MonoDiaryModule

Universal **Timeline Core** — domain-agnostic diary engine for AuraPlant, SolutionRE.RUN, ZeroCITY, insurance diaries, and future packs.

Phase 1: PostgreSQL + Event API.  
Phase 2: Eyris-based `packages/ui-shared` Timeline + `apps/diary-web` wired to the live API.

## Model law

| Concept | Meaning | Examples |
| --- | --- | --- |
| **Workspace** | Place / scope / ACL node (tree via `parent_id`) | Dom → Piętro → Pokój, Agencja, Rada Miasta |
| **Entity** | Object with a **portable** timeline | Roślina, Pracownik, Pies, Radny |
| **Event** | Append-only log row; `workspace_id` is a **snapshot** at write time | measurement, check-in, report |

Transfer moves the Entity to another Workspace and writes `entity_workspace_move`. Historical events keep their original `workspace_id`.

## Stack

- pnpm + Turborepo monorepo
- `packages/timeline-core` — Zod contracts
- `packages/ui-shared` — Eyris Timeline primitive + `DiaryTimeline`
- `apps/api` — Hono + Drizzle + PostgreSQL 16
- `apps/diary-web` — Vite + React + Tailwind demo UI

## Quick start

```bash
# 1) env
cp .env.example .env
cp .env.example apps/api/.env

# 2) deps
pnpm install

# 3) database (Postgres on host port 5434 — see docker-compose.yml)
pnpm db:up
pnpm db:migrate
pnpm db:seed

# 4) API + UI (two terminals)
pnpm dev:api
pnpm dev:web
```

- API health: `GET http://127.0.0.1:3000/health`
- UI: `http://127.0.0.1:5174` (proxies `/api` → `:3000`)

### Smoke test

With API running:

```bash
pnpm smoke
```

## API (Phase 1+)

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/health` | DB ping |
| `POST` | `/workspaces` | optional `parent_id` |
| `GET` | `/workspaces` | roots |
| `GET` | `/workspaces/:id` | detail |
| `GET` | `/workspaces/:id/children` | direct children |
| `GET` | `/workspaces/:id/breadcrumbs` | path to root |
| `GET` | `/entities` | list entities |
| `POST` | `/entities` | create in workspace |
| `GET` | `/entities/:id` | detail |
| `POST` | `/entities/:id/transfer` | `{ to_workspace_id, reason? }` |
| `POST` | `/events` | append-only |
| `GET` | `/entities/:id/timeline` | `from`, `to`, `type`, `flag` |

Events are never updated or deleted via API. Corrections = new `system.correction` / `system.void` events (convention in `@monodiary/timeline-core`).

## UI (Phase 2)

- Timeline primitive adapted from Eyris Vite TS demo (`components/ui/Timeline`)
- Activity-style day grouping via `DiaryTimeline`
- Domain copy via dictionary (demo uses AuraPlant-ish humidity labels)
- Full Eyris admin shell / FAB / auth still out of scope

## Out of scope (still)

- Full domain apps (`auraplant`, `zero-city`, …) as separate products
- Auth, E2E crypto, webhooks, media upload endpoints
- Any code from SignalistA / ZeroCITY / other legacy repos

## License

Private — ZeroGOVERNMENT.
