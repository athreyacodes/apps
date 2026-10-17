# Apps

Nx workspace for [apps.athreya.codes](https://apps.athreya.codes). Angular apps on Firebase Hosting project `apps-athreya-codes`.

## Projects

| Project  | Role                      |
| -------- | ------------------------- |
| `shell`  | Site home (`/`)           |
| `tokens` | Design tokens + layers-ui |
| `seo`    | Shared titles and meta    |
| `ui`     | Shared page chrome        |

## Commands

```sh
nvm use
npm ci
npx nx serve shell
npx nx affected -t lint,build --base=origin/main --head=HEAD
npx nx run hosting:assemble
```

Locally, `nx serve shell` on port `4200` is the site. Production deploys that build to Firebase Hosting.

Preview/deploy use GitHub OIDC → GCP WIF (`tools/gcp/setup-wif.sh`), not a service-account JSON key.

## Next

Open work for this repo: [docs/next.md](docs/next.md).
