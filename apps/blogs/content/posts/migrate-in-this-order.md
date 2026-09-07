---
title: Migrate in this order or you will migrate twice
tagline: Standalone, then templates, then signals, then zoneless.
description: How to sequence an Angular migration on a federated product so each step can ship without undoing the last one.
date: '2026-01-09'
mainTag: angular
tags: [frontend, micro-front-end]
draft: false
---

## **What** was the situation

Once you admit the version bump is not the migration, someone still has to pick an order. On a workflow-style product that already had a shell and remotes, the tempting plan was "do it all in this release": standalone, new control flow, signals, zoneless, new builder.

That plan ships nothing. Every remote is half-migrated. The shell cannot federate a mix. You roll back the parts that hurt, and you have migrated twice.

Platform-era products look smooth because the order was already decided. The work is making an older federated app walk that same order, one step that can go to production.

## **When** does this apply

Use this when more than one of these is still true: NgModules own the tree, templates use `*ngIf`, state is not signals, Zone.js is still the intern.

- A shell plus remotes, and you cannot freeze the product for a quarter.
- A shared library that both old and new remotes import.
- A team that can land one kind of change per remote, not four.

Skip this if you are starting a new product in the Nx repo. Start on the new shape. There is nothing to sequence.

## **How** is it done

Ship this order. Do not skip ahead because a blog post made zoneless look easy.

1. **Standalone** — routes and components first, then the leftover NgModules. Federation still works. The unit of the app becomes the component, which every later step assumes.
2. **Control flow** — `@if` / `@for` in templates. Mechanical. Easy to review. Does not change how data moves.
3. **Signals** — local UI state, then `input()` / `output()`, then `inject()` instead of constructor wiring. The view starts telling the truth about what it reads.
4. **Zoneless** — last. Only when the view already updates because signals changed, not because Zone patched a timeout.

A remote can sit at step 2 while another is on step 3. The shell should be at least as far as the furthest remote it hosts, or you will debug "works in isolation, dead in the shell" for the wrong reason.

Keep a checklist per remote, not a platform-wide banner that says "we are on signals now". An earlier product taught me that the shell will lie for you. Platform-era Nx tags make the lie visible, but only if the remote actually finished the step.

```text
shell     ████ standalone ████ control flow ██░░░░ signals  ░░░░░ zoneless
remote-a  ████ standalone ████ control flow ████ signals    ░░░░░ zoneless
remote-b  ████ standalone ██░░░░ control flow
```

That picture is shippable. Four bars filled on every remote on the same Friday is not.

## Watch out for

Do not migrate the shared UI library to signal inputs while a remote still binds with `@Input` and `ngOnChanges` copies. Migrate the library one release after the last consumer can take `input()`.

Do not turn on zoneless in the shell to "get it over with". Every remote inherits that decision, including the one still mutating plain fields in a plugin callback.
