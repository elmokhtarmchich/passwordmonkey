#!/usr/bin/env node

import { buildArticleHtml } from "./automation/actions/news-pipeline.mjs";

async function testBuild() {
  const testItem = {
    title: "Test Title for Debugging",
    link: "https://test.com/article",
    publishedAt: new Date().toISOString(),
    summaryContent: "<p>Test content</p>",
    content: "<p>Test content</p>",
    description: "Test description",
    readingTime: 5,
    dateFormatted: "Test Date",
    dateISO: "2026-11-12"
  };

  try {
    console.log("Testing buildArticleHtml with test item...");
    const result = buildArticleHtml(testItem);
    console.log("Result:", result);
    console.log("Filename:", result.filename);
    console.log("Success!");
  } catch (err) {
    console.error("Error:", err);
  }
}

testBuild();
