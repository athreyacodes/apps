# Apps

Public toolbox at `apps.athreya.codes`. GitHub: `athreyacodes/apps`. Firebase Hosting project and site: **`apps-athreya-codes`**.

This repo is Angular only: `shell`, `weather`, `markets`, `blogs`, plus `libs/ui`, `libs/tokens`, `libs/seo`. Node BFF and Go ops are not in this repo.

## Hosting

One Firebase Hosting site. `tools/hosting` builds the apps and copies them into `dist/hosting`:

| Path          | App      |
| ------------- | -------- |
| `/`           | shell    |
| `/weather/**` | weather  |
| `/markets/**` | markets  |
| `/blogs/**`   | blogs (SSG; missing slugs → `/blogs/404.html`) |

CI: GitHub OIDC → GCP WIF (`tools/gcp/setup-wif.sh`). `deploy.yml` deploys the live channel. `preview.yml` deploys a Hosting preview channel per PR. No service-account JSON.

Local: `npx nx serve shell` (port 4200). Weather, Markets, and Blogs are in-shell routes. Production still ships the apps as path-composed Hosting. Blogs is prerendered; do not SPA-rewrite it to `index.html`.

## Rollback

Firebase console → Hosting → site `apps-athreya-codes` → Release history → Rollback.
