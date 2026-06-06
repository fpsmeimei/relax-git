# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Project scope

Relax-Git is a graduation-thesis developer social platform. The current target is **not public
deployment** — it is a stable **macOS local demo** of one main flow:

`community discovers repo -> browse repo detail -> enter code snapshot -> comment/interact -> direct message -> console views platform status`

Two constraints follow from this and matter when changing behavior:

- **No mock/seed data, no preset demo accounts, no auto-login shortcuts.** The demo runs only on
  real local data the user creates manually. Don't add fixtures or demo-account bypasses.
- README, Windows, and VPS deployment paths have been intentionally removed. Keep changes scoped to
  the local demo.

## Architecture

Three runtimes plus two backing services. The TS apps are a pnpm + Turbo monorepo; the Go worker is
**not** part of the workspace and is started/built separately.

- `apps/web` — Next.js 15 / React 19 frontend + admin console (`/console`). Zustand, TanStack Query,
  NextAuth 5 (beta), Monaco editor, Socket.io client.
- `apps/api` — NestJS 11 on Fastify. Feature modules under `apps/api/src/*` (auth, repositories,
  snapshots, comments, chats, community, admin, search, timeline, notifications, websocket, ai,
  upload). JWT + Passport auth, BullMQ on Redis for jobs, Socket.io gateway for realtime, Pino
  logging.
- `apps/worker` — Go 1.22+ service. Owns Git operations (worktree + bundle), repo imports, and
  snapshot generation. Pulls jobs from Redis, writes to Postgres. Health at `:3002/health`.
- `postgres` (16) + `redis` (7) — run via Docker.

### Prisma / shared library coupling (important)

The Prisma schema lives at `apps/api/prisma/schema.prisma`, but the generated client outputs to
`libs/shared/src/generated/prisma-client`. Both `api` and `web` consume the database types through
`@relax-git/shared`.

Consequence: after any schema change or fresh clone you must `pnpm db:generate` **and** build the
shared lib (`pnpm -C libs/shared build`) before `api`/`web` will type-check or run. In Jest,
`@relax-git/shared/*` is mapped to `libs/shared/src/*` directly (see `apps/api/jest.config.ts`), so
tests don't require the built output.

## Common commands

First-time setup (or after dependency/schema changes):

```bash
pnpm install
pnpm db:generate
pnpm -C libs/shared build
cp .env.example .env   # if no .env yet
```

Run the stack (separate terminals):

```bash
pnpm docker:dev        # start postgres + redis
pnpm db:setup          # only on first start / after db:reset
pnpm dev               # web + api (Turbo)
cd apps/worker && go run .   # worker (NOT part of `pnpm dev`)
```

Database:

```bash
pnpm db:reset          # reset database
pnpm db:studio         # Prisma Studio
pnpm health-check      # repo-level service health script
```

Lint / format / types (run across workspace via Turbo):

```bash
pnpm lint
pnpm type-check
pnpm format            # prettier write; format:check to verify
```

## Tests

API (Jest, specs in `apps/api/test/**/*.spec.ts`):

```bash
pnpm -C apps/api test
pnpm -C apps/api test -- comments.service          # single file by name pattern
pnpm -C apps/api test -- -t "hides comments"       # single test by name
pnpm -C apps/api test:cov
```

Web (Vitest, specs in `apps/web/src/**/*.{test,spec}.{ts,tsx}`):

```bash
pnpm -C apps/web test:run
pnpm -C apps/web test:run src/path/to/file.test.ts  # single file
pnpm -C apps/web test:ui
```

API service tests use a Prisma mock (no live DB needed) — see existing specs like
`repositories.import-publish.spec.ts` and `comments.service.spec.ts` for the pattern.

## Local URLs

- Web / community: http://localhost:3000
- Admin console: http://localhost:3000/console
- API docs (Swagger): http://localhost:3001/api/docs
- API health: http://localhost:3001/api/health
- Worker health: http://localhost:3002/health
