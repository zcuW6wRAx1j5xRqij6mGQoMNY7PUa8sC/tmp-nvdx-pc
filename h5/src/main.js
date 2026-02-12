//新的
import { getTheme, setTheme } from '@/utils/theme'
//新的
import { createApp } from 'vue'
import router from './router'
// 引入重置样式
import './style/reset.scss'
// 导入公共样式
import './style/index.scss'
import './style/Tailwind.css'
import './style/cover.scss'
import './style/font-scale-fix.scss'
import './assets/font/font.css'
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import App from './App.vue'
import i18n from './utils/i18n/i18n'
import { setupStore } from '@/store'
let app = createApp(App)
setupStore(app)
setTheme(getTheme())
app.use(router).use(i18n).mount('#app')
// rem等比适配配置文件
// 基准大小
const baseSize = 16
// 设置 rem 函数
function setRem() {
    // 当前页面宽度相对于 1920宽的缩放比例，可根据自己需要修改。
    const scale = document.documentElement.clientWidth / 375

    // 设置页面根节点字体大小（“Math.min(scale, 2)” 指最高放大比例为2，可根据实际业务需求调整）
    document.documentElement.style.fontSize = baseSize * Math.min(scale) + 'px'
    //   document.documentElement.style.fontSize = scale + 'px'
}
// 初始化
if (process.env.NODE_ENV !== 'testBuild') {
    setRem()
}
console.log('process.env.NODE_ENV', process.env.NODE_ENV)
// 改变窗口大小时重新设置 rem
window.onresize = function () {
    setTimeout(() => {
        if (process.env.NODE_ENV !== 'testBuild') {
            setRem()
        }
    }, 300)
}

// 声明JivoChat全局函数
window.jivoWidgetLoaded = false;
window.jivo_onLoadCallback = function () {
    window.jivoWidgetLoaded = true;
}