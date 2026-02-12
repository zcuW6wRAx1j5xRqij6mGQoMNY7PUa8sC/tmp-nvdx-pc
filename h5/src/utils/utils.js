import { Browser } from '@capacitor/browser'
import { isNumber, isEmpty } from '@/utils/is'
import Decimal from 'decimal.js'
import numbro from 'numbro'
export const baseUrl = import.meta.env.VITE_IMG_DOMAIN_REAL

// 打开外部链接
export const openLink = async url => {
    if (!url) return
    try {
        await Browser.open({
            url: url,
            presentationStyle: 'pagesheet', // 可选，iOS上的呈现样式
        })
    } catch (error) {
        console.error('Error opening the web page:', error)
    }
}

export const setDataToNumber = (data = {}) => {
    let obj = {}
    Object.keys(data).forEach(key => {
        obj[key] = friendlyNumber(data[key])
    })
    return obj
}

export function setObj(obj, row = {}) {
    obj = JSON.parse(JSON.stringify(obj))
    Object.keys(obj).forEach(key => {
        obj[key] = isEmpty(row[key]) ? undefined : row[key]
    })
    return obj
}

/**
 * 根据币种格式化数字
 * @param {number|string} num - 要格式化的数字
 * @param {string} coinType - 币种类型（如 'BTC', 'ETH' 等）
 * @param {boolean} addSign - 是否为正数添加+号
 * @returns {string} 格式化后的数字字符串
 */
export const formatByCoinType = (num, coinType, addSign = false, isLength = false) => {
    // BTC 或 ETH 保留8位小数
    if (coinType?.toUpperCase() === 'BTC' || coinType?.toUpperCase() === 'ETH') {
        // 输入验证
        if (isEmpty(num)) return ''
        if (isNaN(Number(num))) return num
        const number = Number(num)
        if (number === 0) return '0.00000000'

        // 使用 Decimal.js 进行向下取整到8位小数
        const decimal = new Decimal(number)
        const truncated = decimal.toDecimalPlaces(8, Decimal.ROUND_DOWN)

        // 转换为字符串并格式化
        let result = truncated.toFixed(8)

        // 分离整数部分和小数部分
        const parts = result.split('.')
        const integerPart = parts[0]
        const decimalPart = parts[1] || '00000000'

        // 为整数部分添加千分位分隔符（美式格式：千分位用逗号）
        let formattedInteger = integerPart
        if (integerPart.length > 3) {
            formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        }

        // 组合结果（美式格式：整数部分用逗号分隔，小数部分用点）
        result = `${formattedInteger}.${decimalPart}`

        if (addSign && formatNumber(number) > 0) {
            result = `+${result}`
        }
        return result
    }
    
    // 其他币种使用 friendlyNumber
    return friendlyNumber(num, addSign, isLength)
}

/**
 * 格式化数字为友好的显示格式
 * @param {number|string} num - 要格式化的数字
 * @param {boolean} addSign - 是否为正数添加+号
 * @returns {string} 格式化后的数字字符串
 */
export const friendlyNumber = (num, addSign = false, isLength = false) => {
    // 输入验证
    if (isEmpty(num)) return ''
    if (isNaN(Number(num))) return num

    const number = Number(num)
    if (number === 0) return '0.0000'

    // 使用 Decimal.js 进行向下取整到4位小数
    const decimal = new Decimal(number)
    const length = isLength ? getNumberLength(number) : 4
    const truncated = decimal.toDecimalPlaces(length, Decimal.ROUND_DOWN)

    // 转换为字符串并格式化为美式格式
    let result = truncated.toFixed(length)

    // 分离整数部分和小数部分
    const parts = result.split('.')
    const integerPart = parts[0]
    const decimalPart = parts[1] || '0000'

    // 为整数部分添加千分位分隔符（美式格式：千分位用逗号）
    let formattedInteger = integerPart
    if (integerPart.length > 3) {
        formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    // 组合结果（美式格式：整数部分用逗号分隔，小数部分用点）
    result = `${formattedInteger}.${decimalPart}`

    if (addSign && formatNumber(number) > 0) {
        result = `+${result}`
    }
    return result
}
/**
 * 预处理数字字符串，将欧洲格式转换为标准格式
 * @param {string|number} value - 要处理的数值
 * @returns {number} - 标准格式的数值
 */
const preprocessNumber = value => {
    if (isEmpty(value)) return 0

    const str = String(value).trim()
    let processedStr = str

    // 如果包含逗号且不包含点，说明是欧洲格式（如：1.234,56）
    if (str.includes(',') && !str.includes('.')) {
        // 欧洲格式：千分位用点，小数点用逗号
        processedStr = str.replace(/\./g, '').replace(',', '.')
    }

    // 如果同时包含逗号和点，需要判断格式
    else if (str.includes(',') && str.includes('.')) {
        const lastCommaIndex = str.lastIndexOf(',')
        const lastDotIndex = str.lastIndexOf('.')

        // 如果最后一个逗号在最后一个点之后，说明逗号是小数点
        if (lastCommaIndex > lastDotIndex) {
            // 欧洲格式：1.234,56 -> 1234.56
            processedStr = str.replace(/\./g, '').replace(',', '.')
        } else {
            // 美式格式：1,234.56 -> 1234.56
            processedStr = str.replace(/,/g, '')
        }
    }

    // 如果只包含点，移除千分位分隔符
    else if (str.includes('.')) {
        processedStr = str.replace(/,/g, '')
    }
    // 转换为数字并返回
    const num = Number(processedStr)
    return isNaN(num) ? 0 : num
}

/**
 * 相加
 * @param {number|string} a - 第一个加数
 * @param {number|string} b - 第二个加数
 * @returns {string} - 相加结果
 */
export const add = (a, b) => {
    if (isEmpty(a) || isEmpty(b)) {
        return '0.0000'
    }

    const processedA = preprocessNumber(a)
    const processedB = preprocessNumber(b)

    return friendlyNumber(new Decimal(processedA).plus(processedB))
}

/**
 * 相减
 * @param {number|string} a - 被减数
 * @param {number|string} b - 减数
 * @returns {string} - 相减结果
 */
export const subtract = (a, b) => {
    if (isEmpty(a) || isEmpty(b)) {
        return '0.0000'
    }

    const processedA = preprocessNumber(a)
    const processedB = preprocessNumber(b)

    return friendlyNumber(new Decimal(processedA).minus(processedB))
}

/**
 * 相乘
 * @param {number|string} a - 第一个乘数
 * @param {number|string} b - 第二个乘数
 * @returns {string} - 相乘结果
 */
export const multiply = (a, b, coinType) => {
    if (isEmpty(a) || isEmpty(b)) {
        return '0.0000'
    }

    const processedA = preprocessNumber(a)
    const processedB = preprocessNumber(b)

    return formatByCoinType(new Decimal(processedA).times(processedB), coinType)
}

/**
 * 相除
 * @param {number|string} a - 被除数
 * @param {number|string} b - 除数
 * @returns {string} - 相除结果
 */
export const divide = (a, b, coinType) => {
    if (isEmpty(a) || isEmpty(b) || b === 0) {
        return '0.0000'
    }

    const processedA = preprocessNumber(a)
    const processedB = preprocessNumber(b)

    return formatByCoinType(new Decimal(processedA).dividedBy(processedB), coinType)
}

export function setBaseUrl(url) {
    // 如果是绝对路径则拼接 否则直接返回
    if (url.startsWith('http')) {
        return url
    } else {
        // 如果url第一个是/则不需要加不是的话则加上/
        if (url.startsWith('/')) {
            return `${baseUrl}${url}`
        } else {
            return `${baseUrl}/${url}`
        }
    }
}
// 如果传入欧洲格式 帮我变成正常数字，如果是正常数字则返回，如果是字符串则先判断是否是欧洲格式，如果是欧洲格式则变成正常数字，如果是正常数字则返回
export const formatNumber = num => {
    if (typeof num === 'string') {
        return preprocessNumber(num)
    }
    return num
}

// 百分率 传入2个函数 得到2位小数,第二个参数是是否需要乘以100
export const percentage = (a, need = true) => {
    if (isEmpty(a)) {
        return '0.00'
    }
    const processedA = preprocessNumber(a)
    let data = new Decimal(processedA).times(need ? 100 : 1).toFixed(2)
    return data
}

// 传入的值如果有.则去掉
export const removeDot = num => {
    if (isEmpty(num)) return 0
    if (typeof num === 'string') {
        return num.replace('.', '')
    }
    return num
}

export const numberToArray = num => {
    if (!isNumber(num)) return []
    return num.toString().split('').map(Number)
}

const getNumberLength = num => {
    const lengthFore = 4
    const lengthEight = 8
    if (num.toFixed(0) > 0) return lengthFore
    num = getDecimalPart(num)
    const arr = numberToArray(num)
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > 0) {
            return i < lengthFore ? lengthFore : lengthEight
        }
    }
}

export const getDecimalPart = (num) => {
  if (!isNumber(num)) return '';
  const str = num.toString();
  const decimalIndex = str.indexOf('.');
  return decimalIndex === -1 ? '' : str.slice(decimalIndex + 1);
};

/**
 * 若字符串包含 usdc 则替换为 usd（不区分大小写）
 * @param {string} str - 要处理的字符串
 * @returns {string} 替换后的字符串
 */
export const usdcToUsd = str => {
    if (str == null || typeof str !== 'string') return str === undefined ? '' : String(str)
    return str.replace(/usdc/gi, match => (match === 'USDC' ? 'USD' : match === 'Usdc' ? 'Usd' : 'usd'))
};
