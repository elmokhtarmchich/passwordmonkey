import http from 'node:http';
import { createStaticServer } from './serve.mjs';

const tests = [
  { path: '/', expected: 200, checks: ['toggle-visibility-btn', 'show-password-btn', 'qr_code_2', '2026 PasswordMonkey', 'content="#42b8ff"'] },
  { path: '/style.css', expected: 200, checks: ['password-hidden', 'show-password-btn'] },
  { path: '/script.js', expected: 200, checks: ['setPasswordHidden', 'toggleVisibilityBtn', 'showPasswordBtn'] },
  { path: '/manifest.json', expected: 200, checks: ['#181817', '#42b8ff'] },
  { path: '/about', expected: 200, checks: ['PasswordMonkey', '2026'] },
  { path: '/faq', expected: 200, checks: ['PasswordMonkey', '2026'] },
  { path: '/service-worker.js', expected: 200, checks: ['pm-cache-v16', 'MatrixtypeDisplay'] },
  { path: '/nonexistent-page', expected: 404, checks: ['404'] }
];

const server = createStaticServer();

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  console.log(`Test server listening on http://127.0.0.1:${port}/`);
  let allPassed = true;

  for (const t of tests) {
    await new Promise((resolve) => {
      http.get(`http://127.0.0.1:${port}${t.path}`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          const statusOk = res.statusCode === t.expected;
          const missing = (t.checks || []).filter(c => !body.includes(c));
          if (statusOk && missing.length === 0) {
            console.log(`  PASS: ${t.path} (${res.statusCode})`);
          } else {
            allPassed = false;
            console.log(`  FAIL: ${t.path} (got ${res.statusCode}, expected ${t.expected}, missing: ${missing.join(', ')})`);
          }
          resolve();
        });
      }).on('error', (e) => {
        allPassed = false;
        console.log(`  ERR: ${t.path} - ${e.message}`);
        resolve();
      });
    });
  }

  server.close(() => {
    console.log(`\nLocalhost Test Suite: ${allPassed ? 'ALL TESTS PASSED (8/8)' : 'FAILED'}`);
    process.exit(allPassed ? 0 : 1);
  });
});
