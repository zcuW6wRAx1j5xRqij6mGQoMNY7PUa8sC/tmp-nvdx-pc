import { http } from '@/utils/http'

// 现货交易列表
export const getSpotListApi = params => {
    return http.request('get', '/api/app/market/spot', { params })
}

// 合约交易
export const getContractListApi = params => {
    return http.request('get', '/api/app/market/futures', { params })
}

// 现货订单
export const getSpotOrderApi = params => {
    return http.request('get', '/api/app/order/spot', { params })
}

// 合约订单
export const getContractOrderApi = params => {
    return http.request('get', '/api/app/order/futures', { params })
}

// k线历史数据
export const getKlineApi = params => {
    return http.request('get', '/api/app/market/symbol/kline', { params })
}

// 新增现货订单
export const addSpotOrderApi = data => {
    return http.request('post', '/api/app/order/spot', { data })
}

// 取消现货订单
export const cancelSpotOrderApi = data => {
    return http.request('post', '/api/app/order/spot/cancel', { data })
}

// 新增合约订单
export const addContractOrderApi = data => {
    return http.request('post', '/api/app/order/futures', { data })
}

// 平仓合约订单
export const closeContractOrderApi = data => {
    return http.request('post', '/api/app/order/futures/close', { data })
}

// 合约订单取消
export const cancelContractOrderApi = data => {
    return http.request('post', '/api/app/order/futures/cancel', { data })
}

// 收藏
export const addCollectApi = data => {
    return http.request('post', '/api/app/market/collection', { data })
}

// 收藏列表
export const getCollectListApi = params => {
    return http.request('get', '/api/app/market/collections', { params })
}

// 获取交易对详情
export const getSymbolDetailApi = params => {
    return http.request('get', '/api/app/market/symbol', { params })
}

//保证金的增加和减少
export const updateMarginApi = data => {
    return http.request('post', '/api/app/order/futures/modify/position', { data })
}

// 修改止盈止损
export const updateStopProfitApi = data => {
    return http.request('post', '/api/app/order/futures/modify/sltp', { data })
}

// IEO列表
export const getIEOListApi = params => {
    return http.request('get', '/api/app/ieo', { params })
}

// 我的IEO订单
export const getMyIEOOrderApi = params => {
    return http.request('get', '/api/app/ieo/orders', { params })
}

// 购买IEO
export const buyIEOApi = data => {
    return http.request('post', '/api/app/ieo/order/buy', { data })
}

// 获取图表数据
export const getChartDataApi = data => {
    return http.request('post', '/api/app/market/symbol/line', { data })
}

// 导师列表
export const getTeacherListApi = params => {
    return http.request('get', '/api/app/active/mentos', { params })
}

// 导师投票
export const voteTeacherApi = data => {
    return http.request('post', '/api/app/active/mento', { data })
}

// 理财-产品列表
export const financialProductListApi = params => {
    return http.request('get', '/api/app/financial/products', { params })
}

// 理财-购买
export const financialProductBuyApi = params => {
    return http.request('post', '/api/app/financial/order/buy', { params })
}

// 理财-赎回
export const financialProductRedeemApi = params => {
    return http.request('post', '/api/app/financial/order/redeem', { params })
}

// 理财-订单列表
export const financialProductOrderListApi = params => {
    return http.request('get', '/api/app/financial/orders', { params })
}

// 理财-详情
export const financialProductDetailApi = params => {
    return http.request('get', '/api/app/financial/product/detail', { params })
}

// otc列表
export const getOTCListApi = params => {
    return http.request('get', '/api/app/otc/products', { params })
}

// otc订单
export const getOTCOrderApi = params => {
    return http.request('get', '/api/app/otc/orders', { params })
}

// otc买卖
export const otcTradeApi = data => {
    return http.request('post', '/api/app/otc/trade', { data })
}