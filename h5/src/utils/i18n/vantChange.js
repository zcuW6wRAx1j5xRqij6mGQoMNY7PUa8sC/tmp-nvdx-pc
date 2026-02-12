import { Locale } from 'vant'
import enUS from 'vant/es/locale/lang/en-US'
import zhCN from 'vant/es/locale/lang/zh-CN'
import zhTW from 'vant/es/locale/lang/zh-TW'
import esES from 'vant/es/locale/lang/es-ES'
import frFR from 'vant/es/locale/lang/fr-FR'
import itIT from 'vant/es/locale/lang/it-IT'
import deDE from 'vant/es/locale/lang/de-DE'
const vantLocales = {
    'de': deDE, // 德语
    'en': enUS,
    'zh_CN': zhCN,
    'zh_TW': zhTW,
    'es': esES, // 西班牙
    'fr': frFR, // 法语
    'it': itIT, // 意大利
}

export default function vantChange() {
    // 尝试从 localStorage 获取语言设置
    let locale = localStorage.getItem('lang')
    // 如果 localStorage 中没有语言设置，那就使用默认的语言
    if (!locale) {
        locale = 'en'
    }

    document.documentElement.lang = locale
    Locale.use(locale, vantLocales[locale])
}
