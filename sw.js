var CACHE_NAME = 'rl-hub-v1';
var urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './fennec.glb',
  './octane.glb',
  './dominus.glb',
  './ball.glb'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) return response;
      return fetch(event.request).then(function(fetchRes) {
        if (!fetchRes || fetchRes.status !== 200 || fetchRes.type !== 'basic') {
          return fetchRes;
        }
        var resClone = fetchRes.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, resClone);
        });
        return fetchRes;
      }).catch(function() {
        return new Response('Offline');
      });
    })
  );
});
