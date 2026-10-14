import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8'
};

function resolvePath(urlPath) {
  const cleanUrl = urlPath.split('?')[0].split('#')[0];
  let target = path.join(DIST_DIR, cleanUrl);

  // Check direct file match
  if (fs.existsSync(target) && fs.statSync(target).isFile()) {
    return target;
  }

  // Check directory index
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    const indexHtml = path.join(target, 'index.html');
    if (fs.existsSync(indexHtml)) return indexHtml;
  }

  // Clean-URL handling: /about -> /about.html
  if (fs.existsSync(target + '.html') && fs.statSync(target + '.html').isFile()) {
    return target + '.html';
  }

  // Fallback to 404.html
  const notFound = path.join(DIST_DIR, '404.html');
  if (fs.existsSync(notFound)) return notFound;

  return null;
}

export function createStaticServer() {
  return http.createServer((req, res) => {
    const filePath = resolvePath(req.url);

    if (!filePath) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const is404 = filePath.endsWith('404.html') && !req.url.startsWith('/404');
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const data = fs.readFileSync(filePath);
      res.writeHead(is404 ? 404 : 200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    }
  });
}

const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10);

export function startServer(port = DEFAULT_PORT) {
  const server = createStaticServer();
  server.listen(port, () => {
    console.log(`PasswordMonkey local preview server running:`);
    console.log(`  > http://localhost:${port}/`);
    console.log(`  Serving dist/ with Cloudflare Pages clean-URL routing`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startServer();
}
