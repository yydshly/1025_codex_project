import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.AGENT_SKILLS_GUIDE_PORT || 8010);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.png':'image/png'};
http.createServer((req, res) => {
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);return res.end();}
  let target;
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    target = path.resolve(root, '.' + (pathname === '/' ? '/app/index.html' : pathname));
    if (!target.startsWith(root + path.sep) || path.relative(root, target).split(path.sep).some(x => x.startsWith('.'))) throw Error('outside root');
    target = fs.realpathSync(target);
    if (!target.startsWith(root + path.sep) || !fs.statSync(target).isFile()) throw Error('not a file');
    res.writeHead(200, {'Content-Type':types[path.extname(target)] || 'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(target).pipe(res);
  } catch {res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});res.end('文件不存在');}
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/app/index.html`));
