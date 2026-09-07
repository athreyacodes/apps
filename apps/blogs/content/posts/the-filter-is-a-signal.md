---
title: The filter is a signal, not a field you remember to update
tagline: Local UI state belongs in a signal. Derived lists belong in a computed.
description: How a writable signal and a computed list replace a field plus a manual refresh on a filter chip.
date: '2026-01-23'
mainTag: angular
tags: [frontend]
draft: false
---

## **What** was the situation

How’s home page has tag chips. The selected tag is local. It is not in a store. It is not a query param I needed to share with three other routes. It is "what did the person just click".

I used to keep that as a plain field, then remember to re-run a filter method, or push into a `BehaviorSubject` because "that is how Angular does async". Both were a lot of ceremony for a chip.

A writable signal is the selected tag. A `computed` is the list that falls out of it. The template reads both. Nobody calls `updateList()`.

## **When** does this apply

Use this when the state is on this page, and the view is a function of that state.

- Tag filter, search box, open/closed panel, selected row.
- A queue filter on an email-security product: this mailbox, this severity, last 24 hours — still local to the page until something else needs it.
- A workflow inbox on a workflow product: "my cases" vs "team cases" as a chip, not a global store.

Skip this when the value has to live across routes, tabs, or remotes. Then it is URL state or a real store. A signal on the component will reset when the component dies, and that is the point.

## **How** is it done

Hold the thing the user changed. Derive the thing the user sees.

```ts
export class Home {
  private readonly posts = inject(Posts);
  protected readonly tag = signal<Tag | null>(null);

  protected readonly list = computed(() => {
    const tag = this.tag();
    return this.posts.all.filter((post) => !tag || post.tags.includes(tag));
  });

  protected toggleTag(tag: Tag): void {
    this.tag.update((current) => (current === tag ? null : tag));
  }
}
```

`tag` is writable because a click writes it. `list` is computed because nothing should write it. If you find yourself assigning to `list`, you have two sources of truth again.

The template only reads:

```html
@for (post of list(); track post.slug) {
<li>{{ post.title }}</li>
}
```

`list()` is the current array. When `tag` changes, `list` changes, the view changes. No `async` pipe. No `subscribe` in `ngOnInit`. No `markForCheck` because you forgot Zone would not see a click from a third-party widget — that is a different note.

A `BehaviorSubject` is still right for a stream you do not own: a websocket, a polling search. For a chip, it is a subject pretending to be a field.

## Watch out for

Do not put an HTTP call inside the `computed`. Computeds should be cheap and synchronous. Fetch elsewhere, hold the result in a signal, let the computed filter that.

Do not keep `this.filtered = ...` next to the computed "for convenience". You will update one and read the other.
