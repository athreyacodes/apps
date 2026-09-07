---
title: Photos of children are not “just uploads”
tagline: A school photo is PII. Treat the file like a secret, not a static asset.
description: How a small Node API for a child-education NGO stores photos with consent, private objects, and signed URLs.
date: '2026-04-10'
mainTag: node
tags: [backend]
draft: false
---

## **What** was the situation

A side project for a child-education NGO: teachers needed to attach a photo to a learner record. Progress for sponsors, an ID-style picture for the classroom list. The first draft used the same pattern I would use for a blog banner — multipart upload, drop it in a public bucket, save the URL.

That is how a child’s face ends up on an unguessable-but-public URL, cached by a CDN, still there after the parent asked you to delete it. The NGO is not a CV employer. The risk is still real.

The challenge was not "accept a file". It was consent, private storage, no public ACL, strip EXIF (GPS on a phone photo is a location leak), and a URL that expires.

## **When** does this apply

Use this when the file is about a person who cannot consent the way an adult user of a SaaS can.

- Learner photos, birth certificates, school IDs.
- Any upload you would not want in a Slack screenshot with a live link.
- Small Node APIs that "will only be used by teachers". Teachers forward links.

Skip this for a public blog image you authored. How’s diagrams are not PII.

## **How** is it done

Refuse a public bucket. Store an object key, not a CDN URL, on the learner record. Require a consent flag that is not a checkbox you pre-tick.

```js
export async function saveLearnerPhoto({ learnerId, teacherId, file, consentAt }) {
  if (!consentAt) {
    throw Object.assign(new Error('consent required'), { status: 400 });
  }

  const body = await stripExif(file.buffer);
  const key = `learners/${learnerId}/photo`;

  await putPrivateObject({ key, body, contentType: 'image/jpeg' });

  await db.learnerPhoto.upsert({
    learnerId,
    key,
    uploadedBy: teacherId,
    consentAt,
  });

  return { key };
}
```

`stripExif` is not optional. Phone photos carry GPS, device name, sometimes a thumbnail you forgot. Re-encode through a library that does not copy metadata by default.

When a teacher needs to see the photo, mint a short-lived signed URL in the API. Do not store that URL. Do not put it in an email. Emails get forwarded; signed URLs in inboxes outlive your expiry if a crawler cached them, so keep expiry in minutes and keep email on a different note.

```js
export async function getLearnerPhotoUrl({ learnerId, viewer }) {
  const row = await db.learnerPhoto.find(learnerId);
  if (!row) return null;
  assertCanViewPhoto(viewer, row);
  return signGetUrl({ key: row.key, expiresIn: 120 });
}
```

`assertCanViewPhoto` is where teachers and donors split — that is the next Node note. For uploads, the rule is: nobody gets a durable public path.

## Watch out for

Do not serve `/uploads/learners/123.jpg` from Express `static`. That is a public bucket with extra steps.

Do not keep originals "for later" next to the stripped file. Later becomes never, and the GPS is still on disk.

And do not log the signed URL. Your log drain is another copy of the photo access path.
