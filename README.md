# Evlek MCP Server

[![MCP](https://img.shields.io/badge/MCP-2025--11--05-7B61FF?style=flat-square)](https://modelcontextprotocol.io)
[![Hosted](https://img.shields.io/badge/Hosted-evlek.app-0A2540?style=flat-square)](https://evlek.app/api/mcp)
[![License](https://img.shields.io/badge/License-MIT-2D8B5C?style=flat-square)](LICENSE)
[![Coverage](https://img.shields.io/badge/Coverage-North_Cyprus-C9A157?style=flat-square)](https://evlek.app)
[![Anthropic Registry](https://img.shields.io/badge/Anthropic_Registry-app.evlek-B84E3B?style=flat-square)](https://registry.modelcontextprotocol.io)

> AI-native property discovery for North Cyprus (KKTC). Built on the Model Context Protocol — works in Claude, ChatGPT, Gemini, Cursor, and any MCP-compatible client.

The Evlek MCP server gives AI agents structured, real-time access to North Cyprus property data — search active listings, compare cities, estimate rental yield, look up KKTC legal procedures, get district profiles, and more. All data is sourced live from [evlek.app](https://evlek.app).

---

## Why Evlek MCP

- **AI-first.** Built for agentic workflows from day one — not retrofitted on a legacy listing API.
- **Multilingual.** Property data in TR, EN, RU, DE, AR (currently exposed via tool descriptions in EN).
- **Verified listings only.** Every listing on Evlek passes KYC verification — no ghost ads, no fake agents.
- **Built for the region.** Optimized for the 6 cities of North Cyprus (Lefkoşa, Girne, Gazimağusa, İskele, Güzelyurt, Lefke) and 100+ districts.
- **Production-grade.** OWASP MCP Top 10 compliant — Zod input validation, output sanitization, rate limiting (60/min/IP, 500/min global), Sentry observability.

---

## Quick start

### Claude Desktop

Add this to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "evlek": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://evlek.app/api/mcp"]
    }
  }
}
```

Restart Claude Desktop. The "evlek" server appears in the tools list.

### Cursor / VS Code (GitHub Copilot)

Cursor: `Settings → Model Context Protocol → Add Server`. VS Code: `.vscode/mcp.json`.

```json
{
  "mcpServers": {
    "evlek": {
      "url": "https://evlek.app/api/mcp"
    }
  }
}
```

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

## Available tools (v1.2.0 — 9 tools)

| # | Tool | What it does |
|---|------|--------------|
| 1 | `search_listings` | Search active listings by city, type (sale/rent/daily), bedrooms, price range. Returns up to 10 with title, price, location, direct link. |
| 2 | `get_price_index` | Aggregated avg/median/min/max prices per city + top districts (Evlek Price Index). |
| 3 | `get_market_overview` | High-level market overview — avg rent/sale prices, rental yields, hot zones, key facts (taxes, foreign ownership). |
| 4 | `compare_cities` | Compare 2-4 North Cyprus cities side-by-side with prices, listing counts, top districts, automatic verdict. |
| 5 | `get_yield_estimate` | Estimate gross/net annual rental yield for a property given purchase price + city + bedrooms. |
| 6 | `get_legal_info` | Authoritative info on koçan types, foreign purchase rules, taxes, residence permit, PTP (Permission to Purchase) process. |
| 7 | `suggest_neighborhood` | Given a buyer persona (retiree, investor, student, family, digital_nomad, vacation), return matched neighborhoods with rationale. |
| 8 | `compare_properties` | Compare 2-4 active listing UUIDs side-by-side with price-per-m², area, bedrooms, automatic value insight. |
| 9 | `get_district_profile` | 360° district profile — sale/rent stats, £/m², bedroom breakdown, estimated yield, persona match. |

> **v2.0 roadmap (Q2 2026):** 6 additional tools — `find_near_university`, `analyze_ruhsat`, `calculate_mortgage`, `calculate_acquisition_cost`, `convert_price`, `search_blog`. With namespace prefixes (`prop_*`, `market_*`, `area_*`, `legal_*`, `util_*`).

See [TOOLS.md](./TOOLS.md) for full input schemas, parameter details, and response examples.

---

## Example prompts

Try these in any MCP-enabled client:

- *"Find 2-bedroom flats for rent in Girne under £500/month."*
- *"What's the median sale price per square meter in Lefkoşa?"*
- *"Compare İskele and Famagusta for investment — which has higher rental yield?"*
- *"Show me studios in Gazimağusa near DAÜ."*
- *"What koçan type is safest for a foreign buyer in North Cyprus?"*
- *"I'm a retiree looking at North Cyprus — which neighborhoods fit?"*
- *"Estimate the rental yield on a £150,000 2+1 in Girne."*

---

## Coverage

- **Cities:** 6 (Girne, İskele, Lefkoşa, Gazimağusa, Güzelyurt, Lefke)
- **Districts:** 100+
- **Universities:** 7 indexed (YDÜ, DAÜ, GAÜ, UKÜ, LAÜ, BAÜ, AKÜ) — surfaced via `area_near_university` in v2.0
- **Currency:** GBP primary; TRY/USD/EUR conversion in `util_convert_price` (v2.0)
- **Tool descriptions:** EN
- **Listing data fields:** TR + EN (additional language tools planned for v2.1)

---

## Architecture

The Evlek MCP server runs as a hosted endpoint at `https://evlek.app/api/mcp`. It speaks the Model Context Protocol over Streamable HTTP (JSON-RPC 2.0), spec version `2025-11-05`, and complies with the Anthropic Registry v1.2 spec.

This repository contains:

- **[server.json](./server.json)** — Anthropic Registry manifest
- **[TOOLS.md](./TOOLS.md)** — Full tool reference (JSON schemas + examples)
- **[examples/](./examples/)** — Configuration files for Claude Desktop, Cursor, Continue, VS Code
- **[examples/clients/](./examples/clients/)** — Reference open-source thin clients (Python + TypeScript) under MIT
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — How to file issues and propose docs improvements

The full server implementation (database schemas, API routes, AI prompt engineering, listing pipeline) is hosted at [evlek.app](https://evlek.app) and remains proprietary. This repository focuses on documentation, the Anthropic Registry manifest, and integration examples.

### Security model

Per [OWASP MCP Top 10](https://owasp.org/www-project-mcp-top-10/):

- **Per-IP rate limit:** 60 req/min
- **Global rate limit:** 500 req/min (Supabase/Vercel guard)
- **Hard timeout:** 30 seconds per request
- **Input validation:** Zod schemas, every tool
- **Output sanitization:** Indirect prompt-injection defense (8-pattern regex)
- **Response size caps:** Max 10 results per query
- **Database access:** Supabase anon key + Row Level Security
- **Error containment:** No stack traces leaked
- **Observability:** Sentry per-tool spans + breadcrumbs + duration tracking

See [evlek.app/security](https://evlek.app/security) for the full disclosure policy.

---

## Roadmap

- [x] **v1.0** — 3 tools (search, price index, market overview)
- [x] **v1.2** — 9 tools (added compare_cities, yield_estimate, legal_info, suggest_neighborhood, compare_properties, district_profile)
- [ ] **v2.0** *(Q2 2026)* — 15 tools, namespace prefixes, +6 new (mortgage, acquisition_cost, near_university, analyze_ruhsat, convert_price, blog_search)
- [ ] **v2.1** *(Q3 2026)* — Additional micro-MCPs: `evlek-poi-mcp` (POI + coast distance), `evlek-agent-mcp` (B2B agent finder)
- [ ] **v3.0** *(Q4 2026)* — `get_market_pulse_30day`, `get_construction_status`, `find_emergency_short_term`
- [ ] **Vision (2027)** — Multimodal `search_by_image`, auth-gated tools (favorites, viewing requests, contact reveal), webhook subscriptions

---

## Status

- **MCP version:** 1.2.0 (live)
- **Endpoint:** `https://evlek.app/api/mcp`
- **Anthropic Registry:** [`app.evlek/mcp-server`](https://registry.modelcontextprotocol.io) — `isLatest: true`
- **Health:** [evlek.app/status](https://evlek.app/status)
- **Documentation:** [evlek.app/mcp](https://evlek.app/mcp)

---

## Contributing

This server is operated by Evlek. The hosted implementation is proprietary, but **this repository (manifest + docs + examples + reference clients)** is open under MIT.

Documentation issues and PRs are welcome — typo fixes, clarifications, additional client examples, translations of the README. For bugs against the hosted server, open an issue with the `server-bug` label and include your prompt, the tool called, and the response (with PII redacted).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## License

**MIT** — see [LICENSE](./LICENSE).

The hosted Evlek service (web app, mobile app, listing data, AI prompts, database schemas) is proprietary and not covered by this license.

> **Trademark notice:** "Evlek" is a trademark of Onur Dokuzoğlu. The MIT license covers source code only — it does not grant rights to use the "Evlek" name, logo, or branding except as described in this README. To request brand usage permission, contact hello@evlek.app.

---

## Links

- **Web:** [evlek.app](https://evlek.app)
- **iOS:** [App Store](https://apps.apple.com/app/id6760562764)
- **Android:** Internal Test (closed beta)
- **MCP endpoint:** `https://evlek.app/api/mcp`
- **MCP documentation:** [evlek.app/mcp](https://evlek.app/mcp)
- **Anthropic Registry:** [`app.evlek/mcp-server`](https://registry.modelcontextprotocol.io)
- **Model Context Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Contact:** hello@evlek.app

---

*Built in North Cyprus by an architect, not a software firm. Powered by [Anthropic Claude](https://claude.ai), [Supabase](https://supabase.com), [Vercel](https://vercel.com), and the [Model Context Protocol](https://modelcontextprotocol.io).*
