#!/usr/bin/env node
// ============================================================================
// Evlek MCP — local stdio server
// ============================================================================
// A real MCP server (official SDK, stdio transport) for Northern Cyprus
// property data. Tool definitions are embedded locally (tools.json), so
// initialize / tools/list are answered entirely offline — no network needed
// for introspection. When a tool is *called*, the handler fetches fresh data
// from Evlek's public data API (https://evlek.app/api/mcp), like any
// API-backed MCP server (weather servers → weather API, this → Evlek API).
//
// Zero business logic lives here by design: pricing, legal content, search
// ranking, and sanitization are computed server-side by the Evlek service.
// This package contains only the tool contract + data fetch.
//
// License: MIT (this repository). The hosted Evlek service and its data
// remain proprietary — see NOTICE.
// ============================================================================

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_API = process.env.EVLEK_API_URL ?? 'https://evlek.app/api/mcp';
const REQUEST_TIMEOUT_MS = 25_000;

// Embedded tool contract — generated from the live service by
// `npm run sync-tools`. Serving this locally means introspection
// (tools/list) works with zero network access.
const manifest = JSON.parse(
    readFileSync(join(__dirname, '..', 'tools.json'), 'utf8')
);

const server = new Server(
    { name: 'evlek-mcp', version: '1.6.0' },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: manifest.tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const known = manifest.tools.some((t) => t.name === name);
    if (!known) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Unknown tool "${name}". Available tools: ${manifest.tools
                        .map((t) => t.name)
                        .join(', ')}.`,
                },
            ],
            isError: true,
        };
    }

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        const res = await fetch(DATA_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/call',
                params: { name, arguments: args ?? {} },
            }),
            signal: controller.signal,
        });
        clearTimeout(timer);

        if (!res.ok) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Evlek data API returned HTTP ${res.status}. Please retry shortly.`,
                    },
                ],
                isError: true,
            };
        }

        const json = await res.json();
        if (json.error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Evlek data API error: ${json.error.message ?? 'unknown error'}`,
                    },
                ],
                isError: true,
            };
        }
        // Pass the tool result through untouched — content, structuredContent
        // and isError semantics are produced (and sanitized) server-side.
        return json.result;
    } catch (err) {
        const reason =
            err?.name === 'AbortError'
                ? `timed out after ${REQUEST_TIMEOUT_MS / 1000}s`
                : 'network error';
        return {
            content: [
                {
                    type: 'text',
                    text: `Could not reach the Evlek data API (${reason}). Live listing data requires internet access; tool schemas remain available offline.`,
                },
            ],
            isError: true,
        };
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(
    `[evlek-mcp] stdio server ready — ${manifest.tools.length} tools (data: ${DATA_API})`
);
