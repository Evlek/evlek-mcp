#!/usr/bin/env node
// Regenerate tools.json from the live Evlek MCP endpoint.
// Run after any tool-surface change in the hosted service:
//   npm run sync-tools
import { writeFileSync } from 'node:fs';

const DATA_API = process.env.EVLEK_API_URL ?? 'https://evlek.app/api/mcp';

const res = await fetch(DATA_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
});
if (!res.ok) {
    console.error(`tools/list failed: HTTP ${res.status}`);
    process.exit(1);
}
const json = await res.json();
const tools = json.result?.tools;
if (!Array.isArray(tools) || tools.length === 0) {
    console.error('tools/list returned no tools — refusing to overwrite tools.json');
    process.exit(1);
}
writeFileSync(
    new URL('../tools.json', import.meta.url),
    JSON.stringify(
        {
            generatedFrom: `${DATA_API} tools/list`,
            protocolVersion: '2026-07-28',
            tools,
        },
        null,
        2
    ) + '\n'
);
console.log(`tools.json updated — ${tools.length} tools`);
