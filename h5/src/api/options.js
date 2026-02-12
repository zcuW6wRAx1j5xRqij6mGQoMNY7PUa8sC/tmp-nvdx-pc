import { http } from '@/utils/http'

// 期权规则
export const optionsRulesApi = params => {
    return http.request('get', '/api/app/market/options/rules', { params })
}

// 期权列表
export const optionsListApi = params => {
    return http.request('get', '/api/app/market/options', { params })
}

// 期权下单
export const optionsCreateApi = params => {
    return http.request('post', '/api/app/order/options/create', { params })
}

// 期权订单列表
export const optionsOrderListApi = params => {
    return http.request('get', '/api/app/order/options', { params })
}
