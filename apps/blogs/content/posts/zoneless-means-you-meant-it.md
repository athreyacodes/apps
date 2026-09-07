---
title: Zoneless means you meant the update
tagline: Zone.js will not patch the click for you any more.
description: How to run Angular without Zone.js so only signal writes and explicit marks update the view.
date: '2026-02-13'
mainTag: angular
tags: [frontend]
draft: false
---

## **What** was the situation

Zone.js was the quiet intern on every Angular app I shipped on a workflow product. A click, a `setTimeout`, a HTTP callback — Zone patched it, Angular ran change detection, the screen caught up. You could be sloppy and the intern would still file the paperwork.

A platform-era product does not want that intern. Zoneless means: if a signal did not change, and you did not mark the view, nothing happens. That is the point. It is also why a "working" widget from 2020 goes dead after you flip the flag.

I hit this on third-party chrome — a date picker, an analytics callback, a `setTimeout` that mutated a plain field. Zone used to notice. Zoneless does not.

## **When** does this apply

Use this when the app is already on signals for local state, OnPush (or default with signals) for views, and you are ready to own every update.

- A new product in an Nx monorepo that never needed Zone.
- An existing remote you are migrating, after standalone and signals, not before.
- A public SSG site like How, where there is almost no async chrome.

Skip this if you still patch the DOM from jQuery-shaped plugins and nobody has time to wrap them. Flip zoneless last. If you flip it first, every silent update becomes a bug ticket.

## **How** is it done

Tell Angular you will mean it. In a standalone bootstrap:

```ts
bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection()],
});
```

After that, these update the view:

- A signal `set` / `update` the template reads
- `output` / event bindings that run in Angular’s zone-less event path
- `ChangeDetectorRef.markForCheck()` when you truly mutated something Angular cannot see
- Async pipe on an observable that emits (the pipe marks)

These used to update the view, and now do not, if they only mutate a plain field:

```ts
window.setTimeout(() => {
  this.label = 'Saved'; // zoneless: the view will not move
}, 0);
```

Make `label` a signal, or mark the view. The signal is the honest one:

```ts
window.setTimeout(() => {
  this.label.set('Saved');
}, 0);
```

Third-party widgets that call your callback outside Angular need the same treatment: write a signal in the callback, or run `markForCheck`. Do not "bring Zone back for this one component". You will never be sure which intern is on duty.

How barely notices zoneless, because the state is already signals. That is the real migration: zoneless is cheap when signals were the work.

## Watch out for

Do not test zoneless by clicking around the happy path. Click the thing that talks to a browser API: file input, `matchMedia`, `postMessage`, a chart library’s `onClick`. That is where Zone was covering you.

Do not mix `Default` change detection and zoneless as a strategy to "be safe". You want OnPush plus signals. Default plus zoneless still misses the mutations Zone used to catch, and you will think change detection is broken.
