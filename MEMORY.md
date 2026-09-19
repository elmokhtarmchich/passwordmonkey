# TencentDB Agent Memory — PasswordMonkey Integration

PasswordMonkey uses [TencentDB Agent Memory](https://github.com/TencentCloud/TencentDB-Agent-Memory)
as its long-term project memory. Every coding agent (and human) that works on the site
starts with the team's accumulated experience instead of re-learning from scratch.

## Architecture

```
PasswordMonkey scripts (Node)          TencentDB Agent Memory (Node, no Docker)
├── scripts/memory-client.js    ─── HTTP v3 API ──► MemoryCore gateway :8420
├── scripts/seed-memory.js      ─── capture ──────► SQLite + BM25 (L0/L1)
├── scripts/recall-memory.js    ─── search ───────► L0 conversations / L1 atoms
└── scripts/update-manifest.js  ─── capture ──────► best-effort memory events
```

The gateway runs **standalone** — no Docker, no external services. It uses SQLite +
local files + BM25 (jieba-segmented) for retrieval. LLM-based L1/L2/L3 extraction is
optional (needs an `TDAI_LLM_API_KEY`); BM25 recall and L0 conversation capture work
with zero LLM calls.

## Quick start

```bash
# 1. Start the memory gateway (one command, stays running)
cd MemoryCore
node --import tsx src/gateway/server.ts

# 2. Seed PasswordMonkey's conventions into memory (once)
cd ..
node scripts/seed-memory.js

# 3. Query memory before working
node scripts/recall-memory.js "article template SEO conventions"
node scripts/recall-memory.js "manifest build" --source conversation
```

## Scripts

| Script | Purpose |
|---|---|
| `scripts/memory-client.js` | HTTP client for the TDAI v3 API. Used by all other scripts. |
| `scripts/seed-memory.js` | Cold-start: captures editorial conventions, template rules, SEO requirements, workflow knowledge. |
| `scripts/recall-memory.js` | CLI query: `node scripts/recall-memory.js "<query>" [--source atomic\|conversation] [--json]` |
| `scripts/update-manifest.js` | Now also records a best-effort memory event after each manifest rebuild. |

## Configuration

All defaults live in `scripts/memory-client.js`. Override via environment:

| Variable | Default | Purpose |
|---|---|---|
| `TDAI_ENDPOINT` | `http://127.0.0.1:8420` | Gateway base URL |
| `TDAI_API_KEY` | `pm-local-memory-key` | Bearer token (matches `tdai-gateway.local.yaml`) |
| `TDAI_SERVICE_ID` | `default` | Memory instance id |
| `PM_TEAM_ID` | `pm-team` | Team dimension |
| `PM_AGENT_ID` | `builder` | Agent dimension |
| `PM_USER_ID` | `pm-user` | User dimension |

## Gateway config

The standalone gateway config is at `MemoryCore/tdai-gateway.local.yaml`. It enables
auth (`server.apiKey`), SQLite storage, BM25 retrieval, and the Skill module.
Extraction (L1/L2/L3) is disabled until an LLM key is provided — set
`TDAI_LLM_API_KEY` and the config will flip `extraction.enabled` on automatically.

## Data

Memory data lives at `MemoryCore/.tdai-data/` (SQLite `vectors.db`, conversations,
records, scene blocks, persona). It is git-ignored. Back it up before migrating.

## Team roles

```
PasswordMonkey
├── You · Set goals / Make decisions
├── Scout · Research / Find cybersecurity news
├── Builder · Write code / Build products (scripts, templates)
├── Reviewer · Test / Validate articles, SEO, structure
└── Agent Memory · Preserve the team's experience
```

Set `PM_AGENT_ID=scout|reviewer` to scope memory per role.