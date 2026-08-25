# Platform genesis prompt

Living architecture: [docs/plan.md](./plan.md). This file stays the genesis prompt.

Agent brief to produce an architecture + delivery **plan** (not the implementation). After the plan exists, maintain it as `docs/plan.md`. This file is the genesis prompt, not the living architecture doc.

No React. Angular apps, Node.js backend, Go service. The plan must challenge whether Node and Go belong in this Nx repo or in a sibling repo.

---

# Goal

Write an architecture + delivery PLAN (not the implementation) for a public showcase platform: an Nx monorepo of Angular apps, a Node.js backend, and a Go service, with efficient CI/CD.

This is a portfolio of architecture capability. Prefer real production patterns over demo theatre. Every app should do something useful.

This turn: plan only. No workspace generation.

---

# Who I am / constraints

I am Athreya, a frontend architect. Public work that MUST stay in its own repos:

- Portfolio: Angular 22 SSG, Firebase Hosting, `athreyacodes/portfolio`, athreya.codes
- How: Angular 22 SSG blog, Firebase Hosting, `athreyacodes/how`, how.athreya.codes
- layers-ui: CSS tokens/utilities. Platform apps consume these (and/or a thin `libs/tokens` wrapper). Do not rebuild a mega component library.

Existing GitHub + Firebase projects. New repos / Firebase projects / Cloud Run services are allowed if justified.

This repo: github.com/athreyacodes/platform — use this as the Angular (and possibly Node) workspace unless there is a strong reason not to.

Public notes that are architecture rules, not inspiration:

- One repo when several products share a platform. Skip a monorepo for a single SSG site like How.
- Apps depend on libs. Apps never import other apps. Named libs by job: ui, auth, data-access, tokens. No `libs/shared` junk drawer.
- Nx module-boundary tags are enforced in CI: type:app / type:ui / type:data-access / type:api plus scope tags. If lint is skipped, we do not have tags.
- CI is `nx affected` vs origin/main. Not `run-many --all` on every PR. implicitDependencies for CSS tokens and other non-import edges.
- A shell is a host (nav, session, route map). Products own features. Do not federate a component library.
- Share tokens, not a fat widget dump.
- If we federate later, remotes still need an explicit path / auth / asset-URL contract.
- MCP belongs in front of APIs we already have — optional later, not a v1 product.
- Backend DTOs per audience. Do not "hide columns" on the client.
- Greenfield Angular 22: standalone, new control flow, signals, zoneless from day one. No migration sequence.
- Node for BFFs / HTTP APIs that Angular calls every day.
- Go for a small operational service (and/or CLI). Honest binaries, flags, exit codes. Do not wrap a tiny Go job in an Nx plugin if that plugin is bigger than the job.

Do not name real employers in the plan or future public READMEs beyond what the portfolio already states.

No React. Angular only on the frontend.

---

# Challenge: should Node and Go live in this Nx repo, or elsewhere?

Do not default to "everything in one Nx workspace because it is a platform." Win this decision in a table: option → what affected/CI/deploy looks like → what a hiring manager clones → what we skip.

Options to compare (you may merge 2+3 if that is cleaner, but do not invent a fourth without a reason):

A. One polyglot Nx repo: Angular apps + Node API + Go service, all as Nx projects.
B. Nx repo = Angular + Node. Go is a sibling repo with its own go.mod and GitHub Actions.
C. Nx repo = Angular only. Sibling `platform-api` repo holds Node and Go together (two modules or one backend workspace).

Lean, unless the plan proves otherwise:

- Angular + Node in `platform` (Nx). Weather/markets UI and the BFF should change in one PR. @nx/node is first-class. TypeScript imports make affected honest. OpenAPI or shared DTO generation can live next to the clients.
- Go in a sibling repo (`platform-ops` or similar). The ops Angular app is just an HTTP client. Go does not get a real Nx graph unless we maintain project.json by hand; `run-commands` wrapping `go test` is costume. A small Go service with setup-go, `go test ./...`, and a Cloud Run Dockerfile is the more honest showcase — and matches "small Go still earns its keep."

When that lean is wrong (the plan must say so if it disagrees):

- Keep Go in Nx if ops UI and ops API will ship as one cadence forever and you will actually model Go projects, tags, and implicitDependencies — not a fake project.json.
- Put Node in a sibling api repo if the BFF is several services with its own release train and Angular only consumes public HTTP. That costs "one PR for cache TTL + weather card."

Hard rules whichever way you pick:

- Browser never holds provider API keys. Weather and markets go through Node.
- Go owns ops: GitHub pushes/Actions, domain/subdomain checks. Not a second Node service "because we already have Node."
- Contracts between repos (if split) are versioned: OpenAPI or a checked-in JSON schema. Angular data-access libs do not scrape HTML.
- Each repo has CI that only does work that repo can affect. Do not npm ci on a Go-only repo. Do not setup-go on a CSS-only Angular PR.
- Do not use a monorepo to hide three READMEs with no graph.

---

# Decide these (pick a side, with why)

1. Repo split — A, B, or C above, after the challenge. Default B.

2. Shell vs independent apps
   - Platform shell (chrome, nav, route table) plus product apps that serve alone and compose in the shell.
   - v1: independent Nx apps on subdomains (or paths) sharing libs. That is enough.
   - Module Federation is phase-later, only if we need independent _deploy_ of remotes. Not because three demo apps need federation on day one.

3. Node
   - One Node process for v1: weather + markets (+ any public BFF routes). Cache, rate-limit, stable DTOs.
   - Split Node services only when deploy cadence or blast radius needs it.
   - Cloud Run preferred (same shape as Go). Cloud Functions 2nd gen only if the plan argues it is simpler with existing Firebase.

4. Go
   - Small HTTP service for ops JSON. Optional tiny CLI later for the same checks. Not a framework dump.
   - Cloud Run. Not Firebase Functions.
   - Auth for ops: GitHub OAuth or a single allowlisted identity. Public weather/markets stay unauthenticated.

5. Hosting
   - Frontends: Firebase Hosting. Multiple sites in one Firebase project unless isolation is worth extra projects.
   - Subdomains under a platform domain if available; otherwise firebaseapp.com + a documented custom-domain follow-up.
   - PR preview channels for frontends (already used on How/portfolio).
   - Backend previews: tagged Cloud Run revisions, or skip until needed — say which.

---

# Product apps (v1 — small and real)

Propose names, URL shape, which API, auth, empty/error states, and what we will NOT build.

Must-haves:

1. Platform shell / home — what this platform is, links to products. Not a clone of athreya.codes.
2. Weather — Open-Meteo or similar (prefer no vendor key). City search, current + short forecast. Node BFF with cache.
3. Markets — TOS-friendly public market API (document the choice). Small watchlist. Node BFF with cache. No scraping paid terminals.
4. Ops dashboard (Angular) — recent pushes and GitHub Actions for my public repos (platform, how, portfolio, layers-ui, and the Go repo if split), plus domain/subdomain status for sites I actually run. Consumes the Go API. Protected.

Phase 2+, not v1: Module Federation, MCP in front of Node/Go, anything from How/portfolio except tokens via layers-ui.

---

# Workspace shape

Concrete tree for each repo you chose. Example if default B:

```
platform/                    # Nx
  apps/
    shell/
    weather/
    markets/
    ops/
    api-bff/                 # Node
  libs/
    tokens/
    ui/                      # tiny: chip, page frame
    auth/
    data-access-weather/
    data-access-markets/
    data-access-ops/         # HTTP client for the Go API

platform-ops/                # Go module, sibling repo
  cmd/api/
  internal/...
  Dockerfile
```

If you pick A or C, draw that tree instead and show how tags/CI still work.

For every Nx project: tags, allowed dependencies, env owners, implicitDependencies (especially tokens).

Tooling: Angular 22, current stable Nx, ESLint + @nx/enforce-module-boundaries, one formatter, unit tests (Jest or Vitest — pick). e2e only where it proves a contract (shell routing, BFF cache headers). Go: go test, go vet, gofmt in that repo's CI.

---

# CI/CD and performance

Be specific enough to implement without guessing.

Graph and affected (Nx repo)

- nx affected -t lint,test,build vs origin/main
- Same builders on PR and main (do not --all on main and affected on PRs)
- implicitDependencies for tokens, firebase.json, shared env schema
- Parallelism only if it saves real minutes

Cache

- Local Nx cache
- Remote: Nx Cloud vs Actions cache of .nx/cache — pick with cost/privacy
- Docker layer cache for Cloud Run images (Node and Go)

Install / build

- npm ci + lockfile. Keep npm unless there is a real reason to switch (other public repos use npm).
- Node version from .nvmrc, same locally and CI
- Angular application builder (esbuild), budgets, source-map policy
- CSR vs SSG per app: do not prerender authenticated ops. Weather/markets: pick CSR or SSG and say why.
- Optional bundle-stats artifact on affected frontends

Test

- Affected unit tests on PRs
- Main builds artifacts that will actually deploy
- No live weather/markets calls in CI — mock upstreams
- Go tests in the Go repo's workflow

Lint

- Module boundaries required in Nx CI
- format check
- Go fmt/vet in Go CI

Deploy

- Deploy only affected apps (Nx project → Firebase site or Cloud Run service)
- Frontends: production on main; PR preview channels
- Backends: Cloud Run on main; images tagged with git sha
- Laptop deploy is not the documented path
- Secrets: prefer GitHub OIDC → GCP. How/portfolio already use Firebase service-account JSON — document keep vs Workload Identity Federation
- Rollback: previous Cloud Run revision; Firebase Hosting rollback note
- If two repos: two workflows, no fake umbrella pipeline. Document the order (API first vs UI first) only where the contract actually breaks

Name the workflow files and jobs.

Do not pile Nx Cloud, federation, and backend previews into phase 0.

---

# Firebase / GitHub inventory to fill in

- Confirm `athreyacodes/platform` vs a new name
- Go repo name if split
- Firebase project(s), hosting site IDs, custom domain plan
- GCP project for Cloud Run vs Firebase-only
- GitHub environments and required secrets
- Repos the ops dashboard watches

Prefer fewer Firebase projects with multiple hosting sites unless isolation is worth it. I can create new projects and repos.

---

# Phases

Phase 0 — Nx skeleton, tags, CI affected (lint/test/build, no deploy), empty Angular apps.
Phase 1 — Node BFF + weather app, deployed.
Phase 2 — markets + shared tokens.
Phase 3 — Go ops API (in whichever repo we chose) + Angular ops dashboard with auth.
Phase 4 — budgets, remote cache, preview deploys, README that is the architecture story (including why Go is or is not in Nx).
Phase 5 (optional) — federation or MCP.

Each phase: exit criteria, what is in production, what CI does.

---

# Plan document format

1. Decisions (table: question → choice → why → we skipped)
2. The Node/Go repo challenge (the comparison table, then the pick)
3. Repo and project graph (tree + tag constraints)
4. Products and APIs (per app: UX, data, auth, URL)
5. Backend contracts (routes, DTOs, cache, rate limits, secrets)
6. CI/CD per repo (workflows, affected, cache, deploy mapping, secrets)
7. Hosting and DNS
8. Performance budget
9. Risks (graph lies, token implicitDeps, API TOS, GitHub rate limits, leaking Actions logs, split-repo contract drift)
10. Phases
11. Non-goals: do not merge how/portfolio; no React; no UI scraping; no API keys in Angular; no CMS; no Go-in-Nx costume if we chose a sibling repo

Be opinionated. If two options are close, pick one.

Ask me only what actually blocks the plan: domain name, Nx Cloud yes/no, confirm `athreyacodes/platform` is empty and usable. Everything else, decide.
