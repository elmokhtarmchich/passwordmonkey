/**
 * recall-memory.js — Query PasswordMonkey's TDAI memory from the command line.
 *
 * Usage:
 *   node scripts/recall-memory.js "article template SEO conventions"
 *   node scripts/recall-memory.js "manifest build" --source conversation
 *   node scripts/recall-memory.js "review checklist" --json
 *
 * Useful for agents and humans to pull project context before working.
 * Exits non-zero if the gateway is unreachable (so automation can detect it).
 */

'use strict';

const mem = require('./memory-client.js');

const args = process.argv.slice(2);
const query = args[0];
const asJson = args.includes('--json');
const source = args.includes('--source') ? args[args.indexOf('--source') + 1] : 'atomic';

if (!query) {
    console.error('Usage: node scripts/recall-memory.js "<query>" [--source atomic|conversation] [--json]');
    process.exit(2);
}

async function main() {
    const ok = await mem.health();
    if (!ok) {
        console.error('TDAI gateway is not reachable at', mem.constants.ENDPOINT);
        console.error('Start it:  cd MemoryCore && node --import tsx src/gateway/server.ts');
        process.exit(1);
    }

    const result =
        source === 'conversation'
            ? await mem.searchConversations(query)
            : await mem.recallMemory(query);

    if (asJson) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }

    const items = (result.data && (result.data.items || result.data.messages)) || [];
    if (items.length === 0) {
        console.log('(no memory found for this query)');
        return;
    }

    console.log(`Found ${items.length} memory item(s) for: "${query}"\n`);
    items.forEach((item, i) => {
        const content = item.content || item.text || JSON.stringify(item).slice(0, 400);
        const score = item.score != null ? ` [score ${Number(item.score).toFixed(4)}]` : '';
        const role = item.role ? ` [${item.role}]` : '';
        console.log(`--- ${i + 1}${role}${score} ---`);
        console.log(content);
        console.log('');
    });
}

main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
});