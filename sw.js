const CACHE_NAME = 'llm-translator-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './favicon.ico',
    './icon-192.png',
    './icon-512.png',
    // 缓存外部CDN资源，保证离线时样式不乱
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// 激活 Service Worker，清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
    // API 请求不缓存，直接走网络
    if (event.request.url.includes('api.openai.com') || event.request.method === 'POST') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 如果缓存中有，直接返回缓存
                if (response) {
                    return response;
                }
                // 否则发起网络请求
                return fetch(event.request);
            })
    );
});