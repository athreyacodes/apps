# Apps

Nx workspace for [apps.athreya.codes](https://apps.athreya.codes): Angular apps + Node BFF.

Architecture and delivery plan: [docs/plan.md](./docs/plan.md). Genesis brief: [docs/genesis-prompt.md](./docs/genesis-prompt.md).

## Tooling

- Node from `.nvmrc` (22.22.3)
- Angular 22, zoneless, Vitest
- Nx 23.1, npm, Prettier, ESLint module boundaries

## Projects

| Project     | Role                         |
| ----------- | ---------------------------- |
| `shell`     | Site home (`/`)              |
| `weather`   | Weather UI (`/weather`)      |
| `markets`   | Markets UI (`/markets`)      |
| `dashboard` | Ops dashboard (`/dashboard`) |
| `api-bff`   | Node BFF (`/api/**`)         |
| `tokens`    | Design tokens stub           |
| `ui`        | Shared page chrome stub      |

## Commands

```sh
nvm use
npm ci
npx nx serve shell
npx nx affected -t lint,test,build --base=origin/main --head=HEAD
```

Phase 0 is skeleton only: no production traffic, no preview/deploy workflows yet.
