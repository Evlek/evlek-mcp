# Evlek MCP — Configuration Examples

Copy-paste configurations for popular MCP clients.

## Claude Desktop

File location:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

See [`claude-desktop-config.json`](./claude-desktop-config.json) — uses `mcp-remote` adapter for HTTP transport.

## Cursor / Cursor IDE

`Settings → Cursor → Tools & Integrations → MCP`

See [`cursor-config.json`](./cursor-config.json) — Cursor supports MCP natively over HTTP.

> **Note:** Cursor has a global cap of **40 MCP tools across all servers**. Evlek uses 9 tools (15 in v2.0), so you have headroom.

## Continue (VS Code / JetBrains)

`~/.continue/config.json`

See [`continue-config.json`](./continue-config.json) — uses Continue's `experimental.modelContextProtocolServers` array.

## VS Code (GitHub Copilot)

`.vscode/mcp.json` (workspace) or `~/.config/github-copilot/mcp.json` (global)

See [`vscode-mcp-config.json`](./vscode-mcp-config.json) — same `streamable-http` transport.

## Zed

`~/.config/zed/settings.json` — under `context_servers`:

```json
{
  "context_servers": {
    "evlek": {
      "settings": {
        "url": "https://evlek.app/api/mcp"
      }
    }
  }
}
```

## Windsurf

`Settings → MCP Servers → Add` — paste:

```
Name: Evlek
URL: https://evlek.app/api/mcp
```

## Gemini CLI

```bash
gemini-cli mcp add evlek https://evlek.app/api/mcp
```

Or in `~/.gemini/config.json`:

```json
{
  "mcpServers": {
    "evlek": {
      "url": "https://evlek.app/api/mcp"
    }
  }
}
```

## ChatGPT

ChatGPT Plus / Pro / Business: `Settings → Apps & Connectors → Add Custom Connector` (Apps SDK GA September 2025).

URL: `https://evlek.app/api/mcp`

> **Note:** Public ChatGPT App Directory listing pending — see roadmap.

## Direct API (cURL)

For testing without a client:

```bash
# List all tools
curl -X POST https://evlek.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Call a tool
curl -X POST https://evlek.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "search_listings",
      "arguments": {
        "city": "girne",
        "type": "rent",
        "bedrooms": 2,
        "limit": 5
      }
    }
  }'
```

## MCP Inspector (debugging)

```bash
npx @modelcontextprotocol/inspector https://evlek.app/api/mcp
```

Opens an interactive UI to test all tools.

---

For full tool reference, see [`../TOOLS.md`](../TOOLS.md).

For the public Anthropic Registry entry, see [`../server.json`](../server.json).
