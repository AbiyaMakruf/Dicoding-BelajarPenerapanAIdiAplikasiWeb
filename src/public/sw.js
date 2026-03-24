importScripts("https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js");

if (workbox) {
  self.skipWaiting();
  workbox.core.clientsClaim();

  workbox.precaching.precacheAndRoute([
    { url: "/", revision: "1.0.0" },
    { url: "/index.html", revision: "1.0.0" },
    { url: "/app.bundle.js", revision: "1.0.0" },
    { url: "/app.css", revision: "1.0.0" },
    { url: "/manifest.json", revision: "1.0.0" },
    { url: "/favicon.ico", revision: "1.0.0" },
    { url: "/icons/apple-touch-icon.png", revision: "1.0.0" },
    { url: "/icons/icon-192x192.png", revision: "1.0.0" },
    { url: "/icons/icon-512x512.png", revision: "1.0.0" },
    { url: "/model/model.json", revision: "1.0.0" },
    { url: "/model/metadata.json", revision: "1.0.0" },
    { url: "/model/weights.bin", revision: "1.0.0" }
  ]);

  workbox.routing.registerRoute(
    ({ url }) => url.origin === "https://fonts.googleapis.com",
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "google-fonts-stylesheets",
    }),
  );

  workbox.routing.registerRoute(
    ({ url }) => url.origin === "https://fonts.gstatic.com",
    new workbox.strategies.CacheFirst({
      cacheName: "google-fonts-webfonts",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        }),
      ],
    }),
  );

  workbox.routing.registerRoute(
    ({ url }) => url.origin === "https://unpkg.com",
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "cdn-assets-cache",
    }),
  );
} else {
  console.log("Workbox gagal dimuat");
}
