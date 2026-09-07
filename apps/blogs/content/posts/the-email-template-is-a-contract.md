---
title: The email template is a contract
tagline: Backend fills holes. Front-end does not ship a surprise shape.
description: How to version an HTML email template so placeholders, loops, escaping, and i18n stay a stable contract with the sending service.
date: '2026-04-24'
mainTag: javascript
tags: [frontend]
draft: false
---

## **What** was the situation

Once the workflow-product digest looked right in Outlook, we still had to share it with backend. They were going to merge data into it and send. The first version had cute names: `{{title}}`, `{{name}}`, a comment that said "repeat this tr for each item". Backend guessed. A deploy from front-end renamed a placeholder. Mail went out with literal `{{digestTitle}}` in the header, or worse, with a learner name that had an `&` and broke the markup.

The HTML file is not a mock. It is an API. It needs a schema, escaping rules, and a version, the same way you would not change a REST field on a Friday without telling anyone.

## **When** does this apply

Use this when front-end authors HTML and a Java or Node service sends it.

- Digests with a list of rows whose length only the backend knows.
- Mail that exists in more than one language.
- Any placeholder that might contain a name, a comment, or a URL.

Skip this if the vendor owns the template and you only pass a JSON blob their UI already documents.

## **How** is it done

Name placeholders like fields. Not like copy. Put the contract at the top of the file so it cannot drift into Slack.

```html
<!--
  template: case-digest
  version: 3
  locale: injected as {{locale}}
  required:
    digestTitle, digestLead, openUrl
  each item in items[]:
    itemTitle, itemMeta
-->
```

Backend pins `case-digest@3`. Front-end may add `v4` next to it. Do not edit `v3` in place. Old mail jobs still run.

Loops need an explicit block, not a comment that says "repeat". Handlebars-style is fine if both sides agree. Keep it ugly and obvious:

```html
{{#each items}}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="padding: 12px 32px; font-family: Arial, sans-serif;">
      <p style="margin: 0; font-size: 14px; font-weight: 700;">{{itemTitle}}</p>
      <p style="margin: 0; font-size: 14px;">{{itemMeta}}</p>
    </td>
  </tr>
</table>
{{/each}}
```

Escaping: backend must HTML-escape every string it did not mark as safe. Names like `O'Neil & sons` will close a tag if you concatenate. Front-end does not `{{{itemTitle}}}` unless the value is a URL you already validated, and even then you escape `&` in query strings.

i18n: do not put English sentences in the template and ask backend to replace "Case" with "Cas". Either the template is per locale (`case-digest.en.html`, `case-digest.fr.html`) or every user-visible string is a placeholder. Mixing both is how one locale ships a half-translated digest.

A fixture JSON lives next to the HTML:

```json
{
  "digestTitle": "Monday handover",
  "digestLead": "3 cases need you.",
  "openUrl": "https://app.example/cases",
  "items": [{ "itemTitle": "Invoice stuck", "itemMeta": "Assigned to you" }]
}
```

CI renders the fixture into HTML and fails if a placeholder remains. That is the contract test. Front-end can still preview tables in a browser. Backend can still send. Neither side is guessing.

## Watch out for

Do not pass HTML from the product database into a placeholder without a sanitizer. That is how a case title becomes a phishing kit inside a trusted email.

Do not version by filename `digest-final-FINAL.html`. Use `version: N` and keep old N until the last sender job is gone.

And do not put signed photo URLs in digest items. Those expire, get forwarded, and fight the upload note you already wrote.
