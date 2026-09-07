---
title: inject() is the constructor now
tagline: Skip the constructor. Keep state in a signal.
description: A standalone component can take what it needs with inject. Local UI state belongs in a signal.
date: '2026-02-06'
mainTag: angular
tags: [frontend]
draft: false
---

## **What** was the situation

I used to open a component, write a constructor, and inject three services as parameters. It worked. It also meant a constructor that did not construct anything. It was just a wiring block.

On How, the note page already got its post from a resolver. The component only needed a couple of tokens, plus whatever the person on the page just changed — a selected tag, a toggle.

`inject` reads a token at creation time. Same moment a constructor parameter would have been filled in. You can call it in the field initializer. No constructor required.

And if the thing you are holding is UI state, a signal is the honest place for it. The template can just read the current value.

## **When** does this apply

Use this on standalone components and routes that are mostly a view plus a little local state.

- A list page with a filter chip. The filter is local. It does not belong in a store.
- A note page that already got its post from a resolver. The component should not fetch it again in `ngOnInit`.
- Any component where the constructor would only have assigned `this.foo = foo`.

Skip it if you need to run logic with several injected values before the first change detection. A constructor is still fine then. I just do not start there any more.

## **How** is it done

Take what the component needs with `inject`. Keep the field private if the template does not use it.

```ts
export class Home {
  private readonly posts = inject(Posts);
  protected readonly tag = signal<Tag | null>(null);
}
```

`posts` is data. `tag` is the filter the person clicked. Two different jobs, so two different kinds of fields.

Keep UI state in a signal so the template can stay a read of current values. A `computed` list is enough when the filter is local:

```ts
protected readonly list = computed(() => {
  const tag = this.tag();
  return this.posts.all.filter((post) => !tag || post.tags.includes(tag));
});
```

When `tag` is `null`, show everything. When it is `'angular'`, show notes that have that tag. The list updates because it is computed from a signal. No `OnInit`. No manual subscription.

The route already resolved what the page needs. The component only holds what the user just changed.

## Watch out for

Do not call `inject` inside the `computed`. The computed runs later, outside the creation context. Inject once on the class, then read it inside the computed.

Do not mirror the same value in a signal and a plain field. Pick one. If the template needs to react, it is a signal.

And if the data comes from the router, trust the resolver. Fetching the same post again in the component is how you get a flash of empty and two sources of truth.
