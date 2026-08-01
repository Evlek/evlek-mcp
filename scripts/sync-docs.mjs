#!/usr/bin/env node
// Regenerate TOOLS.md from the live Evlek MCP endpoint (tools + resources +
// resource templates + prompts). Run alongside `npm run sync-tools` after any
// change to the hosted tool surface:
//   npm run sync-tools && npm run sync-docs
//
// TOOLS.md used to be maintained by hand, which is how it drifted to claiming
// 18 tools / 8 resources / 4 prompts after the hosted surface dropped to
// 15 / 7 / 2 (PR-E, koçan & legal scope exit). Generate it instead.
import { writeFileSync, readFileSync } from 'node:fs';

const DATA_API = process.env.EVLEK_API_URL ?? 'https://evlek.app/api/mcp';

async function rpc(method) {
    const res = await fetch(DATA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method }),
    });
    if (!res.ok) throw new Error(`${method} failed: HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(`${method} failed: ${json.error.message}`);
    return json.result;
}

const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

const [toolsRes, resourcesRes, templatesRes, promptsRes] = await Promise.all([
    rpc('tools/list'),
    rpc('resources/list'),
    rpc('resources/templates/list'),
    rpc('prompts/list'),
]);

const tools = toolsRes.tools ?? [];
const resources = resourcesRes.resources ?? [];
const templates = templatesRes.resourceTemplates ?? [];
const prompts = promptsRes.prompts ?? [];

if (tools.length === 0) {
    console.error('tools/list returned no tools — refusing to overwrite TOOLS.md');
    process.exit(1);
}

const out = [];
out.push('# Evlek MCP — Tool Reference');
out.push(
    `Full input schemas for all ${tools.length} tools in **v${version}** (protocol \`2026-07-28\`). Generated from the live \`tools/list\` response by \`npm run sync-docs\` — do not edit by hand.`
);
out.push('');
out.push(
    '> **Caveats:** `get_yield_estimate` and `payment_plan` are estimates computed on source-dated inputs — **not financial advice**. Evlek does not expose title-deed (koçan) or legal-procedure tools: that taxonomy has not passed an independent KKTC legal audit, so it is deliberately out of the MCP surface.'
);
out.push('');
out.push('---');
out.push('');

tools.forEach((tool, i) => {
    out.push(`## ${i + 1}. \`${tool.name}\``);
    if (tool.title) out.push(`**${tool.title}**`);
    out.push('');
    if (tool.description) {
        out.push(tool.description);
        out.push('');
    }
    out.push('### Input schema');
    out.push('```json');
    out.push(JSON.stringify(tool.inputSchema ?? {}, null, 2));
    out.push('```');
    if (tool.outputSchema) {
        out.push('');
        out.push('### Output schema');
        out.push('```json');
        out.push(JSON.stringify(tool.outputSchema, null, 2));
        out.push('```');
    }
    out.push('');
    out.push('---');
    out.push('');
});

out.push(`## Resource templates (${templates.length})`);
out.push('');
for (const t of templates) out.push(`- \`${t.uriTemplate}\` — ${t.name}`);
out.push('');

out.push(`## Resources (${resources.length})`);
out.push('');
out.push('| URI | Name |');
out.push('|---|---|');
for (const r of resources) out.push(`| \`${r.uri}\` | ${r.name} |`);
out.push('');

out.push(`## Prompts (${prompts.length})`);
out.push('');
for (const p of prompts) {
    out.push(`### \`${p.name}\``);
    out.push('');
    if (p.description) {
        out.push(p.description);
        out.push('');
    }
}

writeFileSync(new URL('../TOOLS.md', import.meta.url), out.join('\n').replace(/\n{3,}/g, '\n\n'));
console.log(
    `TOOLS.md updated — ${tools.length} tools, ${resources.length} resources, ${templates.length} templates, ${prompts.length} prompts`
);
