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
- **Multilingual.** Answers in TR, EN, RU, DE, AR: pass `locale` (or write the `search` query in that language) and the text, amenity names, number formats and links follow it. Place names are resolved in any of the five languages.
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

**8 tools** · protocol `2026-07-28` · Streamable HTTP JSON-RPC 2.0

| Tool | Title | Description |
|------|-------|-------------|
| `search_listings` | Search Northern Cyprus property listings | Search live Evlek property listings for sale and long-term rent in Northern Cyprus (KKTC/TRNC; prices in GBP unless a currency is given; 2+1 means bedrooms 2) with structured filters: transaction, city, district, property type, bedrooms, price, areas, amenities, nearby university. Pass the user's language as `locale` (tr\|en\|ru\|de\|ar): the text, amenity names, number formats and links follow it. Returns at most 10 listings per call, each as one readable line (type, place, price, rooms, area, a deterministic sentence, data notes, canonical link) plus a structured card; continue with the `nextCursor` of a group. Without `transaction`, listings for sale and for rent come as two separate groups, each with its own cursor that is only valid together with that group's transaction. Place names in any language are resolved; an unknown place returns suggestions instead of results. An amenity that cannot be filtered on is reported as not applied. For a free-text request use `search`; for one listing use `fetch` or `get_listing`. Returns advertised asking-price and listing facts only: not a valuation, verification of property-specific claims, forecast, ranking or recommendation. |
| `search` | Search Evlek property listings | Search live Northern Cyprus (KKTC/TRNC) property listings on Evlek with a free-text query in Turkish, English, Russian, German or Arabic. Returns matching listings as id/title/url for the fetch tool, newest first (sale and rent as two groups when the query names neither). The answer language follows the language of the query. Same data as search_listings: this fixed form exists for the ChatGPT/OpenAI connector contract. Use when: the caller only has a free-text query ("2+1 apartment in Kyrenia under 150000 pounds", "EVL-100464"). Don't use for: structured filters, paging or another answer language: use search_listings. |
| `fetch` | Fetch full Evlek listing detail | Fetch the full detail of one Evlek listing: title, price, location, rooms, areas, amenities, data-quality notes and the canonical link. The id is the listing id (UUID) from a search result, a listing number such as EVL-100464, or an evlek.app listing link; the answer language follows the link (English otherwise). A listing that is not available (it does not exist, is not public, or was removed) always gets the same answer. Same data as get_listing: this fixed id-only form exists for the ChatGPT/OpenAI connector contract. Use when: an id from search is known. Don't use for: discovery (use search first) or another answer language (use get_listing). |
| `get_listing` | Get an Evlek listing | Get the full details of ONE public Evlek listing (sale or long-term rent) in the user's language. `ref` is the listing id (UUID), the listing number (EVL-100464 or just 100464) or an evlek.app listing link in any language. Returns the price, rooms, bathrooms, built area and plot area (always separate), the approximate location, features, the office name, dates, data-quality notes, photos with captions where they exist, AI virtual-staging before/after images when the office approved them (always labelled as AI-generated) and the canonical link. Contact details are never included: send the user to the link. A listing that is unknown or no longer public answers found:false with code NOT_FOUND (this is not an error). Pass the user's language as `locale` (tr, en, ru, de or ar). |
| `compare_listings` | Compare Evlek listings | Compare 2 to 4 public Evlek listings side by side in the user's language: price, price per m² (only when the built area is believable), rooms, bathrooms, built area and plot area (always separate), location, furnishing, key features and data-quality notes, plus a few descriptive highlights (lowest price, largest indoor area, most recently listed). `ids` takes listing ids (UUID), listing numbers (EVL-100464) or evlek.app listing links, in any mix; the order you give is kept. Sale and rent listings are never ranked against each other: a mixed request is shown in two groups with a warning. A reference that is unknown or no longer public is listed in `missingIds` with code NOT_FOUND (this is not an error). Descriptive facts only: no valuation and no recommendation. Pass the user's language as `locale` (tr, en, ru, de or ar). |
| `market_stats` | Northern Cyprus market statistics | Market statistics for Northern Cyprus from asking prices of active public listings (not sales, valuations or forecasts). No city = the island by city; one city = its districts; several = side by side; city + district = a district profile. Sale and rent are reported separately. Each figure has activeCount (public listings in scope) and sampleCount (the cleaned sample behind the statistic); below 10 sampled listings it is withheld. Pass locale. |
| `list_locations` | List Evlek locations | List the places Evlek knows in Northern Cyprus (6 cities, districts, villages, sub-areas, landmarks, the Karpaz region) with their public sale and long-term rent listing counts. Call it first when unsure how a place is spelled: every name and id returned is accepted by the other tools. Pass `city` (any spelling or language) for one place in detail. Names are Turkish or Latin; Russian, German and Arabic spellings are accepted as input but not listed. |
| `convert_currency` | Currency conversion (GBP/EUR/USD/TRY) | Converts an amount between GBP, EUR, USD and TRY with the exchange rates Evlek stores (refreshed daily) and returns all four equivalents. Currency conversion only: no payment plan, deposit or instalment schedule, tax, fee or acquisition-cost estimate, no advice. Rates older than 24 hours are flagged as stale; beyond 72 hours (or when none are stored) no conversion is produced (FX_UNAVAILABLE). |

<!-- /AUTO-GENERATED -->

Every tool declares `annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }` — the whole surface is read-only.

### Interactive widgets (MCP Apps / SEP-1865)

Five tools additionally bind a sandboxed HTML view (`_meta.ui.resourceUri`) that
MCP Apps-capable hosts (Claude web/desktop) render inline in the conversation:

| Tool | Widget | What you get |
|---|---|---|
| `search_listings`, `search` | `ui://evlek/listing-cards-v3-2.html` | Listing cards (cover photo, price, location); opening one shows the listing detail view |
| `get_listing`, `fetch` | `ui://evlek/listing-detail-v3-2.html` | Photo gallery, spec sheet, and AI virtual-staging before/after (always AI-disclosed) |
| `market_stats` | `ui://evlek/price-index-v3-2.html` | Asking-price statistics per city / district |

`compare_listings`, `list_locations` and `convert_currency` have no widget. The
widget URIs moved from `-v2` to `-v3` in 3.0.0 so a host never serves a cached
v2 template against v3 data. 3.0.1 moved them to `-v3-1` and 3.0.2 to `-v3-2`;
the older v3 URIs keep answering with the current content.

In ChatGPT (3.0.2) the listing data reaches the widget through the result `_meta["evlek/widget"]`,
which ChatGPT shows only to the widget; for `search_listings` and `get_listing` the model gets a short summary (counts, price range,
listing numbers). Other clients get the full `structuredContent` as before.

Views are static, self-contained HTML — no bundler, no third-party JS. Listing
data reaches them only at runtime over `postMessage` and is written with
`textContent`, never `innerHTML`. CSP is declared per resource
(`_meta.ui.csp`) and limited to the public listing-photo origin.

See [TOOLS.md](./TOOLS.md) for full input schemas, parameter details, and response examples.

### Resources (12) & resource templates (2)

`resources/list` returns 12 resources on the hosted endpoint — 9 read-only `evlek://` data resources plus the 3 `ui://` interactive-widget resources described above (pre-declared so a host can pre-cache them). Parameterized templates are separate, via `resources/templates/list`:

- **Templates (2):** `evlek://price-index/{city}` · `evlek://district/{city}/{district}`
- **Data resources (9):** per-city price indexes (girne, iskele, lefkosa, gazimagusa, guzelyurt, lefke), a sample district profile (Girne/Alsancak), and 2 orientation guides — `evlek://guides/neighborhood-personas`, `evlek://guides/universities`.
- **Widget resources (3):** `ui://evlek/listing-cards-v3-2.html`, `ui://evlek/listing-detail-v3-2.html`, `ui://evlek/price-index-v3-2.html` — see "Interactive widgets" above.

### Renamed tools in 3.0.0 (deprecated aliases)

3.0.0 consolidates the 12 v2 tools into 8. The old names below are **not** in
`tools/list` any more, but the hosted endpoint still answers them for one
release: the call is translated to the new tool, runs it, and the result starts
with a `Deprecated: … Use <new> instead.` line (plus
`structuredContent.deprecated`). **The aliases are removed in 3.1.0** — switch
to the new names now.

| Old name (v2) | New name (3.0.0) | Argument change |
|---|---|---|
| `get_listing_detail` | `get_listing` | `propertyId` / `property_id` → `ref` |
| `get_listing_by_number` | `get_listing` | `listingNumber` / `listing_number` → `ref` |
| `compare_properties` | `compare_listings` | `listingIds` / `listing_ids` → `ids` |
| `get_price_index` | `market_stats` | `city` kept; `type` → `transaction` (default `sale`) |
| `compare_cities` | `market_stats` | `cities` → `city`; `type` → `transaction` (default `sale`) |
| `get_district_profile` | `market_stats` | `city`, `district` kept |
| `payment_plan` | `convert_currency` | `price` → `amount` (name stays reserved for a future instalment tool) |

Unchanged names: `search_listings`, `search`, `fetch`, `list_locations`,
`convert_currency`. `search_listings`, `list_locations` and `convert_currency`
gained new parameters and canonical names (e.g. `transaction`, `priceMin`/`priceMax`,
`sort`, `cursor`, `amount`, `locale`) — see [TOOLS.md](./TOOLS.md). The v2 names
`type`, `maxPrice` and `price` are still accepted on the hosted endpoint.
Tools removed in 2.0.0 and earlier (`get_yield_estimate`, `suggest_neighborhood`,
`student_housing`, `get_market_overview`, `get_legal_info`) still return a
protocol error naming the replacement, not an alias.

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
- **Tool descriptions:** EN · **Answers:** TR · EN · RU · DE · AR (`locale`)

---

## Architecture

The Evlek MCP server runs as a hosted endpoint at `https://evlek.app/api/mcp`. It speaks the Model Context Protocol over Streamable HTTP (JSON-RPC 2.0), `protocolVersion 2026-07-28`, and exposes tools, resources, resource templates, and prompts. Discovery metadata is published at [`/.well-known/mcp.json`](https://evlek.app/.well-known/mcp.json).

This repository contains:

- **[server.json](./server.json)** — MCP Registry manifest
- **[tools.json](./tools.json)** — Live tool contract (what the local stdio server answers `tools/list` with)
- **[TOOLS.md](./TOOLS.md)** — Full tool reference (JSON schemas + examples)
- **[CHANGELOG.md](./CHANGELOG.md)** — Notable changes to the tool surface, including removed/renamed tools
- **[examples/](./examples/)** — Configuration files for Claude Desktop, Cursor, VS Code
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — How to file issues and propose docs improvements

### Sözleşme dosyaları (contract files)

- `tools.json` and `TOOLS.md` are a projection of the live server, generated by `pnpm mcp:export-public` in the source repo and copied here verbatim. Never hand-edit them; the `Contract Drift` workflow compares `tools.json` against the live `tools/list` daily and on every PR.
- `server.json` is **not** that projection. It is the MCP Registry publish manifest and must keep the registry shape: `name` is `app.evlek/mcp-server` (pattern `^[a-zA-Z0-9.-]+/[a-zA-Z0-9._-]+$`) and `description` is at most 100 characters. A sync only updates its `version`, the tool count in `description`, and the `_meta` tool list. (Copying the export's own `server.json` here is what failed the v2.1.0 registry publish.)

The full server implementation (database schemas, API routes, AI prompt engineering, listing pipeline) is hosted at [evlek.app](https://evlek.app) and remains proprietary.

### Security model

Per [OWASP MCP Top 10](https://owasp.org/www-project-mcp-top-10/): per-IP rate limit 60/min, global 500/min, 30s hard timeout, Zod input validation, output sanitization (prompt-injection defense), max 10 results per query, Supabase anon key + RLS, no stack traces leaked, Sentry observability.

To report a security issue, email hello@evlek.app.

---

## Status

- **MCP version:** 3.0.2
- **Protocol:** 2026-07-28
- **Primitives:** 8 tools · 9 data resources + 3 interactive widget resources · 2 resource templates · 2 prompts
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
