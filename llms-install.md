# Installing Evlek MCP (for Cline and other AI installers)

Evlek MCP is a **hosted, remote** server. There is nothing to build, no API key and no account.

- **URL:** `https://evlek.app/api/mcp`
- **Transport:** Streamable HTTP
- **Auth:** none
- **Tools:** 8, all read-only (`search_listings`, `search`, `fetch`, `get_listing`, `compare_listings`, `market_stats`,
  `list_locations`, `convert_currency`)

## Cline

Add this to `cline_mcp_settings.json` (Cline → MCP Servers → Configure):

```json
{
  "mcpServers": {
    "evlek": {
      "type": "streamableHttp",
      "url": "https://evlek.app/api/mcp",
      "disabled": false
    }
  }
}
```

If the Cline version in use does not support remote servers, use the stdio bridge instead (Node.js 18 or later):

```json
{
  "mcpServers": {
    "evlek": {
      "command": "npx",
      "args": ["-y", "mcp-remote@0.1.16", "https://evlek.app/api/mcp"],
      "disabled": false
    }
  }
}
```

## Check that it works

Ask: *"Show me 2-bedroom apartments for rent in Kyrenia."* Cline should call `search_listings` and list Evlek listings with
links to evlek.app.

## Scope

Live Northern Cyprus property listings for sale and long-term rent, and asking-price statistics, in TR, EN, RU, DE and AR.
Asking prices only: no valuations, yield estimates, legal or investment advice. No contact details are returned; each listing
links to its page on evlek.app.
