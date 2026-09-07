---
title: Remotes still need a route
tagline: Standalone serve is not the product. The shell’s URL is.
description: How an independently deployed Angular remote dies in the host when routing and auth contracts are implied instead of written down.
date: '2026-05-29'
mainTag: angular
tags: [frontend, micro-front-end]
draft: false
---

## **What** was the situation

Every workflow-product remote could `ng serve` on its own port and look finished. Module Federation made independent deploys possible. Then we loaded it in the shell and the route was blank, or the remote bounced to its own login, or the browser asked for a chunk on `localhost:4201` from a production host.

Platform-era products in an Nx monorepo hit the same class of bug: the remote is a citizen of the shell’s URL space. Independent deploy means independent _build_, not independent _address book_. If the contract is only in someone’s head, the standalone app will keep lying to you.

## **When** does this apply

Use this when a remote ships on its own pipeline and the shell loads `remoteEntry.js` from a URL.

- A cases remote under `/cases`, inbox under `/inbox`.
- Auth in the shell, API calls in the remote.
- A team that demos the remote on its own port and then "integrates on Friday".

Skip this if you do not federate. A library in Nx is not a remote. Do not give it a route table.

## **How** is it done

Write three contracts before the first independent deploy.

**1. Path.** The shell mounts the remote at a prefix. The remote’s router must use that prefix in the product, and a local prefix when serving alone.

```ts
export const remoteRoutes: Routes = [
  { path: '', loadComponent: () => import('./cases-page').then((m) => m.CasesPage) },
  { path: ':id', loadComponent: () => import('./case-page').then((m) => m.CasePage) },
];
```

In the shell: `path: 'cases', loadChildren: () => remoteRoutes`. Inside the remote, `routerLink` is `['/cases', id]` in production and something you swap for local serve. Relative links (`['id']`) survive both. Absolute links to `/` send people to the shell home, which is usually right, or to the remote’s fake home, which is not.

**2. Auth.** The remote does not host login. It reads the session from the shared auth lib the shell already provided. If the remote’s standalone serve needs a dummy token, that dummy lives in `environment.local.ts`, not in the federated bundle.

**3. Assets.** `remoteEntry.js` and chunks must be loaded from the remote’s deployed origin, not from the shell’s origin. Public path is part of the build. If you see the shell requesting `/chunk-ABC.js` and 404ing, the remote built as if it were the only app on the host.

A smoke test that matters: open `https://platform.example/cases/123` logged in, hard refresh. Not `localhost:4210/123` with a mock user.

## Watch out for

Do not lazy-load the remote from a hardcoded localhost URL in a file that ships. That PR will work on one laptop and fail in every other environment.

Do not give the remote a second router with `path: '**'` that swallows shell routes. Wildcard stays in the shell, or you will trap `/inbox` inside cases.

And do not "fix" auth by copying the login component into the remote so standalone serve feels real. You just created two sessions. Fix the dummy environment instead.
