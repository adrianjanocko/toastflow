import { fileURLToPath, URL } from 'node:url'
import { createReadStream, existsSync, readFileSync, statSync, cpSync, readdirSync } from 'node:fs'
import { resolve, extname } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

const sharedAssetsDir = resolve(__dirname, '../../../assets')

function sharedAssetsPlugin(): Plugin {
  return {
    name: 'shared-assets',
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          const url = (req.url ?? '').split('?')[0]
          const filePath = resolve(sharedAssetsDir, url.slice(1))

          if (
            filePath.startsWith(sharedAssetsDir) &&
            existsSync(filePath) &&
            statSync(filePath).isFile()
          ) {
            const mimeTypes: Record<string, string> = {
              '.png': 'image/png',
              '.svg': 'image/svg+xml',
              '.ico': 'image/x-icon',
              '.json': 'application/json',
              '.xml': 'application/xml',
              '.webmanifest': 'application/manifest+json',
            }
            res.setHeader(
              'Content-Type',
              mimeTypes[extname(filePath)] ?? 'application/octet-stream',
            )
            createReadStream(filePath).pipe(res)
            return
          }

          next()
        })
      }
    },
    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      if (!existsSync(sharedAssetsDir)) return
      for (const file of readdirSync(sharedAssetsDir)) {
        if (file === 'banner.png') continue
        const src = resolve(sharedAssetsDir, file)
        if (statSync(src).isFile()) {
          cpSync(src, resolve(outDir, file))
        }
      }
    },
  }
}

function readLibraryVersion(): string {
  try {
    const pkgPath = resolve(__dirname, '../../vue/package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    return pkg.version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), sharedAssetsPlugin()],
  define: {
    __LIB_VERSION__: JSON.stringify(readLibraryVersion()),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
