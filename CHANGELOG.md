# Changelog

Notable changes to the Evlek MCP surface (the hosted service at
`https://evlek.app/api/mcp`, which this repository's local stdio server and
static manifests — `tools.json`, `server.json`, `TOOLS.md` — mirror). Loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

> This repository's manifests drifted from the live server for an extended
> period before this file existed (see "Sözleşme dosyaları" in the README).
> The **2.0.0** and **2.1.0** entries below are both hosted-service releases
> that predate this CHANGELOG — they are recorded together, in the same PR
> that stopped hand-maintaining `tools.json` and made it a direct projection
> of the live server's own tool definitions instead.

## 3.0.2 (2026-10-09)

Synced to the live server contract of Evlak-Emlak 3.0.2 (`pnpm mcp:export-public`).

- ChatGPT only: `search_listings`, `search`, `get_listing` and `fetch` answer the model with a short summary and put the
  full listing data in the result `_meta["evlek/widget"]`, which ChatGPT delivers only to the widget. Other clients are unchanged.
- Widget URIs `-v3-2` (the `-v3-1` and `-v3` URIs keep answering).
- `search_listings` / `search` outputSchema require only `total`; summary fields declared as optional properties.
- Tool titles in sentence case ("Search Northern Cyprus property listings", "Get an Evlek listing", ...).
- `market_stats` prints a price per m² as a whole number.

## 3.0.1 (2026-10-08)

Not synced separately; included in 3.0.2. Accuracy and widget redesign after the first live ChatGPT test: the searched
amenity leads every card, model guidance line in the text, `matchedFeatures` on cards, `idempotentHint` annotations,
default page 8, widget URIs `-v3-1`.

## [3.0.0] - 2026-10-08

Hosted service release (Evlak-Emlak PR #886); this repository synced to it.

### Changed — breaking

The 12 v2 tools are consolidated into **8**: `search_listings`, `search`,
`fetch`, `get_listing`, `compare_listings`, `market_stats`,
`list_locations`, `convert_currency`. Every tool is backed by one shared
engine, so the tool text and `structuredContent` of a listing are built from
the same data.

Renamed tools stay callable as **deprecated aliases for one release** (not in
`tools/list`; the answer starts with a `Deprecated: …` line and carries
`structuredContent.deprecated`). **They are removed in 3.1.0.**

| Old name | New name |
|---|---|
| `get_listing_detail` | `get_listing` (`propertyId` → `ref`) |
| `get_listing_by_number` | `get_listing` (`listingNumber` → `ref`) |
| `compare_properties` | `compare_listings` (`listingIds` → `ids`) |
| `get_price_index` | `market_stats` (`type` → `transaction`) |
| `compare_cities` | `market_stats` (`cities` → `city`, `type` → `transaction`) |
| `get_district_profile` | `market_stats` |
| `payment_plan` | `convert_currency` (`price` → `amount`; name reserved) |

- `search_listings` has a new input schema: `transaction` (was `type`),
  `priceMin`/`priceMax` (was `minPrice`/`maxPrice`), `sort` (was
  `sortBy`), cursor paging with `cursor` (was `offset`), amenities in
  `features` (were separate booleans), plus `bathroomsMin`, area and
  land-area ranges, `currency`, `billsIncluded`, `availableNow`,
  `noDeposit`, `contractType`, `nearUniversity`, `bbox`, `locale`.
  At most 10 listings per call; without `transaction` sale and rent come
  back as two groups, each with its own cursor.
- `convert_currency` takes `amount` (was `price`); `list_locations`
  gained `includeAliases`, `includeEmpty`.
- Interactive widget URIs moved to `ui://evlek/*-v3.html`; `get_listing`
  and `fetch` bind the detail view, `market_stats` the statistics view.

### Added

- `locale` (`tr` · `en` · `ru` · `de` · `ar`) on the structured
  tools: answer text, amenity names, number formats and links follow it;
  `search` answers in the language of its query.

### Fixed (this repository)

- `tools.json` / `TOOLS.md` re-exported from the 3.0.0 source. The
  `Contract Drift` workflow had failed every daily run since 10 Sep 2026
  (the hosted `search_listings` had a `query` key tools.json lacked); it
  is green again against the live 3.0.0 server.
- `server.json` kept in registry-manifest shape (name
  `app.evlek/mcp-server`, description ≤ 100 characters), version 3.0.0 and
  the 8-tool `_meta` list.
- README: tool table, rename table, widget URIs, contract-file rules.

## [2.1.0] - 2026-09-08

### Changed

- City and district filters/lookups now accept full names and exonyms, not
  only slugs — `Girne`/`Kyrenia`, `Lefkoşa`/`Nicosia` (German `Nikosia`,
  Russian `Кирения`/`Никосия` also recognized), `Gazimağusa`/`Famagusta`.
- `offset` past the end of a result set now returns an empty, successful
  result whose message says so, instead of an error.
- Tools that take a listing id (`get_listing_detail`, `compare_properties`,
  `get_listing_by_number`, and `fetch`) now also accept an `EVL-…` listing
  number, not only a UUID.
- Parameter names were aligned to camelCase across the surface; the previous
  snake_case names are still accepted as aliases (`listing_ids` →
  `listingIds`, `property_id` → `propertyId`, `listing_number` →
  `listingNumber`).
- `%` and `_` are now treated as literal characters in city/district
  filters, not SQL `LIKE` wildcards.

### Changed — breaking

- `get_district_profile`'s rent/price ratio fields were renamed:
  `askingRentToAskingPricePct` is now the field name, alongside new
  `ratioMetricType` and `isObservedIncome` (always `false` — this is a
  derived asking-price ratio, never observed rental income, a valuation, or
  a forecast).

### Fixed (this repository)

- `tools.json` is now the byte-identical projection the live server itself
  answers `tools/list` from, generated by `pnpm mcp:export-public` in the
  source repo and copied here verbatim — the previous hand-maintained copy
  had drifted to 15 tools (4 already removed from the live server, 1 live
  tool never added).
- `src/index.js` and `scripts/smoke-test.mjs` assumed the old
  `{ tools: [...] }` wrapper shape for `tools.json`; the new projection is a
  flat array, so the local stdio server crashed on `tools/list` (and on
  startup) until this was fixed here.
- `src/index.js` no longer hardcodes its reported server version — it reads
  `package.json`, so `package.json`, `server.json`, `TOOLS.md`, and the
  running server can no longer report three different version numbers.
- Removed `scripts/sync-tools.mjs` and `scripts/sync-docs.mjs` (`npm run
  sync-tools` / `npm run sync-docs`). Both regenerated `tools.json`/`TOOLS.md`
  directly from a live fetch in a different shape than the source repo's
  projection — the exact mechanism that caused the drift above. `tools.json`,
  `server.json`, and `TOOLS.md` are edited only by re-running
  `pnpm mcp:export-public` in the source repo and copying the output here;
  see the README.
- Added CI: `contract-drift` (daily + on PR) compares the live server's
  `tools/list` against `tools.json` — name set, `annotations`, and each
  tool's `inputSchema` keys — and fails the build on any mismatch instead of
  letting it sit unnoticed; it skips (not fails) when `evlek.app` is
  unreachable. `smoke` runs the existing offline + live smoke test on every
  push and PR.

## [2.0.0] - 2026-09-08

### Removed — breaking

`get_yield_estimate`, `suggest_neighborhood`, `student_housing`, and
`get_market_overview` were removed (15 → 12 tools). None has a like-for-like
replacement — the functionality was deliberately dropped, not renamed:

- **No modelled rental-yield tool is offered.** For descriptive rent/price
  facts (explicitly not a yield, valuation, or forecast), use
  `get_district_profile` together with the
  `evlek://guides/neighborhood-personas` resource.
- **Student housing:** use `search_listings` (filter by city, district,
  bedrooms, price) together with the `evlek://guides/universities` resource
  for the KKTC university catalogue.
- **General market overview:** use `get_price_index` and `compare_cities`,
  which read the same live active-listing data as the rest of the surface —
  `get_market_overview` used to read a separate, staler snapshot.

### Added

- `convert_currency` — GBP/EUR/USD/TRY conversion from stored, date-stamped
  FX rates; fails closed (no amounts returned) if rates are missing or
  stale.
- Every tool now declares
  `annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }`.
- `server/discover` method, a `resultType` field on tool results, and
  `_meta.serverInfo`. Protocol `2026-07-28`.

### Note

- `payment_plan` is **not** removed. It currently performs currency
  conversion only (the same computation as `convert_currency`) — the name is
  reserved for a real installment/payment-schedule tool planned under it,
  which will get its own entry here when it ships.
