---
title: Inputs that are already signals
tagline: The parent already has a signal. Stop unpacking it in the child.
description: How input, output, and model replace decorator inputs when a shared card has to react to the parent.
date: '2026-01-30'
mainTag: angular
tags: [frontend]
draft: false
---

## **What** was the situation

On an email-security platform, the same card shows up in more than one product: a detection summary, a status chip, a "open this" button. On a workflow product it was the same idea — a case card in the shell and in a remote.

The parent already held the selected item in a signal. The child still took `@Input() item` as a plain value, then copied it into local state in `ngOnChanges`, then emitted `@Output() itemChange`. Three moving parts for "this card is this record, and the toggle on the card writes back".

Signal inputs are not a rename of `@Input`. They are the child reading a signal the parent already had. You stop unpacking.

## **When** does this apply

Use this on shared UI that has to stay current when the parent’s signal changes.

- A card in a design-system-ish library used by more than one remote.
- A chip that is both display and toggle: the parent owns the selection, the child draws it.
- A sidebar that receives the current entity as `input()` and emits a close as `output()`.

Skip this on a leaf that truly receives a static string once — a label, an icon name. A decorator input is still readable there. I still do not add `ngOnChanges` for it.

## **How** is it done

`input()` is a signal. Read it with `()`. When the parent binds a new value, the child already sees it. No `ngOnChanges`.

```ts
@Component({
  selector: 'app-note-card',
  template: `
    <article>
      <h2>{{ post().title }}</h2>
      <button type="button" (click)="open.emit(post().slug)">Open</button>
    </article>
  `,
})
export class NoteCard {
  readonly post = input.required<Post>();
  readonly open = output<string>();
}
```

The parent binds the signal’s value, or another signal, the usual way:

```html
<app-note-card [post]="selected()" (open)="go($event)" />
```

When the child should write back to the same value — a two-way checkbox, a selected chip — `model()` is the two-way signal. It is an input you can `set` or `update`, and the parent can use banana-in-a-box.

```ts
export class TagChip {
  readonly on = model(false);
}
```

```html
<app-tag-chip [(on)]="urgent" />
```

`urgent` on the parent can be a signal. The chip does not copy it. There is one value.

`output()` is a typed `emit`. It is not a signal. Do not try to `output()` a stream and subscribe in the parent "like RxJS". The parent handles the event. If you need a stream, keep RxJS at the edge, not in the output.

## Watch out for

Do not read `this.post` without `()`. It is the input signal, not the post. That mistake type-checks as a function and fails in the template in a confusing way.

Do not mix `@Input() post` and `post = input()` on the same name. Pick signal inputs on anything you are still touching.

And do not `model()` a large object if you only needed an `output` of one field. Two-way on a whole record is how two components fight over mutations.
