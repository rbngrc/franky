import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import type { IncomingMessage, ServerResponse } from 'http'
import * as http from 'http'
import * as https from 'https'
import { URL } from 'url'

const ALLOWED_HOSTS = new Set([
  'maps.google.com',
  'www.google.com',
  'google.com',
  'nominatim.openstreetmap.org',
])

function isHostAllowed(host: string): boolean {
  const hostname = host.split(':')[0].toLowerCase()
  if (ALLOWED_HOSTS.has(hostname)) return true
  if (hostname.endsWith('.google.com')) return true
  return false
}

function isPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  return (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '::1' ||
    lower === '0.0.0.0' ||
    lower.startsWith('10.') ||
    lower.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(lower) ||
    lower.startsWith('169.254.')
  )
}

function resolveUrlPlugin(): Plugin {
  function follow(url: string): Promise<string> {
    const mod = url.startsWith('https') ? https : http
    return new Promise((resolve, reject) => {
      const req = mod.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000,
      }, (res) => {
        res.resume()
        const code = res.statusCode ?? 500
        if (code >= 300 && code < 400 && res.headers.location) {
          const next = new URL(res.headers.location as string, url).href
          resolve(follow(next))
        } else {
          resolve(url)
        }
      })
      req.on('error', reject)
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
    })
  }

  return {
    name: 'resolve-url-proxy',
    configureServer(server) {
      const httpServer = server.httpServer
      if (!httpServer) return

      const originalListeners = httpServer.listeners('request')
      httpServer.removeAllListeners('request')
      const connectHandler = originalListeners[0] as (req: IncomingMessage, res: ServerResponse) => void

      httpServer.on('request', async (req: IncomingMessage, res: ServerResponse) => {
        if (!req.url?.startsWith('/resolve-url-proxy')) {
          connectHandler(req, res)
          return
        }
        try {
          const parsed = new URL(req.url, `http://${req.headers.host}`)
          const target = parsed.searchParams.get('url')
          if (!target) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Falta el parámetro url' }))
            return
          }
          const targetUrl = new URL(target)
          if (targetUrl.protocol !== 'https:' && targetUrl.protocol !== 'http:') {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Protocolo no permitido' }))
            return
          }
          const hostname = targetUrl.hostname
          if (!isHostAllowed(hostname) || isPrivateHost(hostname)) {
            res.writeHead(403, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Host no permitido' }))
            return
          }
          const resolved = await follow(targetUrl.href)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ resolvedUrl: resolved }))
        } catch (e: unknown) {
          res.writeHead(502, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'Error interno' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'favicon.svg'],
      manifest: {
        name: 'Franky — EUDR Compliance',
        short_name: 'Franky',
        description: 'Gestión forestal y trazabilidad EUDR',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#0D47A1',
        background_color: '#ffffff',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'franky-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('tesseract'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'tesseract-cdn',
              expiration: { maxEntries: 50, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
    resolveUrlPlugin(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts'],
          leaflet: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
