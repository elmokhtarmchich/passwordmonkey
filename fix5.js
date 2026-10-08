const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const n = c.replace(/text-gray-400">expand_more</span>/g, 'dark:text-gray-400">expand_more</span>');
fs.writeFileSync('index.html', n);
console.log('Done');