---
title: Tags are the build graph
tagline: If a remote can import another remote’s internals, Nx did not save you.
description: How Nx module-boundary tags keep Angular libraries and micro frontends from depending on the wrong things.
date: '2026-04-17'
mainTag: angular
tags: [frontend, micro-front-end]
draft: false
---

## **What** was the situation

An Nx monorepo at platform-scale has a lot of arrows. Product apps, a shell, UI libs, data-access libs. Without tags, `nx lint` will not stop a remote from importing another remote’s `internal/foo` helper. You find out in a production deploy when the helper moved.

On a workflow product we felt the same pain without as much Nx vocabulary: one remote reached into another because the path was there. The graph in your head was not the graph in the repo.

Tags are how you write the graph down so CI can argue with you.

## **When** does this apply

Use this once you have more than one app and one lib in the workspace.

- Micro frontends that must not import each other.
- A `data-access` lib that must not import a component.
- A `ui` lib that must not import an API client.

Skip this on a single-app repo. You will invent tags for a graph that is one node.

## **How** is it done

Give every project a tag that says what it is, and a constraint that says what it may depend on.

```json
{
  "projects": {
    "shell": ["type:app", "scope:shell"],
    "cases": ["type:app", "scope:cases"],
    "ui": ["type:ui", "scope:shared"],
    "auth": ["type:data-access", "scope:shared"]
  }
}
```

Then tell ESLint the rules. Apps may depend on libs. Libs may not depend on apps. `scope:cases` may not depend on `scope:inbox`. Shared scopes are the only ones everyone may import.

```json
{
  "depConstraints": [
    { "sourceTag": "type:app", "onlyDependOnLibsWithTags": ["type:ui", "type:data-access"] },
    { "sourceTag": "type:ui", "onlyDependOnLibsWithTags": ["type:ui"] },
    { "sourceTag": "scope:cases", "notDependOnLibsWithTags": ["scope:inbox"] }
  ]
}
```

The last line is the MFE rule. Cases and inbox are remotes. They talk through the shell or through a shared lib, not through each other’s folders.

When someone adds an import that violates a tag, the lint fails on the PR. That is the whole feature. If you skip the lint in CI, you do not have tags. You have comments.

Name tags after a job and a boundary, not after a team that will rename next quarter. `scope:cases` survives a reorg. `scope:team-blue` does not.

## Watch out for

Do not add `type:util` and let everyone depend on it. That is `shared` with a new name. Split the util when two products need different halves.

Do not fix a boundary violation by copying the file into both remotes "for now". You will change one copy. Use a shared lib or duplicate on purpose with a comment that it is a fork.
