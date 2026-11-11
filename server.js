// Servidor estático mínimo (sin dependencias): node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4321;
const ROOT = __dirname;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';
  const file = path.join(ROOT, path.normalize(rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Mi Entreno en este equipo:  http://localhost:${PORT}`);
  // Direcciones para abrirla desde el celular (misma red WiFi)
  for (const list of Object.values(require('os').networkInterfaces())) {
    for (const n of list) if (n.family === 'IPv4' && !n.internal) console.log(`Desde el celular (misma WiFi): http://${n.address}:${PORT}`);
  }
});
