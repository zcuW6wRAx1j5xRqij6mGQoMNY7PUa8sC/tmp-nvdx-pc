import { loadEnv } from 'vite'
import { resolve } from 'path'
import { warpperEnv, regExps } from './build'
import { getPluginsList } from './build/plugins'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import pxToViewport from 'postcss-px-to-viewport-8-plugin'
// 当前执行node命令时文件夹的地址（工作目录）
const root = process.cwd()

// 路径查找
const pathResolve = dir => {
    return resolve(__dirname, '.', dir)
}

// 设置别名
const alias = {
    '/@': pathResolve('src'),
    '@': pathResolve('src'),
    '@build': pathResolve('build'),
    '@components': pathResolve('src/components'),
    '@utils': pathResolve('src/utils'),
    '@api': pathResolve('src/api'),
}

export default ({ mode }) => {
    const { VITE_PORT, VITE_PUBLIC_PATH, VITE_PROXY_DOMAIN, VITE_PROXY_DOMAIN_REAL } = warpperEnv(
        loadEnv(mode, root),
    )
    return {
        base: VITE_PUBLIC_PATH,
        root,
        resolve: {
            alias,
        },
        css: {
            postcss: {
                plugins: [
                    autoprefixer,
                    tailwindcss,
                    mode !== 'testBuild' ?
                        pxToViewport({
                            unitToConvert: 'px', // 需要转换的单位，默认为"px"
                            viewportWidth: 375, // 设计稿的视口宽度
                            unitPrecision: 5, // 单位转换后保留的精度
                            viewportUnit: 'vw', // 希望使用的视口单位
                            fontViewportUnit: 'vw', // 字体使用的视口单位
                            // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
                            minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
                            mediaQuery: false, // 媒体查询里的单位是否需要转换单位
                            replace: true, //  是否直接更换属性值，而不添加备用属性
                            landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
                            landscapeUnit: 'vw', // 横屏时使用的单位
                            landscapeWidth: 1338, // 横屏时使用的视口宽度
                        }): () =>{},
                ],
            },
            scss: {
                api: 'modern-compiler', // or "modern", "legacy"
            },
        },
        // 服务端渲染
        server: {
            // 是否开启 https
            https: false,
            // 端口号
            port: VITE_PORT,
            host: '0.0.0.0',
            // 本地跨域代理
            proxy:
                VITE_PROXY_DOMAIN_REAL.length > 0
                    ? {
                          [VITE_PROXY_DOMAIN]: {
                              target: VITE_PROXY_DOMAIN_REAL,
                              // ws: true,
                              changeOrigin: true,
                              rewrite: path => regExps(path, VITE_PROXY_DOMAIN),
                          },
                      }
                    : null,
        },
        plugins: getPluginsList(),
    }
}
