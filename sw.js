const CACHE = '8day-tracker-v79';
const ASSETS = ['./index.html','./manifest.json','./icon-192.png','./icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if(e.request.url.includes('firebase')||e.request.url.includes('googleapis')||e.request.url.includes('firestore')) return;
  // Network-first for the app page so updates arrive immediately; cache as offline fallback
  if(e.request.mode==='navigate'||e.request.url.endsWith('/index.html')){
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
      caches.open(CACHE).then(c=>c.put(e.request,r.clone()));
      return r;
    }).catch(()=>caches.match('./index.html'));
  }));
});
