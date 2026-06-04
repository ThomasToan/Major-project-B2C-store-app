# Thomas Store

Thomas Store is a B2C Store Application built for the COMP3036 Applied Project Option 2. It started from an existing assignment codebase and has been converted into a complete store application with customer shopping features, admin management features, automated B2C tests, and deployment support.

Live deployment:

https://thomasdangstore.vercel.app

## Project Overview

Thomas Store allows customers to browse products, search and filter the store catalogue, register and log in, manage a database-backed cart, complete a mock checkout, and review their purchase history. Admin users can access protected admin pages to manage products and view purchase records.

The application uses a Next.js web app, a Prisma database package, Neon PostgreSQL, Playwright E2E tests, and GitHub Actions CI.

## Completed Features

- Product browsing
- Product search and category filtering
- Product detail pages
- Customer registration, login, and logout
- HTTP-only cookie session authentication
- Database-backed cart linked to the logged-in user
- Guest browsing with login required before adding to cart
- Mock checkout flow
- Purchase and purchase item records
- Product stock reduction after checkout
- Cart clearing after successful checkout
- Customer purchase history
- Admin access control using `CUSTOMER` and `ADMIN` roles
- Admin product list
- Admin create product
- Admin edit product
- Admin active/inactive product management
- Admin purchase records
- Neon PostgreSQL database with Prisma
- Separate test database variables for Playwright tests
- Automated B2C Playwright tests
- GitHub Actions CI
- Vercel deployment support

## Tech Stack

- Next.js
- React
- TypeScript
- Prisma
- Neon PostgreSQL
- Playwright
- pnpm
- Turborepo
- Vercel

## Project Structure

```text
.
+-- apps/
|   +-- web/                 # Next.js Thomas Store web app
+-- packages/
|   +-- db/                  # Prisma schema, database client, seed, store helpers
|   +-- ui/                  # Shared UI/styles package used by the web app
+-- tests/
|   +-- playwright/          # B2C Playwright E2E tests and config
+-- docs/
|   +-- API.md               # API documentation
+-- .github/
|   +-- workflows/ci.yml     # B2C Store GitHub Actions CI
+-- package.json
+-- pnpm-lock.yaml
+-- turbo.json
```

## Environment Variables

Do not commit real database URLs, passwords, or secrets.

Create the required environment variables locally and in deployment environments.

```env
DATABASE_URL="postgresql://neondb_owner:npg_VSHzTs8BOqx9@ep-delicate-hat-a7icngws-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:npg_VSHzTs8BOqx9@ep-delicate-hat-a7icngws.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

TEST_DATABASE_URL="postgresql://neondb_owner:npg_sAYoK1y5HbSP@ep-damp-meadow-a7hj2zvz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
TEST_DIRECT_URL="postgresql://neondb_owner:npg_sAYoK1y5HbSP@ep-damp-meadow-a7hj2zvz.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

Database variable meaning:

- `DATABASE_URL` should be the Neon pooled database URL. The host normally contains `-pooler`.
- `DIRECT_URL` should be the Neon direct database URL. The host normally does not contain `-pooler`.
- `TEST_DATABASE_URL` should point to a separate Neon test branch or test database, using the pooled URL.
- `TEST_DIRECT_URL` should point to the same test database, using the direct URL.

The test database must be separate from the development and production database. Playwright tests reset and seed data, so do not point test variables at production.

## Installation

Install dependencies from the repository root:

```bash
pnpm install
```

Generate the Prisma client:

```bash
pnpm --filter @repo/db db:generate
```

## Database Setup

Push the Prisma schema to the development database:

```bash
pnpm --filter @repo/db db:push
```

Seed the development database:

```bash
pnpm --filter @repo/db seed
```

Open Prisma Studio for the development database:

```bash
pnpm --filter @repo/db studio
```

## Local Development

Run the web app locally:

```bash
pnpm --filter @repo/web dev
```

The web app runs on:

```text
http://localhost:3001
```

## Demo Accounts

Seeded admin account:

```text
Email: admin@thomasstore.com
Password: admin123
Role: ADMIN
```

Customers can register through the `/register` page in the UI.

## Mock Checkout

Checkout uses a mock payment flow only. No real payment is processed.

Successful test card:

```text
4242 4242 4242 4242
```

Any other card number is treated as declined.

## Testing

Type check the web app:

```bash
pnpm --filter @repo/web check-types
```

Type check the database package:

```bash
pnpm --filter @repo/db exec tsc
```

Type check the Playwright tests:

```bash
pnpm --filter @repo/playwright exec tsc --noEmit
```

Run the B2C Playwright E2E suite:

```bash
pnpm --filter @repo/playwright test:b2c
```

Important testing note:

- The B2C Playwright tests use `TEST_DATABASE_URL` and `TEST_DIRECT_URL`.
- The tests reset and seed data for reliability.
- Do not run Playwright tests against the production database.
- The B2C test command uses the B2C Playwright config and does not rely on the old assignment tests.

## API Documentation

API documentation is available here:

[docs/API.md](docs/API.md)

The API documentation includes available endpoints, HTTP methods, authentication requirements, request bodies, example responses, database tables affected, and limitations.

## Deployment

Thomas Store is designed to deploy on Vercel.

Deployment notes:

- Vercel should use `apps/web` as the web app location.
- The production database is Neon PostgreSQL.
- Vercel needs `DATABASE_URL` and `DIRECT_URL` environment variables.
- `DATABASE_URL` should be the Neon pooled production URL.
- `DIRECT_URL` should be the Neon direct production URL.
- `TEST_DATABASE_URL` and `TEST_DIRECT_URL` are only for local and CI tests.
- Do not run `db:push` automatically at app runtime.
- Push the schema and seed data intentionally using local or CI commands before relying on production data.

Useful production preparation commands:

```bash
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:push
pnpm --filter @repo/db seed
Warning: the seed command resets demo data. Do not run it on a production database unless you intentionally want to reset the demo store data.
```

## Continuous Integration

GitHub Actions runs the B2C Store CI workflow on push and pull request.

The CI workflow:

- Installs dependencies with pnpm.
- Generates the Prisma client.
- Prepares the test database.
- Type checks the database package.
- Type checks the web app.
- Type checks the Playwright tests.
- Installs Playwright Chromium.
- Runs the B2C Playwright test suite.

Required GitHub Actions secrets:

```text
DATABASE_URL
DIRECT_URL
TEST_DATABASE_URL
TEST_DIRECT_URL
```

## Limitations

- Checkout is mock-only and does not process real payments.
- Product images are stored as URL strings.
- The API is intended for this app, not as a public third-party API.
- Admin accounts are seeded or managed through the database, not public registration.
- Public registration always creates `CUSTOMER` users.
- Playwright tests reset the test database, so they must use a separate test database.

## Submission Notes

This project is focused on the completed B2C Store application, not the old blog assignment tests. The main validation command for the completed project is:

```bash
pnpm --filter @repo/playwright test:b2c
```
