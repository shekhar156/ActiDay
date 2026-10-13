const STATIC_CACHE = 'actiday-static-v4';
const RUNTIME_CACHE = 'actiday-runtime-v4';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon.svg'
];

// 1. Install Event - Pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event - Clear old caches and take control
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!currentCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event - Stale-while-revalidate for local assets, cache-first for fonts, offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Runtime cache for Google Fonts (stylesheets and woff2 font files)
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);
        });
      })
    );
    return;
  }

  // Core application assets: Stale-While-Revalidate
  event.respondWith(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          // If offline and request is navigation, serve index.html
          if (event.request.mode === 'navigate') {
            return cache.match('./index.html');
          }
          return null;
        });

        // Return cached immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// 4. Push Event - Display notifications for routine, focus timer, or streaks
self.addEventListener('push', (event) => {
  let data = {
    title: 'ActiDay Reminder',
    body: 'Time to check in on your habits and daily routine!',
    tag: 'actiday-alert'
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './icons/icon.svg',
    badge: './icons/icon.svg',
    tag: data.tag || 'actiday-notification',
    vibrate: [150, 80, 150],
    data: {
      dateOfArrival: Date.now(),
      url: self.registration.scope
    },
    actions: [
      { action: 'open', title: 'Open ActiDay' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. Notification Click Event - Focus or open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(self.registration.scope || './');
      }
    })
  );
});

// 6. Background Sync Event - Synchronize routine data when connectivity returns
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-actiday-data') {
    event.waitUntil(
      clients.matchAll({ includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: 'SYNC_COMPLETED',
            timestamp: Date.now(),
            message: 'Background synchronization complete'
          });
        });
      })
    );
  }
});

// 7. Message Handler - Support programmatic notifications & background timer alerts
const activeBackgroundTimers = new Map();

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data;
    self.registration.showNotification(title || 'ActiDay Alert', {
      body: body || 'Daily reminder notification',
      icon: './icons/icon.svg',
      badge: './icons/icon.svg',
      tag: tag || 'actiday-inapp-alert',
      vibrate: [150, 75, 150]
    });
  } else if (event.data && event.data.type === 'SCHEDULE_TIMER_ALERT') {
    const { id, delayMs, title, body } = event.data;
    if (activeBackgroundTimers.has(id)) {
      clearTimeout(activeBackgroundTimers.get(id));
    }
    const timerId = setTimeout(() => {
      self.registration.showNotification(title || 'ActiDay Focus Timer', {
        body: body || 'Focus session complete! Time to take a mindful break.',
        icon: './icons/icon.svg',
        badge: './icons/icon.svg',
        tag: id || 'actiday-timer-finish',
        vibrate: [250, 100, 250, 100, 400],
        requireInteraction: true
      });
      activeBackgroundTimers.delete(id);
    }, Math.max(100, delayMs));
    activeBackgroundTimers.set(id, timerId);
  } else if (event.data && event.data.type === 'CANCEL_TIMER_ALERT') {
    const { id } = event.data;
    if (activeBackgroundTimers.has(id)) {
      clearTimeout(activeBackgroundTimers.get(id));
      activeBackgroundTimers.delete(id);
    }
  } else if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
