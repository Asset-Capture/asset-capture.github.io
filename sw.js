// Offline support. The app's own pages are fetched fresh whenever there is signal (so updates arrive by themselves)
// and fall back to the copy on the phone when there is none. The big reader files are kept on the phone and not re-downloaded.
const V = "asset-capture-v1";
const SHELL = ["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
const BIG = ["lib/xlsx.full.min.js","lib/jszip.min.js","lib/zxing.min.js","ocr/tesseract.min.js","ocr/worker.min.js","ocr/tesseract-core-simd-lstm.wasm.js","ocr/tesseract-core-lstm.wasm.js","ocr/eng-lang.bin",
  "fonts/barlow-latin-400-normal.woff2","fonts/barlow-latin-500-normal.woff2","fonts/barlow-latin-600-normal.woff2","fonts/barlow-condensed-latin-600-normal.woff2","fonts/barlow-condensed-latin-700-normal.woff2"];
self.addEventListener("install", e => e.waitUntil(caches.open(V).then(async c => {
  await c.addAll(SHELL.map(u => new Request(u, {cache:"reload"})));
  for (const u of BIG) if (!(await c.match(u))) await c.add(u);
}).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  const big = /\/(ocr|lib|fonts)\//.test(u.pathname);
  e.respondWith((async () => {
    const c = await caches.open(V), hit = await c.match(e.request, {ignoreSearch:true});
    if (big && hit) return hit;
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), hit ? 4000 : 30000);
      const r = await fetch(e.request, {cache:"no-cache", signal:ctl.signal}); clearTimeout(t);
      if (r.ok) c.put(e.request, r.clone());
      return r.ok || !hit ? r : hit;
    } catch (x) { if (hit) return hit; throw x; }
  })());
});
