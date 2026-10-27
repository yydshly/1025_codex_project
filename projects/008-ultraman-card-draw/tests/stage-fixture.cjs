// Isolated local browser fixture: does not read or write the user's collection.
// Usage: node tests/stage-fixture.cjs [port]
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const app = path.resolve(__dirname, '..', 'app');
const port = Number(process.argv[2] || 8774);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png' };
const instrumentation = `<script>
  (() => {
    const state = document.documentElement.dataset;
    state.testSpeaks = '0'; state.testCancels = '0'; state.testSpeaking = 'false';
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices() { return []; },
      speak() { state.testSpeaks = String(Number(state.testSpeaks) + 1); state.testSpeaking = 'true'; },
      cancel() { state.testCancels = String(Number(state.testCancels) + 1); state.testSpeaking = 'false'; }
    }});
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  })();
</script>`;

http.createServer((req, res) => {
  let requestPath;
  try { requestPath = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (requestPath === '/') requestPath = '/index.html';
  const target = path.resolve(app, '.' + requestPath);
  if (!target.startsWith(app + path.sep)) { res.writeHead(403).end(); return; }
  try {
    let body = fs.readFileSync(target);
    if (requestPath === '/index.html') body = Buffer.from(body.toString('utf8').replace('<script src="app.js" defer></script>', `${instrumentation}<script src="app.js" defer></script>`));
    if (requestPath === '/profiles.js') body = Buffer.from(body.toString('utf8').replaceAll('assets/tiga-foreground.png', 'assets/missing-tiga-foreground.png').replaceAll('assets/ultraman-foreground.png', 'assets/missing-ultraman-foreground.png'));
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Stage fixture ready: http://127.0.0.1:${port}/`));
