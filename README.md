# Evlek MCP Server

[![MCP](https://img.shields.io/badge/MCP-2026--07--28-7B61FF?style=flat-square)](https://modelcontextprotocol.io)
[![Hosted](https://img.shields.io/badge/Hosted-evlek.app-0A2540?style=flat-square)](https://evlek.app/api/mcp)
[![License](https://img.shields.io/badge/License-MIT-2D8B5C?style=flat-square)](LICENSE)
[![Coverage](https://img.shields.io/badge/Coverage-North_Cyprus-C9A157?style=flat-square)](https://evlek.app)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-app.evlek-B84E3B?style=flat-square)](https://registry.modelcontextprotocol.io)
[![smithery badge](https://smithery.ai/badge/onurd8898/evlek)](https://smithery.ai/servers/onurd8898/evlek)

> AI-native property discovery for North Cyprus (KKTC). Built on the Model Context Protocol — works in Claude, ChatGPT, Gemini, Cursor, and any MCP-compatible client.

The Evlek MCP server gives AI agents structured, real-time access to North Cyprus property data — search active listings, compare cities and districts, and track the price index. All data is sourced live from [evlek.app](https://evlek.app). Evlek does not offer a rental-yield or investment-return estimate: figures are descriptive asking-price facts only, never a valuation, forecast, or recommendation. Title-deed (koçan) and legal-procedure tools are deliberately **not** part of the surface: that taxonomy has not passed an independent KKTC legal audit.

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

### Local stdio server (this repository)

This repo is also a runnable MCP server. It answers `initialize` / `tools/list` entirely locally from the embedded tool contract ([`tools.json`](./tools.json)) and fetches live data from the Evlek data API when a tool is called. It only implements tools — it does not declare the `resources` or `prompts` capability, so `resources/list` and `prompts/list` return a normal MCP "method not found" error on this bridge; those primitives (see below) are hosted-endpoint-only, reachable via the Streamable HTTP URL above. It also speaks whatever MCP protocol version the pinned `@modelcontextprotocol/sdk` supports during `initialize` (currently `2025-11-25`), not necessarily the hosted endpoint's `2026-07-28` — tool schemas are identical either way.

```bash
npx github:Evlek/evlek-mcp        # or: npm install && npm start
```

```json
{
  "mcpServers": {
    "evlek": {
      "command": "npx",
      "args": ["-y", "github:Evlek/evlek-mcp"]
    }
  }
}
```

Smoke-test it (spawns the server and speaks real MCP over stdio):

```bash
npm test              # live: initialize + tools/list + a real tools/call
OFFLINE=1 npm test    # offline: introspection works with zero network
```

## Available tools

<!-- AUTO-GENERATED by `pnpm mcp:export-public` in the source repo (writes `public-mcp-export/README-tools-table.md`) — do not hand-edit this block. -->

**12 tools** · protocol `2026-07-28` · Streamable HTTP JSON-RPC 2.0

| Tool | Title | Description |
|------|-------|-------------|
| `search_listings` | Search Northern Cyprus Property Listings | Search live active sale and long-term-rent listings on Evlek. Results are newest-first by default; `limit` caps returned rows and `totalMatched` reports the full match count. Returns advertised asking-price and listing facts only; not valuation, verification of property-specific claims, forecast, ranking, or recommendation. |
| `get_price_index` | Get Northern Cyprus Price Index | Returns source-dated aggregates of live active Evlek sale or long-term-rent asking prices. Descriptive listing facts only: not completed transactions, a valuation, a forecast, or an investment recommendation. |
| `compare_cities` | Compare Northern Cyprus Cities Side-by-Side | Compare source-dated live active-listing asking-price aggregates across 2-4 Northern Cyprus cities. Descriptive listing facts only; not transaction prices, valuation, forecast, ranking, or investment advice. |
| `compare_properties` | Compare Evlek Property Listings Side-by-Side | Compare descriptive facts from 2-4 active Evlek sale or long-term-rent listings of the same type. Shows advertised asking price, size and £/m² differences without making a value, suitability, appraisal, or investment judgment. The legacy `listing_ids` parameter name is still accepted as an alias of `listingIds`. |
| `get_district_profile` | Get Live Asking-Price Context for a Northern Cyprus District | Returns source-dated active sale/long-term-rent listing counts and asking-price aggregates for one district. Any rent-to-price percentage is a derived asking-price ratio, not observed income, net yield, valuation, forecast, ranking, or recommendation. |
| `convert_currency` | Currency Conversion (GBP/EUR/USD/TRY) | Converts an entered property asking-price amount across GBP/EUR/USD/TRY when complete, valid, fresh, date-stamped stored FX rates are available; otherwise it fails closed without amounts. Currency conversion only: no payment plan, deposit schedule, installment schedule, acquisition-cost estimate, or advice. |
| `payment_plan` | Currency Conversion (payment-plan name reserved) | Currently returns currency conversion only. A real installment/payment-schedule tool is planned under this name; until then it does not produce a payment plan, deposit schedule, or acquisition-cost estimate. |
| `get_listing_detail` | Get Full Detail for a Single Evlek Listing | Return a 360° profile of one active Evlek listing by UUID or listing number: title, description, price, location, size, amenities, features, cover image, per-photo captions/tags, and AI virtual-staging before/after pairs (always AI-disclosed). Contact details omitted. Use when: a UUID or listing number is already known. Don't use for: discovery — use search_listings first. The legacy `property_id` parameter name is still accepted as an alias of `propertyId`. |
| `search` | Search Evlek property listings | Search live Northern Cyprus (KKTC/TRNC) property listings on Evlek with a free-text query. Returns matching listings as id/title/url for the fetch tool. Same data as search_listings — this fixed form exists for the ChatGPT/OpenAI connector contract. Use when: the caller only has a free-text query. Don't use for: structured filters — use search_listings. |
| `fetch` | Fetch full Evlek listing detail | Fetch the full detail of one Evlek listing by id (from search): title, description, GBP-normalized price, location, size, amenities. Same data as get_listing_detail — this fixed id-only form exists for the ChatGPT/OpenAI connector contract. Use when: an id from search is known. Don't use for: discovery — use search first. |
| `list_locations` | List Valid Evlek Cities and Districts | Return canonical KKTC city slugs plus districts represented by active Evlek sale or long-term-rent listings. Live inventory-location facts only; holiday-home inventory remains unavailable. |
| `get_listing_by_number` | Get Evlek Listing by Number | Look up a single Evlek listing by its public listing number (e.g. "EVL-123456", "123456", or a bare number) and return its full detail — same shape as get_listing_detail. Use when: a listing number is known. Don't use for: UUID lookups — use get_listing_detail. The legacy `listing_number` parameter name is still accepted as an alias of `listingNumber`. |

<!-- /AUTO-GENERATED -->

Every tool declares `annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }` — the whole surface is read-only.

### Interactive widgets (MCP Apps / SEP-1865)

Three tools additionally ship a sandboxed HTML view that MCP Apps-capable hosts
(Claude web/desktop) render inline in the conversation:

| Tool | Widget | What you get |
|---|---|---|
| `search_listings`, `search` | `ui://evlek/listing-cards-v2.html` | Horizontal carousel of cards (cover photo, price, location) — the whole card is the link, no separate CTA button; opening one drills into the SAME detail view as `get_listing_detail`, in fullscreen, never an inline half-panel. An opt-in "select to compare" mode sends 2-4 listings to `compare_properties`, rendered as a comparison table. |
| `get_listing_detail` | `ui://evlek/listing-detail-v2.html` | Photo gallery with AI captions, spec sheet, and a before/after AI virtual-staging comparison slider |
| `get_price_index` | `ui://evlek/price-index-v2.html` | Per-city summary rows inline (avg/median, capped to a few cities to stay compact); the full district breakdown and city-comparison table open in fullscreen, not inline |

Views are static, self-contained HTML — no bundler, no third-party JS. Listing
data reaches them only at runtime over `postMessage` and is written with
`textContent`, never `innerHTML`. CSP is declared per resource
(`_meta.ui.csp`) and limited to the public listing-photo origin.

See [TOOLS.md](./TOOLS.md) for full input schemas, parameter details, and response examples.

### Resources (12) & resource templates (2)

`resources/list` returns 12 resources on the hosted endpoint — 9 read-only `evlek://` data resources plus the 3 `ui://` interactive-widget resources described above (pre-declared so a host can pre-cache them). Parameterized templates are separate, via `resources/templates/list`:

- **Templates (2):** `evlek://price-index/{city}` · `evlek://district/{city}/{district}`
- **Data resources (9):** per-city price indexes (girne, iskele, lefkosa, gazimagusa, guzelyurt, lefke), a sample district profile (Girne/Alsancak), and 2 orientation guides — `evlek://guides/neighborhood-personas`, `evlek://guides/universities`.
- **Widget resources (3):** `ui://evlek/listing-cards-v2.html`, `ui://evlek/listing-detail-v2.html`, `ui://evlek/price-index-v2.html` — see "Interactive widgets" above.

### Prompts (2)

- `property_scenario` — Illustrative Property Scenario with Separate Live Facts
- `student_rental_scenario` — Illustrative Student-Rental Scenario

---

## Example prompts

- *"Find 2-bedroom flats for rent in Girne under £1,500/month."*
- *"Show me apartments in Girne under £150,000."*
- *"What's the median sale price per square meter in Lefkoşa?"*
- *"Compare Kyrenia and Famagusta — which has more active listings and how do median asking prices differ?"*
- *"What does a district profile for Alsancak look like?"*
- *"Convert £150,000 to EUR, USD, and TRY."*

---

## Coverage

- **Cities:** 6 (Girne, İskele, Lefkoşa, Gazimağusa, Güzelyurt, Lefke)
- **Districts:** 100+
- **Currency:** GBP primary; TRY/USD/EUR normalized to GBP server-side using live daily exchange rates
- **Tool descriptions:** EN · **Listing data fields:** TR + EN

---

## Architecture

The Evlek MCP server runs as a hosted endpoint at `https://evlek.app/api/mcp`. It speaks the Model Context Protocol over Streamable HTTP (JSON-RPC 2.0), `protocolVersion 2026-07-28`, and exposes tools, resources, resource templates, and prompts. Discovery metadata is published at [`/.well-known/mcp.json`](https://evlek.app/.well-known/mcp.json).

This repository contains:

- **[server.json](./server.json)** — MCP Registry manifest
- **[TOOLS.md](./TOOLS.md)** — Full tool reference (JSON schemas + examples)
- **[CHANGELOG.md](./CHANGELOG.md)** — Notable changes to the tool surface, including removed/renamed tools
- **[examples/](./examples/)** — Configuration files for Claude Desktop, Cursor, VS Code
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — How to file issues and propose docs improvements

The full server implementation (database schemas, API routes, AI prompt engineering, listing pipeline) is hosted at [evlek.app](https://evlek.app) and remains proprietary.

### Security model

Per [OWASP MCP Top 10](https://owasp.org/www-project-mcp-top-10/): per-IP rate limit 60/min, global 500/min, 30s hard timeout, Zod input validation, output sanitization (prompt-injection defense), max 10 results per query, Supabase anon key + RLS, no stack traces leaked, Sentry observability.

To report a security issue, email hello@evlek.app.

---

## Status

- **MCP version:** 2.1.0 (live)
- **Protocol:** 2026-07-28
- **Primitives:** 12 tools · 9 data resources + 3 interactive widget resources · 2 resource templates · 2 prompts
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
