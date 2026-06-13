# Evlek MCP Server

[![MCP](https://img.shields.io/badge/MCP-2025--11--25-7B61FF?style=flat-square)](https://modelcontextprotocol.io)
[![Hosted](https://img.shields.io/badge/Hosted-evlek.app-0A2540?style=flat-square)](https://evlek.app/api/mcp)
[![License](https://img.shields.io/badge/License-MIT-2D8B5C?style=flat-square)](LICENSE)
[![Coverage](https://img.shields.io/badge/Coverage-North_Cyprus-C9A157?style=flat-square)](https://evlek.app)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-app.evlek-B84E3B?style=flat-square)](https://registry.modelcontextprotocol.io)

> AI-native property discovery for North Cyprus (KKTC). Built on the Model Context Protocol — works in Claude, ChatGPT, Gemini, Cursor, and any MCP-compatible client.

The Evlek MCP server gives AI agents structured, real-time access to North Cyprus property data — search active listings, compare cities, estimate rental yield, look up KKTC legal procedures, get district profiles, and more. All data is sourced live from [evlek.app](https://evlek.app).

## License scope

This repository is MIT-licensed for the public manifest, documentation, examples, and reference clients contained here. The hosted Evlek service, evlek.app web app, mobile apps, listing database, AI prompts, business logic, brand assets, name, logo, and trade dress remain proprietary and are not licensed under MIT. See [LICENSE](./LICENSE) for details.

---

## Why Evlek MCP

- **AI-first.** Built for agentic workflows from day one — not retrofitted on a legacy listing API.
- **Multilingual.** Property data in TR, EN, RU, DE, AR (currently exposed via tool descriptions in EN).
- **Verification-aware listings.** Evlek surfaces listing and account verification context where available, and the MCP omits contact fields to preserve Evlek's reveal/contact funnel.
- **Built for the region.** Optimized for the 6 cities of North Cyprus (Lefkoşa, Girne, Gazimağusa, İskele, Güzelyurt, Lefke) and 100+ districts.
- **Production-grade.** OWASP MCP Top 10 aligned — Zod input validation, output sanitization, rate limiting (60/min/IP, 500/min global), Sentry observability.

---

## Quick start

### Remote-capable clients (preferred)

Most modern MCP clients (Claude, Cursor, VS Code) connect directly to the Streamable HTTP endpoint — no local bridge needed:

```json
{
  "mcpServers": {
    "evlek": {
      "url": "https://evlek.app/api/mcp"
    }
  }
}
```

### ChatGPT (connector + Deep Research)

Add `https://evlek.app/api/mcp` as a custom connector. Evlek exposes OpenAI-compatible `search` and `fetch` tools, so it works in ChatGPT connectors and Deep Research in addition to developer mode.

### Claude Desktop (legacy stdio bridge)

If your client only supports stdio servers, use the pinned `mcp-remote` bridge. Add this to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "evlek": {
      "command": "npx",
      "args": ["-y", "mcp-remote@0.1.16", "https://evlek.app/api/mcp"]
    }
  }
}
```

Restart Claude Desktop. The "evlek" server appears in the tools list.

### MCP Inspector (test before installing)

```bash
npx @modelcontextprotocol/inspector https://evlek.app/api/mcp
```

### Direct API (cURL)

```bash
curl -X POST https://evlek.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

More configs: [`examples/`](./examples/)

---

## Available tools (v1.5.0 — 16 tools)

| # | Tool | What it does |
|---|------|--------------|
| 1 | `search_listings` | Search active listings by city, type (sale/rent/daily), bedrooms, and GBP price range (normalized server-side). Up to 10 results with title, price, location, direct link. |
| 2 | `get_price_index` | Aggregated avg/median/min/max prices per city + top districts (Evlek Price Index). |
| 3 | `get_market_overview` | High-level market overview — avg rent/sale prices, rental yields, investment highlights, key facts. |
| 4 | `compare_cities` | Compare 2-4 cities side-by-side with prices, listing counts, top districts, automatic verdict. |
| 5 | `get_yield_estimate` | Estimate gross/net annual rental yield + breakeven years. Cities without sufficient data return a clear unsupported message. |
| 6 | `get_legal_info` | General legal/procedural routing for koçan types, foreign purchase rules, taxes, residency, PTP. Not legal advice. |
| 7 | `suggest_neighborhood` | Match a buyer persona (retiree, investor, student, family, digital_nomad, vacation) to neighborhoods. |
| 8 | `compare_properties` | Compare 2-4 active listing UUIDs side-by-side with GBP price-per-m², area, bedrooms, value insight. |
| 9 | `get_district_profile` | 360° district profile — sale/rent stats, £/m², bedroom breakdown, estimated yield, persona match. |
| 10 | `assess_title_risk` | Neutral risk band for a KKTC koçan type with verification steps. Not legal advice. |
| 11 | `foreign_buyer_roadmap` | Step-by-step KKTC foreign-buyer roadmap (PTP process). General information only. |
| 12 | `student_housing` | Student-housing rental outlook near a KKTC university, academic-year vs year-round. |
| 13 | `payment_plan` | Convert a price across GBP/EUR/USD/TRY using live date-stamped rates; off-plan staged-payment context. |
| 14 | `get_listing_detail` | 360° profile of one active listing by UUID, including GBP-normalized price-per-m². |
| 15 | `search` | **(ChatGPT-compatible)** Free-text search returning listings as `{id, title, url}`. |
| 16 | `fetch` | **(ChatGPT-compatible)** Fetch full listing detail by id from `search`. |

See [TOOLS.md](./TOOLS.md) for full input schemas, parameter details, and response examples.

### Resources (8) & resource templates (2)

Read-only `evlek://` data via `resources/list` / `resources/read`, plus parameterized templates via `resources/templates/list`:

- **Templates:** `evlek://price-index/{city}` · `evlek://district/{city}/{district}`
- **Instances:** `evlek://legal/kocan-types`, per-city price indexes (girne, iskele, lefkosa, gazimagusa, guzelyurt, lefke), and a sample district profile.

### Prompts (4)

- `investment_analysis` · `kocan_risk_check` · `student_rental_outlook` · `foreign_buyer_guide`

---

## Example prompts

- *"Find 2-bedroom flats for rent in Girne under £500/month."*
- *"What's the median sale price per square meter in Lefkoşa?"*
- *"Compare İskele and Famagusta for investment — which has higher rental yield?"*
- *"What koçan type is safest for a foreign buyer in North Cyprus?"*
- *"Estimate the rental yield on a £150,000 2+1 in Girne."*
- *"Walk me through the foreign-buyer purchase process in KKTC."*

---

## Coverage

- **Cities:** 6 (Girne, İskele, Lefkoşa, Gazimağusa, Güzelyurt, Lefke)
- **Districts:** 100+
- **Currency:** GBP primary; TRY/USD/EUR normalized to GBP server-side using live daily exchange rates
- **Tool descriptions:** EN · **Listing data fields:** TR + EN

---

## Architecture

The Evlek MCP server runs as a hosted endpoint at `https://evlek.app/api/mcp`. It speaks the Model Context Protocol over Streamable HTTP (JSON-RPC 2.0), `protocolVersion 2025-11-25`, and exposes tools, resources, resource templates, and prompts. Discovery metadata is published at [`/.well-known/mcp.json`](https://evlek.app/.well-known/mcp.json).

This repository contains:

- **[server.json](./server.json)** — MCP Registry manifest
- **[TOOLS.md](./TOOLS.md)** — Full tool reference (JSON schemas + examples)
- **[examples/](./examples/)** — Configuration files for Claude Desktop, Cursor, VS Code
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — How to file issues and propose docs improvements

The full server implementation (database schemas, API routes, AI prompt engineering, listing pipeline) is hosted at [evlek.app](https://evlek.app) and remains proprietary.

### Security model

Per [OWASP MCP Top 10](https://owasp.org/www-project-mcp-top-10/): per-IP rate limit 60/min, global 500/min, 30s hard timeout, Zod input validation, output sanitization (prompt-injection defense), max 10 results per query, Supabase anon key + RLS, no stack traces leaked, Sentry observability.

To report a security issue, email hello@evlek.app.

---

## Status

- **MCP version:** 1.5.0 (live)
- **Protocol:** 2025-11-25
- **Primitives:** 16 tools · 8 resources · 2 resource templates · 4 prompts
- **Auth:** none (public read-only)
- **Endpoint:** `https://evlek.app/api/mcp`
- **MCP Registry:** [`app.evlek/mcp-server`](https://registry.modelcontextprotocol.io)

---

## License

**MIT** — see [LICENSE](./LICENSE). MIT covers the public manifest, documentation, examples, and reference clients in this repository only (see [License scope](#license-scope) above). The hosted Evlek service (web app, mobile apps, listing data, AI prompts, database schemas, business logic) is proprietary.

> **Trademark notice:** "Evlek" is a trademark of Onur Dokuzoğlu. The MIT license does not grant rights to use the "Evlek" name, logo, or branding except as described in this README. To request brand usage permission, contact hello@evlek.app.

---

## Links

- **Web:** [evlek.app](https://evlek.app)
- **iOS:** [App Store](https://apps.apple.com/app/id6760562764)
- **Android:** [Google Play](https://play.google.com/store/apps/details?id=app.evlek.mobile)
- **MCP endpoint:** `https://evlek.app/api/mcp`
- **MCP documentation:** [evlek.app/mcp](https://evlek.app/mcp)
- **MCP Registry:** [`app.evlek/mcp-server`](https://registry.modelcontextprotocol.io)
- **Model Context Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Contact:** hello@evlek.app

---

*Built in North Cyprus by an architect, not a software firm. Powered by [Anthropic Claude](https://claude.ai), [Supabase](https://supabase.com), [Vercel](https://vercel.com), and the [Model Context Protocol](https://modelcontextprotocol.io).*
