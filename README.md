# Apps

Nx workspace for [apps.athreya.codes](https://apps.athreya.codes): Angular apps only.

Architecture and delivery plan: [docs/plan.md](./docs/plan.md). Genesis brief: [docs/genesis-prompt.md](./docs/genesis-prompt.md).

## Tooling

- Node from `.nvmrc` (22.22.3)
- Angular 22, zoneless
- Nx 23.1, npm, Prettier, ESLint module boundaries
- `layers-ui` via `libs/tokens`

## Projects

| Project   | Role                      |
| --------- | ------------------------- |
| `shell`   | Site home (`/`)           |
| `weather` | Weather UI (`/weather`)   |
| `markets` | Markets UI (`/markets`)   |
| `tokens`  | Design tokens + layers-ui |
| `seo`     | Shared titles and meta    |
| `ui`      | Shared page chrome        |

## Commands

```sh
nvm use
npm ci
npx nx serve shell
npx nx serve weather
npx nx serve markets
npx nx affected -t lint,build --base=origin/main --head=HEAD
npx nx run hosting:assemble
```

Local ports: shell `4200`, weather `4201`, markets `4202`. Production is one Firebase Hosting site with path compose.

Preview/deploy workflows use GitHub OIDC → GCP WIF, not a service-account JSON key. Bootstrap WIF with `tools/gcp/setup-wif.sh` (needs `gcloud`).
