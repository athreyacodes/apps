---
title: HTML email is still tables
tagline: The template the backend sends has to survive Outlook.
description: How to build a complex HTML email as a front-end artifact — nested tables, inline CSS, and a preview that is not Gmail.
date: '2026-03-20'
mainTag: javascript
tags: [frontend]
draft: false
---

## **What** was the situation

On a workflow product we had email in the product, not as a side quest. The backend sent the mail. Someone still had to design the thing people actually opened: a case digest, a handover note, a "this row changed" alert with a table of fields, a button that had to work in Outlook.

The mistake is writing that template like a web page. Flexbox, `<style>` in the head, a nice card with `border-radius` and a CSS grid of actions. Gmail will try. Outlook will laugh. The backend will still send it.

So the front-end owned an HTML file that looked like 2007 on purpose: tables for layout, inline styles, a single column that can collapse. Then we handed that file to backend as the sendable artifact.

## **When** does this apply

Use this when your team designs the email and another team’s service sends it.

- Digests with a header, a list of rows, a footer with an unsubscribe or a "open in app" URL.
- Transactional mail that must match the product: logo, colour, a primary button.
- Anything that will be opened in Outlook, Yahoo, or the Outlook-on-the-web cousin.

Skip this if you are sending plaintext, or using a vendor template you are not allowed to touch. Also skip it if the "email" is just a JSON payload to a third-party designer. This note is about the HTML you author.

## **How** is it done

Start with a table that is the whole world. Not a `<div>` you hope will centre.

```html
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding: 24px 12px; background: #eef3f3;">
      <table
        role="presentation"
        width="600"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="width: 600px; max-width: 600px; background: #ffffff;"
      >
        <tr>
          <td style="padding: 24px 32px; font-family: Arial, sans-serif; color: #12494c;">
            <p style="margin: 0 0 8px; font-size: 13px; letter-spacing: 0.08em;">PRODUCT</p>
            <h1 style="margin: 0 0 16px; font-size: 22px;">{{digestTitle}}</h1>
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5;">{{digestLead}}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

`role="presentation"` tells screen readers this table is layout, not data. `width="600"` plus a matching inline `max-width` is the old contract with desktop clients. Nested tables are how you get a header, a row list, and a button that does not slide left in Outlook.

A row in the digest is another table, not a flex child:

```html
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="padding: 12px 32px; border-top: 1px solid #d2dfdf; font-family: Arial, sans-serif;">
      <p style="margin: 0 0 4px; font-size: 14px; font-weight: 700;">{{itemTitle}}</p>
      <p style="margin: 0; font-size: 14px; color: #156064;">{{itemMeta}}</p>
    </td>
  </tr>
</table>
```

Buttons are a table with a coloured `td` and an `<a>` with inline padding. `border-radius` is optional decoration. Padding on the anchor is what makes it tappable.

Preview in more than Chrome. At minimum: Gmail web, Outlook desktop, Apple Mail. The backend preview environment is not a browser. If you only check the Angular app that "shows the template", you have not checked the email.

Placeholders stay dumb in this file: `{{digestTitle}}`, `{{itemTitle}}`. How backend fills them, escapes them, and versions the file is the next note.

## Watch out for

Do not put a `<style>` block and assume inlining will happen later unless you actually run an inliner in CI. Outlook does not come to your CSS file.

Do not use `gap`, `flex`, or `grid` for the skeleton. They fail in enough clients that "most people have Gmail" is not a standard.

And do not attach a web font and call the fallback "fine". The digest has to be readable in Arial. Brand fonts are a bonus, not a requirement.
