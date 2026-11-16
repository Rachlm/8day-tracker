const CACHE = '8day-tracker-v91';
const ASSETS = ['./index.html','./manifest.json','./icon-192.png','./icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'];
// Sync library: cached when possible so the app can reconnect after an offline start.
// Optional — a failure here never blocks the install.
const OPTIONAL = ['https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).then(() =>
    Promise.all(OPTIONAL.map(u => fetch(u, {mode:'cors'}).then(r => { if(r && r.ok) return c.put(u, r); }).catch(() => {})))
  )).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = e.request.url;
  if(e.request.method !== 'GET') return;
  // Sync library scripts: cache first, network as fallback
  if(url.includes('gstatic.com/firebasejs/')){
    e.respondWith(caches.match(url).then(c => c || fetch(e.request)));
    return;
  }
  // Live sync traffic is never cached
  if(url.includes('firebase')||url.includes('googleapis')||url.includes('firestore')) return;
  // Network-first for the app page so updates arrive immediately; cache as offline fallback
  if(e.request.mode==='navigate'||url.endsWith('/index.html')){
    e.respondWith(fetch(e.request).then(r=>{
      if(r&&r.status===200){const c=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c));}
      return r;
    }).catch(()=>caches.match(e.request).then(c=>c||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => {
    if(cached) return cached;
    return fetch(e.request).then(r => {
      if(!r||r.status!==200||r.type==='opaque') return r;
      const cl=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,cl));
      return r;
    }).catch(()=>caches.match('./index.html'));
  }));
});
