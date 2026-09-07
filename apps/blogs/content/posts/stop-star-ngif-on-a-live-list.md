---
title: Stop putting *ngIf on a live list
tagline: The new control flow is the template, not a directive you hide.
description: How @if, @for, and @empty replace *ngIf and *ngFor on a list that actually changes.
date: '2026-01-16'
mainTag: angular
tags: [frontend]
draft: false
---

## **What** was the situation

How’s home page is a list of notes and a row of tag chips. Click a chip, the list changes. Empty tag, show everything. No matches, say so.

I used to write that with `*ngIf` and `*ngFor` on the same region, plus a separate `*ngIf` for the empty state. It worked. It also meant two structural directives fighting over one view, a `trackBy` function I had to remember, and an empty state that was easy to forget.

The new control flow is not a prettier `*ngIf`. It is the template saying what the view is, in the order you actually think about it: if there is a list, show it; for each item, render the card; if the list is empty, say that.

## **When** does this apply

Use this on any template that branches and repeats — filters, inboxes, queues, settings panels.

- A product queue on an email-security platform: detections in, detections out, sometimes none.
- A workflow list on a workflow product: cases for this team, empty on a quiet morning.
- A public index like How: filter chips and a feed.

Skip this if you are in a library that still has to compile for an old Angular. The old micro-syntax is not gone from the world. It is gone from apps I start now.

## **How** is it done

Say the empty case next to the loop. `@empty` belongs to `@for`, so you cannot forget it in another `*ngIf` three lines down.

```html
@if (list().length === 0) {
<p class="empty">No notes match those filters.</p>
} @else {
<ul class="feed">
  @for (post of list(); track post.slug) {
  <li>
    <a [routerLink]="['/', post.slug]">{{ post.title }}</a>
  </li>
  }
</ul>
}
```

That `@if` is the "we have nothing" branch. Inside the list, `@for` needs a `track`. Use a stable id. `post.slug` does not change when the filter changes. `$index` does, and you will get DOM churn for no reason.

When the empty state is "this one list has no rows", `@empty` is cleaner than wrapping the whole block:

```html
@for (post of list(); track post.slug) {
<li>{{ post.title }}</li>
} @empty {
<li>No notes yet.</li>
}
```

`@if` / `@else if` / `@else` replace `ngSwitch` for the simple cases. You can read it top to bottom. You do not need a directive on the parent to make the children exist.

`*ngIf` as a micro-syntax is still legal. I do not reach for it on a live list any more. The new blocks are the view. The old ones were directives you attached to an element you did not really want.

## Watch out for

Do not nest `@if` inside `@for` to hide a row "the Angular 8 way" if a `computed` can drop the row before the template. Filter in the list. Render what is left.

Do not use `track $index` on a list people filter or reorder. Angular will reuse the wrong DOM node and you will swear the click handler is haunted.
