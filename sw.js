const CACHE='divebreath-v16-fitscreen-countdown-install';
const ASSETS=["./", "./index.html", "./style.css", "./app.js", "./manifest.webmanifest", "./title-v12.jpg", "./lung-in-v12.jpg", "./lung-out-v12.jpg", "./airflow-v12.svg", "./diver-point.jpg", "./diver-front.jpg", "./diver-side.jpg", "./icon-192.png", "./icon-512.png"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
