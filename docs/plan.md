# Apps

Public toolbox at `apps.athreya.codes`. GitHub: `athreyacodes/apps`. Firebase Hosting project and site: **`apps-athreya-codes`**.

This repo is Angular only: `shell`, `weather`, `markets`, plus `libs/ui`, `libs/tokens`, `libs/seo`. Node BFF and Go ops are not in this repo.

## Hosting

One Firebase Hosting site. `tools/hosting` builds all three apps and copies them into `dist/hosting`:

| Path          | App      |
| ------------- | -------- |
| `/`           | shell    |
| `/weather/**` | weather  |
| `/markets/**` | markets  |

CI: GitHub OIDC → GCP WIF (`tools/gcp/setup-wif.sh`). `deploy.yml` deploys the live channel. `preview.yml` deploys a Hosting preview channel per PR. No service-account JSON.

Local: `npx nx serve shell` (port 4200). Weather and Markets are in-shell routes. Production still ships the three apps as path-composed Hosting.

## Rollback

Firebase console → Hosting → site `apps-athreya-codes` → Release history → Rollback.
