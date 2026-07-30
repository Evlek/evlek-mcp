#!/usr/bin/env node
// Behavioral smoke test: spawns the stdio server as a child process and
// speaks real MCP over stdin/stdout — initialize, tools/list, one offline
// failure path, and (unless OFFLINE=1) one live tools/call.
import { spawn } from 'node:child_process';

const OFFLINE = process.env.OFFLINE === '1';
const child = spawn('node', [new URL('../src/index.js', import.meta.url).pathname], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: OFFLINE ? { ...process.env, EVLEK_API_URL: 'https://127.0.0.1:1' } : process.env,
});

let buf = '';
const pending = new Map();
child.stdout.on('data', (d) => {
    buf += d.toString();
    let idx;
    while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line) continue;
        const msg = JSON.parse(line);
        if (msg.id !== undefined && pending.has(msg.id)) {
            pending.get(msg.id)(msg);
            pending.delete(msg.id);
        }
    }
});

let nextId = 1;
function rpc(method, params) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
        pending.set(id, resolve);
        setTimeout(() => reject(new Error(`timeout waiting for ${method}`)), 30_000);
        child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
}

let failures = 0;
function check(label, ok, detail = '') {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures++;
}

const init = await rpc('initialize', {
    protocolVersion: '2026-07-28',
    capabilities: {},
    clientInfo: { name: 'evlek-mcp-smoke', version: '1.0' },
});
check('initialize', !!init.result?.serverInfo, init.result?.serverInfo?.name);

const list = await rpc('tools/list', {});
const tools = list.result?.tools ?? [];
check('tools/list count', tools.length === 18, `${tools.length} tools`);
check(
    'tools/list annotations',
    tools.every((t) => t.annotations?.readOnlyHint === true),
    'readOnlyHint on all'
);

if (OFFLINE) {
    const call = await rpc('tools/call', {
        name: 'list_locations',
        arguments: {},
    });
    check(
        'offline tools/call → graceful isError',
        call.result?.isError === true &&
            /Could not reach/.test(call.result?.content?.[0]?.text ?? '')
    );
} else {
    const call = await rpc('tools/call', { name: 'list_locations', arguments: {} });
    const text = call.result?.content?.[0]?.text ?? '';
    check('live tools/call list_locations', !call.result?.isError && text.includes('Girne'));
    const bad = await rpc('tools/call', { name: 'no_such_tool', arguments: {} });
    check('unknown tool → isError', bad.result?.isError === true);
}

child.kill();
process.exit(failures === 0 ? 0 : 1);
