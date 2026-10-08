const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const s = 'text-gray-400">expand_more</span>';
const r = 'dark:text-gray-400">expand_more</span>';
let n = c.split(s).join(r);
fs.writeFileSync('index.html', n);
console.log('Done');