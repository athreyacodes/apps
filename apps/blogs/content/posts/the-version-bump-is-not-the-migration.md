---
title: The version bump is not the migration
tagline: New Angular is a different app, not a bigger number.
description: Bumping Angular on a workflow-era product does not give you the platform-era app shape — you still have to change how the app is built.
date: '2026-01-02'
mainTag: angular
tags: [frontend]
draft: false
---

## **What** was the situation

On a workflow product we had a working Angular app. Micro frontends, a shell, remotes, a team that knew the patterns. The version number moved. The app shape did not.

Then I opened a next-gen email-security platform: standalone APIs, signals, new control flow, an Nx monorepo that expected libraries to be honest about their edges. Same framework name. Not the same kind of app.

The trap is treating that as `ng update` and a weekend. A version bump updates packages. A migration changes what a component is allowed to be. If you only bump, you get a new compiler complaining about an old architecture.

## **When** does this apply

Use this when you are staring at an Angular product that still boots through modules, still templates with `*ngIf`, and still treats Zone.js as the thing that "just updates the screen".

- You inherited a federated app from a few years ago and the ticket says "upgrade Angular".
- You are joining a platform repo that already looks like current Angular, and you need to explain why the old product cannot copy-paste in.
- You want a shared UI library to work in both trees, and it will not, because one tree is still NgModule-shaped.

Skip this if the app is already standalone, already on the application builder, and you are only picking up a patch release. That really is a bump.

## **How** is it done

Write down the shape you are leaving, not the version you are leaving.

```text
Old shape                          New shape
---------                          ---------
NgModule is the unit               The route / component is the unit
Constructor wiring                 inject() in the field
*ngIf / *ngFor                     @if / @for
Zone.js patches the world          You tell Angular what changed
Webpack plus custom federation     Application builder, then federation on top
```

The left column is a workflow-era product I would still recognise. The right column is what a platform-era product assumes. You cannot stand on the left and consume libraries written for the right without a real migration. The version in `package.json` will lie to you until the column matches.

So the first deliverable is not a green build. It is a one-page map: what still owns NgModules, what is already standalone, what the shell federates, what the design tokens assume. Then you migrate in an order. That order is a different note.

Until the shape matches, treat "we are on Angular N" as a package fact, not an architecture fact.

## Watch out for

Do not share a "common" NgModule library into a standalone remote and call that progress. You have glued the old shape onto the new one. The next person will have to cut it apart.

Do not schedule zoneless in the same release as the version bump. Zoneless needs you to already mean your updates. The old shape does not.
