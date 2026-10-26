import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const portOption = process.argv.slice(2).find(value => value.startsWith('--port='));
const port = Number(portOption ? portOption.slice('--port='.length) : 4183);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Port must be an integer between 1 and 65535.');
const types = { '.wav': 'audio/wav', '.json': 'application/json; charset=utf-8', '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.md': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };

const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
      return;
    }
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (url.pathname === '/') {
      response.writeHead(302, { Location: './app/' }).end();
      return;
    }
    const pathname = decodeURIComponent(url.pathname);
    const target = path.resolve(root, `.${pathname}`);
    const relative = path.relative(root, target);
    if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(part => part.startsWith('.'))) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const stat = await fs.stat(target);
    if (stat.isDirectory() && !url.pathname.endsWith('/')) {
      response.writeHead(302, { Location: `${url.pathname}/${url.search}` }).end();
      return;
    }
    const file = stat.isDirectory() ? path.join(target, 'index.html') : target;
    const resolved = await fs.realpath(file);
    const resolvedRelative = path.relative(root, resolved);
    if (resolvedRelative.startsWith('..') || path.isAbsolute(resolvedRelative)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const content = await fs.readFile(resolved);
    response.writeHead(200, {
      'Content-Type': types[path.extname(resolved).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Length': content.byteLength,
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    const status = error instanceof URIError ? 400 : ['ENOENT', 'ENOTDIR'].includes(error.code) ? 404 : 500;
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(status === 404 ? 'Not found' : status === 400 ? 'Invalid URL' : 'Unable to serve file');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `端口 ${port} 正在使用。请运行 npm run dev -- --port=4184。` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/app/`));
process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());
