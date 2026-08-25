# Apps

Nx workspace for [apps.athreya.codes](https://apps.athreya.codes): Angular apps + Node BFF.

Architecture and delivery plan: [docs/plan.md](./docs/plan.md). Genesis brief: [docs/genesis-prompt.md](./docs/genesis-prompt.md).

## Tooling

- Node from `.nvmrc` (22.22.3)
- Angular 22, zoneless, Vitest
- Nx 23.1, npm, Prettier, ESLint module boundaries

## Projects

| Project               | Role                                  |
| --------------------- | ------------------------------------- |
| `shell`               | Site home (`/`)                       |
| `weather`             | Weather UI (`/weather`)               |
| `markets`             | Markets UI (`/markets`) — later phase |
| `dashboard`           | Ops dashboard (`/dashboard`) — later  |
| `api-bff`             | Fastify BFF (`/api/**`)               |
| `contract-bff`        | Zod DTOs shared by BFF and Angular    |
| `data-access-weather` | Weather HTTP client                   |
| `tokens`              | Design tokens stub                    |
| `ui`                  | Shared page chrome                    |

## Commands

```sh
nvm use
npm ci
npx nx serve api-bff
npx nx serve weather
npx nx affected -t lint,test,build --base=origin/main --head=HEAD
npx nx run hosting:assemble
```

Weather locally talks to the BFF at `http://localhost:3000`. Production uses same-origin `/api`.

Preview/deploy workflows use GitHub OIDC → GCP WIF, not a service-account JSON key. Bootstrap WIF with `tools/gcp/setup-wif.sh` (needs `gcloud`).
