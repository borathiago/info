import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
    base: './',
    resolve: {},
    root: './info',
    server: {
        port: 5180,
        host: true
    },
    build: {
        cssCodeSplit: false,
        outDir: '../@production',
        assetsDir: 'css',
        rollupOptions: {
            output: {
                entryFileNames: 'js/[name]-electrolux-app.js',
                chunkFileNames: 'js/[name]-electrolux.js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'css/electrolux-app[extname]'
                    }
                    return 'css/fonts/[name][extname]'
                },
            },
        },
    },
    plugins: [
        legacy({
            targets: ['defaults', 'not IE 11'],
            additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        }),
        viteStaticCopy({
            targets: [
                {
                    src: 'img',
                    dest: '.',
                },
                {
                    src: 'modules',
                    dest: '.',
                },
            ],
        }),
    ],
})
