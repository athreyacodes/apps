---
title: Affected is the CI
tagline: If tags are wrong, you either rebuild the world or skip a remote.
description: How Nx affected keeps a multi-product Angular monorepo honest in CI — and what happens when the graph lies.
date: '2026-05-22'
mainTag: angular
tags: [frontend, micro-front-end]
draft: false
---

## **What** was the situation

Once platform-scale products live in one Nx repo, CI cannot `build` everything on every PR. You will wait an hour and people will start pushing to main to "see it on the real pipeline".

`nx affected` is the deal: look at the graph, look at the diff, run the tasks that can break. Workflow-era MFE CI pain was the same idea without as nice a verb — you either built all remotes or you guessed.

The graph is only as good as the tags and the imports. Wrong tags, and affected lies in both directions.

## **When** does this apply

Use this when the workspace has more than one app and CI time is already a complaint.

- Several products, a shell, shared libs.
- PRs that touch tokens or `auth` and must rebuild every consumer.
- PRs that touch a README and must rebuild nothing.

Skip this for How. There is one app. `npm run build` is the CI.

## **How** is it done

CI should not say `nx run-many -t build --all` on a feature branch. It should say: relative to `main`, what is affected, then run lint, test, build on that set.

```bash
npx nx affected -t lint,test,build --base=origin/main --head=HEAD
```

That command is only trustworthy if:

1. Imports match reality (no deep relative paths that skip the project graph)
2. Tags forbid the imports you do not want (see the tags note)
3. `implicitDependencies` exist where a JSON file or a style token is not imported as code but still breaks consumers

Tokens are the usual miss. `libs/tokens` is CSS. Product apps consume it via a stylesheet include. Nx may not see an import. Then a token PR ships green and the shell is the wrong green on Monday.

```json
{
  "implicitDependencies": ["tokens"]
}
```

On the app’s project config, or a named group, so a token change marks products affected.

For MFE, the shell is affected when a remote’s public contract changes, not when the remote tweaks a private component. If every remote change rebuilds the shell, your "public API" of the remote is too fat — you exposed internals.

Cache is allowed. Nx cloud or local cache. Do not debug a flaky test by disabling affected. Disable the flake.

## Watch out for

Do not use `--all` on main and `affected` on PRs with different builders. You will ship a main that never ran what the PR ran.

Do not empty `implicitDependencies` because affected "felt random". Random means the graph cannot see a file. Find that file.

And do not skip a remote because it "cannot be reached from the shell". If it is a product you deploy, it needs its own affected path from its own app project, not only from the shell.
