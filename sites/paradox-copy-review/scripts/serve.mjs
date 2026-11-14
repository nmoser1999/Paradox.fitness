import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.argv[2] || 4337);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
const server = createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    const route = decodeURIComponent(new URL(request.url, `http://127.0.0.1:${port}`).pathname);
    if (route === '/__qa') {
      const size = Math.min(1200, Math.max(320, Number(new URL(request.url, `http://127.0.0.1:${port}`).searchParams.get('width')) || 390));
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(`<!doctype html><html lang="en"><title>Responsive review QA</title><body style="margin:0;background:#ddd;padding:12px"><iframe title="Responsive review" src="/" style="display:block;width:${size}px;height:844px;border:0;background:white"></iframe></body></html>`);
      return;
    }
    let path = resolve(root, `.${route}`);
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const body = await readFile(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404, { 'Content-Type': 'text/plain' }); response.end('Page not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/`));
