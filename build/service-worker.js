importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.setConfig({
  debug: false
});

// Cache de la aplicación shell
workbox.routing.registerRoute(
  ({request}) => request.destination === 'script' ||
                request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Cache de imágenes
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
      }),
    ],
  })
);

// Cache de fuentes
workbox.routing.registerRoute(
  ({request}) => request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
      }),
    ],
  })
);

// Cache de API calls
workbox.routing.registerRoute(
  ({url}) => url.pathname.startsWith('/api'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 horas
      }),
    ],
  })
);

// Página offline
const offlineFallbackPage = '/offline.html';

// Cache la página offline
workbox.routing.registerRoute(
  ({request}) => request.destination === 'document',
  new workbox.strategies.NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
      }),
    ],
  })
);

// Manejo de solicitudes fallidas
workbox.routing.setCatchHandler(({event}) => {
  switch (event.request.destination) {
    case 'document':
      return caches.match(offlineFallbackPage);
    case 'image':
      return new Response(
        '<svg width="400" height="300" role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>',
        {headers: {'Content-Type': 'image/svg+xml'}}
      );
    default:
      return Response.error();
  }
});

// Sincronización en segundo plano
workbox.routing.registerRoute(
  ({url}) => url.pathname.startsWith('/api/sync'),
  new workbox.strategies.NetworkOnly({
    plugins: [
      new workbox.backgroundSync.BackgroundSyncPlugin('syncQueue', {
        maxRetentionTime: 24 * 60 // 24 horas
      })
    ]
  })
);

// Precarga de recursos críticos
workbox.precaching.precacheAndRoute([
  {url: '/', revision: '1.0.0'},
  {url: '/index.html', revision: '1.0.0'},
  {url: '/offline.html', revision: '1.0.0'},
  {url: '/manifest.json', revision: '1.0.0'},
  {url: '/static/js/main.chunk.js', revision: '1.0.0'},
  {url: '/static/js/bundle.js', revision: '1.0.0'},
  {url: '/static/css/main.chunk.css', revision: '1.0.0'},
]);

// Manejo de actualizaciones
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificaciones push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {action: 'explore', title: 'Ver detalles'},
      {action: 'close', title: 'Cerrar'}
    ]
  };

  event.waitUntil(
    self.registration.showNotification('POSENT', options)
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 