/**
 * PasswordMonkey → TencentDB Agent Memory (TDAI) client.
 *
 * Thin wrapper around the TDAI Gateway v3 HTTP API. Used by PasswordMonkey
 * automation scripts and coding agents to persist and recall project memory
 * (editorial decisions, template conventions, SEO rules, workflow knowledge).
 *
 * The TDAI Gateway runs standalone (Node, no Docker): see
 *   MemoryCore/tdai-gateway.local.yaml
 * Start it with:  node --import tsx MemoryCore/src/gateway/server.ts
 *
 * Defaults point at the local standalone gateway. Override via env:
 *   TDAI_ENDPOINT   gateway base URL  (default http://127.0.0.1:8420)
 *   TDAI_API_KEY    Bearer token      (default pm-local-memory-key)
 *   TDAI_SERVICE_ID memory instance   (default default)
 *   PM_TEAM_ID      team dimension    (default pm-team)
 *   PM_AGENT_ID     agent dimension   (default builder)
 *   PM_USER_ID      user dimension    (default pm-user)
 */

'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');

const ENDPOINT = process.env.TDAI_ENDPOINT || 'http://127.0.0.1:8420';
const API_KEY = process.env.TDAI_API_KEY || 'pm-local-memory-key';
const SERVICE_ID = process.env.TDAI_SERVICE_ID || 'default';
const TEAM_ID = process.env.PM_TEAM_ID || 'pm-team';
const AGENT_ID = process.env.PM_AGENT_ID || 'builder';
const USER_ID = process.env.PM_USER_ID || 'pm-user';

/** Per-PasswordMonkey memory instance id (isolated team/agent data). */
function defaultContext() {
    return { team_id: TEAM_ID, agent_id: AGENT_ID, user_id: USER_ID };
}

/** Parse the base endpoint into { hostname, port, lib } for reuse. */
function endpointParts() {
    const u = new URL(ENDPOINT);
    return {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        lib: u.protocol === 'https:' ? https : http,
    };
}

/**
 * Low-level JSON POST. Rejects non-2xx with a structured error.
 * `path` is appended to the endpoint base URL.
 */
function post(path, body, { headers = {}, timeoutMs = 10000 } = {}) {
    return new Promise((resolve, reject) => {
        const { hostname, port, lib } = endpointParts();
        const data = JSON.stringify(body);
        const req = lib.request(
            {
                hostname,
                port,
                path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tdai-service-id': SERVICE_ID,
                    Authorization: `Bearer ${API_KEY}`,
                    ...headers,
                },
            },
            (res) => {
                let raw = '';
                res.on('data', (c) => (raw += c));
                res.on('end', () => {
                    let parsed;
                    try {
                        parsed = raw ? JSON.parse(raw) : null;
                    } catch {
                        parsed = raw;
                    }
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        const err = new Error(
                            `TDAI ${path} → HTTP ${res.statusCode}: ${JSON.stringify(parsed ?? raw).slice(0, 300)}`
                        );
                        err.status = res.statusCode;
                        err.body = parsed;
                        reject(err);
                    }
                });
            }
        );
        req.on('error', reject);
        req.setTimeout(timeoutMs, () => {
            req.destroy(new Error(`TDAI ${path} timed out after ${timeoutMs}ms`));
        });
        req.write(data);
        req.end();
    });
}

/** Low-level GET (used for /health). */
function get(path, { headers = {}, timeoutMs = 3000 } = {}) {
    return new Promise((resolve, reject) => {
        const { hostname, port, lib } = endpointParts();
        const req = lib.get(
            {
                hostname,
                port,
                path,
                headers: { Authorization: `Bearer ${API_KEY}`, ...headers },
            },
            (res) => {
                let raw = '';
                res.on('data', (c) => (raw += c));
                res.on('end', () => {
                    let parsed;
                    try {
                        parsed = raw ? JSON.parse(raw) : null;
                    } catch {
                        parsed = raw;
                    }
                    resolve({ status: res.statusCode, body: parsed });
                });
            }
        );
        req.on('error', reject);
        req.setTimeout(timeoutMs, () => {
            req.destroy(new Error(`TDAI ${path} timed out`));
        });
    });
}

/**
 * Capture a conversation turn (L0) into memory.
 * messages: array of { role, content }
 * options:  { sessionId, teamId, agentId, userId }
 */
async function captureConversation(messages, options = {}) {
    const ctx = { ...defaultContext(), ...options };
    const body = {
        ...ctx,
        session_id: options.sessionId || `pm-${Date.now()}`,
        messages,
    };
    return post('/v3/conversation/add', body);
}

/**
 * Recall structured memory (L1) for a query.
 * Falls back gracefully if the gateway is unreachable.
 */
async function recallMemory(query, options = {}) {
    const ctx = { ...defaultContext(), ...options };
    try {
        return await post('/v3/atomic/search', { ...ctx, query });
    } catch (err) {
        return { code: 0, message: 'ok', data: { items: [] }, _offline: true, _error: err.message };
    }
}

/**
 * Search raw conversations (L0) by keyword.
 */
async function searchConversations(query, options = {}) {
    const ctx = { ...defaultContext(), ...options };
    try {
        return await post('/v3/conversation/search', { ...ctx, query });
    } catch (err) {
        return { code: 0, message: 'ok', data: { messages: [] }, _offline: true, _error: err.message };
    }
}

/**
 * List registered skills (PasswordMonkey editorial/review skills).
 */
async function listSkills(options = {}) {
    const ctx = { ...defaultContext(), ...options };
    try {
        return await post('/v3/skill/list', { ...ctx });
    } catch (err) {
        return { code: 0, message: 'ok', data: { items: [] }, _offline: true, _error: err.message };
    }
}

/** Health check. Returns true if the gateway answers. */
async function health() {
    try {
        const { status, body } = await get('/health');
        return status === 200 && body && body.status === 'ok';
    } catch {
        return false;
    }
}

module.exports = {
    captureConversation,
    recallMemory,
    searchConversations,
    listSkills,
    health,
    get,
    post,
    defaultContext,
    constants: { ENDPOINT, API_KEY, SERVICE_ID, TEAM_ID, AGENT_ID, USER_ID },
};