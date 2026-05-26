# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Root (npm workspaces — runs across both services)
```bash
npm run build        # tsc in all services
npm run test         # jest in all services
npm install          # install all workspace dependencies
```

### Per-service (cd into services/users-service or services/orders-service)
```bash
npm run dev          # ts-node-dev with hot reload
npm run build        # tsc
npm test             # jest (all tests, no DB needed)
npx jest --testPathPattern src/app.test.ts          # run a single test file
npx jest --testPathPattern src/services/userService # run a single test file
npm run db:generate        # regenerate Prisma client after schema changes
npm run db:migrate:dev     # create a new migration (requires running postgres)
npm run db:migrate:deploy  # apply pending migrations (used at startup in prod)
npm run db:studio          # Prisma Studio UI
```

### Local full-stack
```bash
docker compose up --build   # postgres + both services (ports 3100, 3101)
docker compose down -v      # stop and remove volumes
```

### Deploy to AWS
```bash
./infra/deploy.sh <account-id> <region> [environment]
# environment defaults to "production"
# GITHUB_SHA env var controls the image tag (defaults to "latest")
```

## Architecture

### Repository layout
```
infra/                  CloudFormation templates for shared AWS infrastructure
  vpc.yml               VPC, public/private subnets, NAT gateways, security groups
  cluster.yml           ECS cluster, single ALB, IAM roles, Cloud Map namespace
  rds.yml               RDS PostgreSQL 16, Secrets Manager secret, DB subnet group
  deploy.sh             Ordered deploy script: vpc → cluster → rds → images → services
  postgres-init.sql     Creates users_db and orders_db on first postgres start
services/
  users-service/        Users domain
  orders-service/       Orders domain
    infra/              Service-specific CloudFormation (task def, ALB listener rule)
    prisma/             schema.prisma + migrations/
    src/
      index.ts          Composition root — wires PrismaClient → Repository → Service → app
      app.ts            Express factory (accepts service, returns Application)
      config.ts         All config from env vars; constructs DATABASE_URL
      models/           Plain TypeScript interfaces only; re-exports DTO types from schemas
      schemas/          Zod schemas — source of truth for request DTOs
      middleware/       validate.ts — Zod validation middleware factory
      repositories/     IXxxRepository interface + PrismaXxxRepository implementation
      services/         Business logic; depends only on IXxxRepository interface
      routes/           Express routers; call validate(schema) before POST handlers
```

### Request flow
```
ALB → ECS Fargate task → Express app
  POST /api/v1/users
    → validate(createUserSchema)   # 400 + fieldErrors if invalid
    → UserService.create()         # EmailConflictError → 409
    → UserRepository.save()        # Prisma insert
```

### Dependency injection pattern
`index.ts` is the only file that touches `PrismaClient` directly. The chain is:

```
PrismaClient → UserRepository(prisma) → UserService(repo) → createApp(service)
```

`UserService` depends on `IUserRepository` (interface), not `UserRepository` (class). Tests inject a `jest.Mocked<IUserRepository>` — no database involved.

### Validation
Schemas live in `src/schemas/` and are used in two ways:
1. `validate(schema)` middleware on POST routes — returns `400 { error: "Validation failed", details: { field: ["message"] } }`
2. `z.infer<typeof schema>` produces the DTO type used by the service layer

### Error handling
Each route file has its own Express error handler as the last `router.use()`:

| Error class | Status |
|---|---|
| `UserNotFoundError` / `OrderNotFoundError` | 404 |
| `EmailConflictError` | 409 |
| `InvalidOrderError` (already cancelled) | 422 |
| Unhandled | 500 |

### Health endpoints
- `GET /health` — liveness (always 200, no DB call)
- `GET /ready` — readiness (always 200, no DB call)

DB health is monitored via CloudWatch alarms on RDS metrics, not HTTP checks. This prevents cascading failures if the DB is temporarily unreachable.

### Database (Prisma + PostgreSQL)
- `DATABASE_URL` is constructed in `config.ts` from individual `DB_*` env vars so ECS can inject `DB_PASSWORD` from Secrets Manager separately.
- `process.env.DATABASE_URL` is set at the top of `main()` before `new PrismaClient()` is called.
- `prisma migrate deploy` runs synchronously on every startup (idempotent).
- Each service has its own database: `users_db`, `orders_db`.
- Schema changes: edit `prisma/schema.prisma`, then `npm run db:migrate:dev` to generate the migration SQL file. Commit both the schema and the migration.
- After editing `schema.prisma` locally without running a migration, run `npm run db:generate` to update the TypeScript client.

### AWS infrastructure
- **Networking**: single VPC, two AZs, public subnets (ALB + NAT gateways), private subnets (ECS tasks + RDS — same subnets, isolated by security groups).
- **ECS**: single Fargate cluster, `awsvpc` networking, ECS Service Connect for inter-service traffic via Cloud Map namespace `my-platform.local`.
- **Secrets**: `DB_PASSWORD` injected into ECS tasks via `Secrets` field pointing to Secrets Manager ARN — never in plaintext in the task definition.
- **Cross-stack references**: infra stacks export values (DB endpoint, secret ARN, role ARNs) that service stacks import with `Fn::ImportValue`. Deploy order matters — see `deploy.sh`.
- **Dockerfiles**: `prisma generate` must run in both the builder stage and the production stage to produce platform-correct native binaries.
