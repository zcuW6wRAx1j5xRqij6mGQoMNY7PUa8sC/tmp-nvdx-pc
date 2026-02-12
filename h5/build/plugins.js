import vue from '@vitejs/plugin-vue'
import removeConsole from 'vite-plugin-remove-console'
import DefineOptions from 'unplugin-vue-define-options/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { viteBuildInfo } from './info'
import { visualizer } from 'rollup-plugin-visualizer'
export function getPluginsList() {
    const lifecycle = process.env.npm_lifecycle_event
    return [
        vue(),
        // 打包信息
        viteBuildInfo(),
        DefineOptions(),
        // 线上环境删除console
        removeConsole(),
        // 自动按需引入element
        AutoImport({
            imports: ['vue'],
        }),
        Components({
            dts: true,
            types: [
                {
                    from: 'vue-router',
                    names: ['RouterLink', 'RouterView'],
                },
            ],
            resolvers: [VantResolver()],
        }),
        
        // 打包分析
        lifecycle === 'report'
            ? visualizer({ open: true, brotliSize: true, filename: 'report.html' })
            : null,
    ]
}
