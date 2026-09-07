---
title: Share the tokens, not the components
tagline: Remotes can share a colour. They should not share a junk drawer of widgets.
description: How a design-token library keeps Angular micro frontends looking like one product without a fat shared component dump.
date: '2026-05-01'
mainTag: angular
tags: [frontend, micro-front-end]
draft: false
---

## **What** was the situation

A workflow product’s remotes had to look like one product. An email-security platform’s products even more so — several surfaces, one platform. The first instinct is a shared Angular library with every button, every modal, every table.

That library becomes the slowest-moving remote you have. Nobody wants to bump it. One product needs a destructive button, another needs a quiet one, the shared `ButtonComponent` grows a `variant` enum with twelve values and a comment that says "do not use overlay".

Tokens are the part that should be identical: colour, type, space, radius. Components can live next to the feature that needs them, or in a small UI lib that is allowed to stay small.

## **When** does this apply

Use this when more than one Angular app must feel like the same house.

- Module Federation remotes with a common header colour and type ramp.
- An Nx workspace where `ui` is starting to import feature types.
- A public site and a product that should share a palette but not a table widget.

Skip this if you have one app. Put the tokens in that app. A shared library for How would be theatre.

## **How** is it done

Publish tokens as CSS variables (or a tiny JS map that writes them). Components in each remote consume the variables. They do not import `HeroButton` from a mega-lib unless that button is truly identical everywhere.

```css
:root {
  --color-text: #12494c;
  --color-accent: #156064;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --radius: 8px;
  --font: Montserrat, Helvetica, sans-serif;
}
```

A remote button then looks like a local component:

```css
.button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #eeeeee;
  font-family: var(--font);
}
```

When the platform changes accent, every remote that used the variable updates. When one product needs a weird split-button, they build it locally. They do not extend the shared `ButtonComponent` with `mode: 'split-for-inbox'`.

If a control really is identical — a chip, a dialog frame — then it earns a place in `libs/ui`. The test is: would you delete a product and still need this component? Auth login form is a product. A chip is a chip.

Version tokens with the workspace. Do not npm-publish a token package for one monorepo. Path alias to `libs/tokens`. Federation should not load tokens as a remote.

## Watch out for

Do not share a component that wraps a feature API. `DetectionCard` that imports a detections client is not UI. It is a remote in disguise, and the other products will drag that API into their bundle.

Do not let remotes override tokens "just this once" with a second `:root`. You will debug two greens and a nav that does not match the page. Overrides belong to a documented theme hook, or they do not belong.
