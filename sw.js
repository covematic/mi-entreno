// Modo sin conexión: guarda la app y las fotos de ejercicios ya vistas.
const CACHE = 'mi-entreno-v1';
const APP = ['./', 'index.html', 'styles.css', 'js/app.js', 'js/data.js', 'js/catalog.js', 'manifest.webmanifest', 'icon.svg'];
const IMG_HOST = 'raw.githubusercontent.com';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === IMG_HOST) {
    // Fotos: primero la copia guardada; si no hay, se descarga (con CORS, para poder guardarla) y se guarda
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(url.href);
      if (hit) return hit;
      const res = await fetch(url.href, { mode: 'cors' });
      if (res.ok) c.put(url.href, res.clone());
      return res;
    }));
  } else if (url.origin === location.origin) {
    // App: primero la red (siempre la última versión); sin conexión, la copia guardada
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res.clone();
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html')))
    );
  }
});
