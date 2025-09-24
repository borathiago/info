import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
    base: './',
    resolve: {},
    root: './info',
    server: {
        port: 5180,
        host: true,
    },
    build: {
        cssCodeSplit: false,
        outDir: '../@production',
        assetsDir: 'css',
        rollupOptions: {
            output: {
                entryFileNames: 'js/electrolux-app.js',
                chunkFileNames: 'js/electrolux-app.js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'css/electrolux-app.css'
                    }
                    return 'css/fonts/[name][extname]'
                }
            },
        },
        modulePreload: false, /* Desabilitar modulepreload */ /* O modulepreload poderia causar problemas em contexto de ShadowDOM */
        minify: 'terser',
        target: 'es2020' /* Remover suporte para navegadores antigos */,
        sourcemap: false,
    },
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: 'img',
                    dest: '.',
                },
            ],
        }),
    ],
})
