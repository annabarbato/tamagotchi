import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve('.');
const port = Number(process.env.PORT || 4173);

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function resolvePath(urlPath) {
  const requested = normalize(decodeURIComponent(urlPath.split('?')[0]));
  const safePath = requested === '/' ? '/index.html' : requested;
  const absolute = resolve(join(root, safePath));
  return absolute.startsWith(root) ? absolute : join(root, 'index.html');
}

createServer((request, response) => {
  const filePath = resolvePath(request.url || '/');
  const target = existsSync(filePath) && statSync(filePath).isFile()
    ? filePath
    : join(root, 'index.html');

  response.writeHead(200, {
    'Content-Type': types[extname(target)] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });

  createReadStream(target).pipe(response);
}).listen(port, () => {
  console.log(`Real Retro Tamagotchi running at http://localhost:${port}`);
});
