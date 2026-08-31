# Apps

Nx workspace for [apps.athreya.codes](https://apps.athreya.codes). Angular apps on Firebase Hosting project `apps-athreya-codes`.

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
npx nx affected -t lint,build --base=origin/main --head=HEAD
npx nx run hosting:assemble
```

Locally, `nx serve shell` on port `4200` is enough. Weather and Markets are routes in the shell, and also separate apps for Hosting path compose.

Preview/deploy use GitHub OIDC → GCP WIF (`tools/gcp/setup-wif.sh`), not a service-account JSON key.
