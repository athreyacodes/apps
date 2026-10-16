# Apps

Public toolbox at `apps.athreya.codes`. GitHub: `athreyacodes/apps`. Firebase Hosting project and site: **`apps-athreya-codes`**.

This repo is Angular only: `shell`, plus `libs/ui`, `libs/tokens`, `libs/seo`. Node BFF and Go ops are not in this repo.

## Hosting

One Firebase Hosting site. `tools/hosting` builds the apps and copies them into `dist/hosting`:

| Path | App   |
| ---- | ----- |
| `/`  | shell |

CI: GitHub OIDC → GCP WIF (`tools/gcp/setup-wif.sh`). `deploy.yml` deploys the live channel. `preview.yml` deploys a Hosting preview channel per PR. No service-account JSON.

Local: `npx nx serve shell` (port 4200). Production ships the shell build as the Hosting site.

## Rollback

Firebase console → Hosting → site `apps-athreya-codes` → Release history → Rollback.
