---
title: Teachers and donors are not the same user
tagline: Same API, different data. A donor does not get a child’s name.
description: How a Node API for a child-education NGO splits teacher and donor access so progress can be shared without leaking learners.
date: '2026-05-15'
mainTag: node
tags: [backend]
draft: false
---

## **What** was the situation

The same NGO API that stored learner photos had a second challenge: donors wanted to see that their money did something. Teachers needed names, attendance, notes to the family. Donors needed a progress story: reading level up, regular attendance, a first-name or an alias — not an address, not a photo URL, not a list of classmates.

The easy product is one `GET /learners/:id` and a front-end that hides columns. That is not access control. The donor’s browser, a proxy, a log, a support export will still see the name.

So the Node API had to pretend they were different resources, even when they were one child in the database.

## **When** does this apply

Use this when one record has audiences with opposite duties.

- Teachers (operational, identifiable) vs donors (narrative, minimised).
- NGO admins who can export vs volunteers who should not.
- Any "share progress" feature sitting next to a school register.

Skip this if there is only one role. Do not invent a donor view for a classroom tool nobody will fund that way.

## **How** is it done

Name the routes after the audience, not after the table.

```text
GET /teacher/learners/:id    → full record, if role is teacher for that school
GET /donor/learners/:id      → public progress DTO, if donor is linked to that learner
```

The donor DTO is a new shape. It is not the teacher shape with `undefined` fields.

```js
function toDonorProgress(row) {
  return {
    alias: row.alias,
    readingLevel: row.readingLevel,
    attendancePercent: row.attendancePercent,
    updatedAt: row.progressUpdatedAt,
  };
}
```

No `name`, no `photoKey`, no `guardianPhone`. If the front-end needs a picture, it gets an illustration, not `getLearnerPhotoUrl`.

Authorisation is a function that takes the viewer and the row, not a middleware that only checks `Authorization` is present.

```js
export function assertDonorMayView(viewer, row) {
  if (viewer.role !== 'donor') {
    throw Object.assign(new Error('forbidden'), { status: 403 });
  }
  if (!row.donorIds.includes(viewer.id)) {
    throw Object.assign(new Error('forbidden'), { status: 403 });
  }
}
```

Same status for "does not exist" and "exists but not yours" on donor routes. Teachers can have a 404 that tells them the id is wrong; they already have the register. Donors should not enumerate learner ids.

Admin export is a third route with an audit log. It is not `?role=admin` on the teacher handler.

## Watch out for

Do not reuse the teacher serializer and `delete` keys. The next field added to the learner table will leak on the donor endpoint until someone remembers.

Do not put donor and teacher data on one websocket "for live updates". Live is not an excuse for one payload.

And do not email donors a teacher CSV "just this quarter". That email is a copy of the register you cannot expire.
