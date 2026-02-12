import { http } from '@/utils/http'

// 获取我的信息
export const getMyInfoApi = () => {
    return http.request('get', '/api/app/account/profile')
}

// 修改个人信息
export const modifyMyInfoApi = data => {
    return http.request('post', '/api/app/account/setting/profile', { data })
}

// 获取钱包统计
export const getWalletApi = () => {
    return http.request('get', '/api/app/wallet/summary')
}

// 期权钱包
export const getOptionsWalletApi = () => {
    return http.request('get', '/api/app/wallet/options')
}

// 现货钱包
export const getSpotWalletApi = (is_otc = 0) => {
    return http.request('get', '/api/app/wallet/spot', { params: { is_otc } })
}

// 现货钱包流水
export const getSpotWalletLogApi = params => {
    return http.request('get', '/api/app/wallet/spot/flow', { params })
}

// 合约钱包
export const getContractWalletApi = () => {
    return http.request('get', '/api/app/wallet/futures')
}

// 合约钱包流水
export const getContractWalletLogApi = params => {
    return http.request('get', '/api/app/wallet/futures/flow', { params })
}

// 充值
export const rechargeApi = data => {
    return http.request('post', '/api/app/wallet/deposit', { data })
}
// 获取支持充值的货币列表
export const getRechargeCoinListApi = () => {
    return http.request('get', '/api/app/wallet/deposit/coins')
}

// 申请入金地址
export const requestWalletAddress = data => {
    return http.request('post', '/api/app/wallet/deposit/address', { data })
}

// 提现
export const withdrawalApi = data => {
    return http.request('post', '/api/app/wallet/withdraw', { data })
}

// 提现历史记录
export const withdrawalLogApi = params => {
    return http.request('get', '/api/app/wallet/withdraw/history', { params })
}

// 修改登录密码
export const modifyLoginPwdApi = data => {
    return http.request('post', '/api/app/account/setting/password', { data })
}

// 修改支付密码
export const modifyPayPwdApi = data => {
    return http.request('post', '/api/app/account/setting/trade_password', { data })
}

// 修改邮箱
export const modifyEmailApi = data => {
    return http.request('post', '/api/app/account/setting/email', { data })
}

// 站内信
export const getMsgListApi = params => {
    return http.request('get', '/api/app/account/inbox', { params })
}

// 站内信详情
export const getMsgDetailApi = params => {
    return http.request('get', '/api/app/account/inbox/detail', { params })
}

// 提交实名认证
export const submitRealNameApi = data => {
    return http.request('post', '/api/app/account/setting/identity', { data })
}

// 获取实名认证信息
export const getRealNameInfoApi = () => {
    return http.request('get', '/api/app/account/setting/identity/status')
}

// 资金划转
export const transferApi = data => {
    return http.request('post', '/api/app/wallet/transfer', { data })
}

// 充值历史
export const rechargeHistoryApi = params => {
    return http.request('get', '/api/app/wallet/deposit/history', { params })
}

// 签到
export const signInApi = () => {
    return http.request('post', '/api/app/account/punch')
}

// 修改手机号
export const modifyPhoneApi = data => {
    return http.request('post', '/api/app/account/setting/phone', { data })
}

// 划转的余额
export const getTransferBalanceApi = () => {
    return http.request('get', '/api/app/wallet/transfer/avaiable')
}

// 红利计划领取
export const getDividendApi = () => {
    return http.request('post', '/api/app/active/dividend')
}

// 是否领取过
export const getDividendStatusApi = () => {
    return http.request('get', '/api/app/active/dividend/history')
}
// 获取币种选择器数据
export const getCoinSelectorApi = () => {
    return http.request('get', '/api/app/wallet/spot/selector')
}

// 即时兑换
export const instantExchangeApi = data => {
    return http.request('post', '/api/app/order/spot/instant/exchange', { data })
}

// 获取闪兑历史记录
export const getExchangeHistoryApi = params => {
    return http.request('get', '/api/app/order/spot/instant/exchange', { params })
}


// 获取即时兑换手续费
export const getInstantExchangeFeeApi = () => {
    return http.request('get', '/api/app/config', { params: { field: 'instant_exchange_fee' } })
}

// 划转记录
export const transferHistoryApi = params => {
    return http.request('get', '/api/app/wallet/transfer/order', { params })
}
