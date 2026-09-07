---
title: One repo when you ship several products
tagline: The products share a platform. The repo should too.
description: How an Nx monorepo earns its keep when several Angular products share libraries, tooling, and a release cadence.
date: '2026-03-13'
mainTag: angular
tags: [frontend, micro-front-end]
draft: false
---

## **What** was the situation

On a workflow product we already had more than one front-end surface: a shell, remotes, email-related UI, a team that needed the same buttons to look the same. Separate repos meant separate Angular versions, separate lint, a shared library published as a package we were scared to bump.

On an email-security platform the next-gen surface is several products. Same company, same design language, same auth story, different entry routes. An Nx monorepo is how that stays one platform instead of a handful of SPAs that drift.

The point of the repo is not "we use Nx". It is that a button change, a token change, or an Angular migration has one place to happen.

## **When** does this apply

Use this when two or more Angular apps share more than a colour.

- Several products, one design system, one auth client, one CI.
- Micro frontends that should not each own a copy of the shell chrome.
- A platform team that has to migrate Angular in order, not in five uncoordinated repos.

Skip this for a single public site like How. A monorepo would be a costume. One app, markdown in, HTML out.

## **How** is it done

Put the products next to the libraries they share. Nx is the graph: apps depend on libs, libs declare what they are allowed to depend on. The CI runs what changed.

A shape that has survived both MFE-scale and platform-scale products looks like this:

```text
apps/
  shell/
  product-a/
  product-b/
libs/
  ui/           # dumb components, tokens
  auth/         # session, interceptors
  data-access/  # API clients, not components
```

Generate apps and libs with Nx so the `project.json` and the lint boundaries exist on day one. Do not invent a folder and hope `tsconfig` paths stay honest.

The rule that makes it worth it: a product app may import a lib. A product app may not import another product app. Shared code goes down into a lib, or it is not shared.

Local serve is one product at a time when you can. The graph is there so `nx serve product-a` does not boot the universe. CI is `nx affected`, which is a different note.

Versioning is the repo version, not five private npm packages you forget to publish. If a lib is only consumed inside this workspace, do not publish it. Path aliases are enough.

## Watch out for

Do not make `libs/shared` a dumping ground. Six months later every product imports "shared" and you have a monolith with extra steps. Name libs after a job: `ui`, `auth`, `seo`, not `common2`.

Do not run five Angular versions in one workspace to avoid a migration. The monorepo is how you migrate once. Multiple versions is how you migrate forever.
