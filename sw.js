// Offline support: everything the app needs is stored on the phone the first time it opens.
const V = "pmbh-capture-v1";
const FILES = ["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","lib/xlsx.full.min.js","lib/jszip.min.js",
  "ocr/tesseract.min.js","ocr/worker.min.js","ocr/tesseract-core-simd-lstm.wasm.js","ocr/tesseract-core-lstm.wasm.js","ocr/eng-lang.json"];
self.addEventListener("install", e => e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, {ignoreSearch:true}).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(V).then(c => c.put(e.request, copy)); }
    return r; })));
});
