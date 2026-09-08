#!/usr/bin/env node
// Compares this repo's embedded tools.json against the live server's own
// `tools/list` response — name set, `annotations`, and each tool's
// `inputSchema` property keys must match exactly. Exits non-zero (CI red)
// on any mismatch. Network reachability is decided by the CI workflow
// BEFORE this script runs (see .github/workflows/contract-drift.yml) — this
// script assumes both inputs are already on disk and just compares them.
//
// Usage: node scripts/check-contract-drift.mjs <live-tools-list-response.json> <tools.json>
import { readFileSync } from 'node:fs';

const [, , liveResponsePath, localToolsPath] = process.argv;
if (!liveResponsePath || !localToolsPath) {
    console.error('Usage: check-contract-drift.mjs <live tools/list JSON-RPC response> <local tools.json>');
    process.exit(2);
}

function loadJson(path) {
    return JSON.parse(readFileSync(path, 'utf8'));
}

const liveResponse = loadJson(liveResponsePath);
const liveTools = liveResponse.result?.tools;
if (!Array.isArray(liveTools) || liveTools.length === 0) {
    console.error(`✗ ${liveResponsePath} has no result.tools array — cannot compare (live server error?).`);
    process.exit(1);
}

// tools.json (S2.1 C13) is a flat array — not a `{ tools: [...] }` wrapper.
const localTools = loadJson(localToolsPath);
if (!Array.isArray(localTools)) {
    console.error(`✗ ${localToolsPath} is not a flat array — expected the S2.1 C13 projection shape.`);
    process.exit(1);
}

function byName(list) {
    return new Map(list.map((t) => [t.name, t]));
}

function sortedKeys(obj) {
    return Object.keys(obj ?? {}).sort();
}

function arraysEqual(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
}

const live = byName(liveTools);
const local = byName(localTools);

let failures = 0;
function fail(msg) {
    console.error(`✗ ${msg}`);
    failures++;
}

const onlyLive = [...live.keys()].filter((n) => !local.has(n));
const onlyLocal = [...local.keys()].filter((n) => !live.has(n));

if (onlyLive.length) {
    fail(`Live server has tools not in tools.json (missing from public repo): ${onlyLive.join(', ')}`);
}
if (onlyLocal.length) {
    fail(`tools.json has tools the live server no longer serves (stale/removed): ${onlyLocal.join(', ')}`);
}

for (const name of live.keys()) {
    if (!local.has(name)) continue; // already reported above
    const liveTool = live.get(name);
    const localTool = local.get(name);

    const liveAnn = JSON.stringify(liveTool.annotations ?? null);
    const localAnn = JSON.stringify(localTool.annotations ?? null);
    if (liveAnn !== localAnn) {
        fail(`"${name}" annotations differ — live: ${liveAnn}, tools.json: ${localAnn}`);
    }

    const liveKeys = sortedKeys(liveTool.inputSchema?.properties);
    const localKeys = sortedKeys(localTool.inputSchema?.properties);
    if (!arraysEqual(liveKeys, localKeys)) {
        fail(
            `"${name}" inputSchema property keys differ — live: [${liveKeys.join(', ')}], tools.json: [${localKeys.join(', ')}]`
        );
    }
}

if (failures > 0) {
    console.error(`\n${failures} contract drift issue(s) found. Re-run \`pnpm mcp:export-public\` in the source repo and copy the output here (see CLAUDE.md / this repo's README "Sözleşme dosyaları").`);
    process.exit(1);
}

console.log(`✓ tools.json matches the live server — ${liveTools.length} tools, name set / annotations / inputSchema keys identical.`);
