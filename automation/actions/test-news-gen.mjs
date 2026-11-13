#!/usr/bin/env node

// Test generating a new article with non-truncated slug

async function testNewsGeneration() {
  const Parser = (await import('rss-parser')).default;

  const parser = new Parser({
    timeout: 15000,
    requestHeaders: { "User-Agent": "PasswordMonkey-News-Pipeline/1.0" }
  });

  const FEEDS = [
    "https://thehackernews.com/feeds/posts/default?alt=rss"
  ];

  try {
    const feed = await parser.parseURL(FEEDS[0]);
    const items = feed.items || [];

    console.log(`Testing with ${items.length} items from feed...\n`);

    // Test with the first item that has a long title
    const testItem = items.find(item =>
      item.title &&
      (item.title.length > 100 || item.title.toLowerCase().includes('sonicwall') || item.title.toLowerCase().includes('automakers'))
    ) || items[0];

    if (testItem) {
      console.log(`Title: ${testItem.title}`);
      console.log(`Title length: ${testItem.title.length}`);
      console.log(`\nGenerated filename will be: ${testItem.title.replace(/[^a-z0-9\s-]/g, '').toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').trim()}`);
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testNewsGeneration();
