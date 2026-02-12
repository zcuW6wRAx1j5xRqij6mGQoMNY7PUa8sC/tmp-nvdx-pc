import { http } from '@/utils/http'

// 获取验证码-未登录
export const getCodeApi = data => {
    return http.request('post', '/api/app/captcha', { data })
}

// 获取验证码-已登录
export const getCodeLoginApi = data => {
    return http.request('post', '/api/app/account/captcha', { data })
}

// 国际区号
export const getAreaCodeApi = () => {
    return http.request('get', '/api/app/account/area_code')
}

// 获取上传地址
export const getUploadApi = data => {
    return http.request('post', '/api/app/images/upload', { data })
}

// 获取访问地址
export const getAccessApi = () => {
    return http.request('get', '/api/app/images/url')
}

// 上传
export const uploadApi = (url, data) => {
    return http.request('put', url, { data })
}

// 支持的货币列表
export const getCurrencyApi = () => {
    return http.request('get', '/api/app/market/coins')
}

// 国家列表
export const getCountryApi = () => {
    return http.request('get', '/api/app/country')
}

// 平台支持的杠杆列表
export const getLeverApi = () => {
    return http.request('get', '/api/app/leverages')
}

// 支持提现的货币列表
export const getWithdrawApi = () => {
    return http.request('get', '/api/app/wallet/withdraw/coins')
}

// 获取更新信息
export const queryUpdate = data => {
    return http.request('post', '/api/app/update', { data })
}

export const openApp = data => {
    return http.request('post', '/api/openApp', { data })
}
export const version = data => {
    return http.request('post', '/api/common/version', { data })
}
