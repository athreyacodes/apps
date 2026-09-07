---
title: MCP belongs in front of the APIs you already have
tagline: Agents should call threat and search the way our services already do.
description: How to add MCP in an API repo so agents can query latest email-threat detections and search without scraping a UI.
date: '2026-06-05'
mainTag: mcp
tags: [ai]
draft: false
---

## **What** was the situation

On an email-security platform we already had services that knew about email threat: a threat service that can talk about a scan and the most recent detections, a search service that can find those detections by sender, time, that sort of query. People used them through product APIs. Then the question became: can an agent do the same job without clicking the UI?

MCP is that door. It is not a new threat engine. It is a small server that exposes tools, and each tool is a boring wrapper around an API we already trust. Backend is the right place. The API repo already has auth, rate limits, and the rule that a detection payload is not a public webpage.

I would not put this in a front-end remote. The Angular app is a view. The agent does not need a view. It needs `latest_detections` and `search_detections` with the same permissions a service client would have.

## **When** does this apply

Use this when the company already has HTTP APIs for a domain, and you want an agent to use them safely.

- A group of services in one API repo: threat, search, maybe more later.
- "What were the most recent detections?" and "find scans for this sender last week".
- Internal assistants, not an anonymous bot on the public internet.

Skip this if you do not have an API yet. MCP will not invent detections. Also skip a UI-scraping MCP that clicks the Angular app. That will break on the next layout change and it will ignore authz.

## **How** is it done

Stand up an MCP server next to the existing clients in the API repo. Tools map 1:1 to use cases, not 1:1 to every internal method.

Threat service tools (names are ours for this note, not a real platform catalogue):

- `get_latest_detections` — recent detections for a mailbox or tenant the caller can see
- `get_detection` — one detection by id, same payload the API already returns
- `scan_email` — submit an email identifier the API already accepts for a threat scan, return the job or the result

Search service tools:

- `search_detections` — query string, sender, time window, page token
- `search_scans` — if scans are a different index, do not pretend detections search covers them

A tool definition should look like a careful API, not like a chatbot prompt. Required fields, enums for severity, a hard cap on page size.

```ts
server.tool(
  'get_latest_detections',
  {
    mailboxId: z.string().min(1),
    limit: z.number().int().min(1).max(50).default(10),
  },
  async ({ mailboxId, limit }) => {
    const data = await threat.getLatest({ mailboxId, limit, actor });
    return { content: [{ type: 'text', text: JSON.stringify(data) }] };
  },
);
```

```ts
server.tool(
  'search_detections',
  {
    query: z.string().max(200).optional(),
    sender: z.string().email().optional(),
    from: z.string().datetime(),
    to: z.string().datetime(),
    pageToken: z.string().optional(),
  },
  async (input) => {
    const data = await search.detections({ ...input, actor });
    return { content: [{ type: 'text', text: JSON.stringify(data) }] };
  },
);
```

`actor` is the authenticated identity of the MCP client, passed into the same authorisation the HTTP API uses. If threat would 403 the user, the tool 403s. Do not add a "service admin" bypass because the agent is "ours".

Wire search and threat as two clients behind one MCP process if they already share auth in that repo. One process, two clients, clear tool names. When a third service joins, add tools, do not add a second unauthenticated MCP.

The agent then asks: "latest detections for this mailbox" and "search sender X last 24 hours". It should not ask the MCP to "open the inbox UI and read the table".

## Watch out for

Do not return raw email bodies to the model by default. Detections metadata is already sensitive. Bodies are worse. If a scan tool needs a sample, use the same redaction the API uses for humans.

Do not log tool arguments at debug in production. Sender addresses and mailbox ids in a prompt log are still PII.

And do not version tools by renaming them in place. Agents pin names. Add `search_detections_v2` if the contract changes, and keep v1 until the clients move.
