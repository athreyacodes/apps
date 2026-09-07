---
title: A shell is not a folder
tagline: The host owns nav, auth, and the route table. Remotes own a feature.
description: How to split an Angular micro frontend so the shell stays a host, not a junk drawer of remotes.
date: '2026-03-27'
mainTag: angular
tags: [frontend, micro-front-end]
draft: false
---

## **What** was the situation

On a workflow product the surface was micro frontends because the team and the product were too big for one deployable. A shell loaded remotes. Module Federation made that possible. The failure mode was treating the shell like a folder named `shell` that also contained half of every feature, "just for convenience".

Then you do not have micro frontends. You have a monolith with a remote extra step. A platform-era product with several apps in Nx has the same fork: either the shell is a host, or every product is secretly the shell.

A shell is a runtime. It owns the thing every remote would otherwise copy: chrome, session, routing into a remote, maybe a toast. It does not own the case list, the digest builder, or the detection inbox.

## **When** does this apply

Use this when more than one Angular app has to appear as one product.

- A workflow product with independently deployed areas.
- An email-security platform of products that share a top nav and a login.
- A team split that maps to remotes, not to folders in one app.

Skip this for How, or any single app that prerenders. Federation is cost. Do not pay it for a blog.

## **How** is it done

Write down what the shell is allowed to import. If the list includes a feature service from a remote, stop.

```text
Shell owns
  layout, nav, auth token, route map, loading slot

Remote owns
  its routes, its feature state, its API calls for that feature
```

The route map in the shell is a contract, not a copy of the remote’s routes:

```ts
{
  path: 'cases',
  loadChildren: () => loadRemoteModule({
    type: 'module',
    remoteEntry: 'https://cases.example/remoteEntry.js',
    exposedModule: './Routes'
  }).then((m) => m.remoteRoutes)
}
```

The remote exposes routes, not a grab-bag of components for the shell to arrange. The shell has a slot. The remote fills it.

Auth: the shell gets the session. Remotes read it from a shared library, not by implementing login again. If each remote has its own interceptor with a different token key, you will spend a week on "works in the remote’s standalone serve".

Nav: the shell renders it. Remotes can register a label through a small contract if they must. They should not render a second header.

## Watch out for

Do not share a component library by federating it as a remote. Share it as an Nx lib. Federation is for a deployable surface, not for a button.

Do not let remotes import the shell. That arrow only points one way. The moment a remote needs a shell service, that service belongs in a lib both already depend on.
