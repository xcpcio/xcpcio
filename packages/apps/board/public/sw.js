/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

// Service worker cleanup script for removing PWA functionality
// This SW immediately unregister itself and refreshes all clients

// Skip waiting to activate immediately
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

// Unregister this service worker and reload all pages
self.addEventListener("activate", (e) => {
  console.warn("Unregistering service worker...");
  self.registration.unregister()
    .then(() => {
      // Get all client windows
      return self.clients.matchAll({ includeUncontrolled: true, type: "window" });
    })
    .then((clients) => {
      // Reload each client to complete cleanup
      clients.forEach((client) => {
        if (client.url && "navigate" in client) {
          client.navigate(client.url);
        }
      });
    });
});
