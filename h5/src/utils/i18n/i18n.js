import { createI18n } from 'vue-i18n'
import vantChange from './vantChange.js'
// 引入语言包
import zh from './zh.js'
import en from './en.js'
import zhTw from './zh-tw.js'
import es from './es.js'
import fr from './fr.js'
import it from './it.js'
import de from './de.js'
// 尝试从 localStorage 获取语言设置
let locale = localStorage.getItem('lang')
// 如果 localStorage 中没有语言设置，那就使用默认的语言
if (!locale) {
    locale = 'en'
}
const messages = {
    'de': de, // 德语
    'en': en,
    'zh_CN': zh,
    'zh_TW': zhTw,
    'es': es, // 西班牙
    'fr': fr, // 法语
    'it': it, // 意大利
}

const i18n = createI18n({
    locale: locale, // 设置默认语言
    allowComposition: true,
    messages,
    fallbackLocale: 'en',
})
vantChange()
export default i18n
