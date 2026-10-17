const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, 'news');
const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.html') && f !== 'index.html');

let fixedCount = 0;
let errorCount = 0;

for (const file of files) {
  const fullPath = path.join(newsDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace og-image.png with site_logo.png
  const oldOgImg = 'https://passwordmonkey.org/images/og-image.png';
  const newOgImg = 'https://passwordmonkey.org/images/site_logo.png';

  if (content.includes(oldOgImg)) {
    content = content
      .replace(new RegExp(oldOgImg, 'g'), newOgImg)
      .replace(/\s*\n/g, '\n')  // Clean up potential extra whitespace
    ;
    fs.writeFileSync(fullPath, content, 'utf8');
    fixedCount++;
    console.log(`✅ Fixed: ${file}`);
  }
}

console.log(`\nMigration complete: ${fixedCount} article(s) fixed.`);