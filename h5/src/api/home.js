import { http } from '@/utils/http'

// 通知列表
export const noticeListApi = params => {
    return http.request('get', '/api/app/notices', { params })
}
// 通知详情
export const noticeDetailApi = params => {
    return http.request('get', '/api/app/notice/detail', { params })
}

// banner列表
export const bannerListApi = params => {
    return http.request('get', '/api/app/banners', { params })
}

// 首页推荐数据
export const recommendListApi = params => {
    return http.request('get', '/api/app/market/recommend', { params })
}

// 获取新闻资讯
export const getNewsApi = params => {
    return http.request('get', '/api/app/news', { params })
}
// 获取新闻详情
export const getNewsDetailApi = params => {
    return http.request('get', '/api/app/news/detail', { params })
}

// 关于我们
export const aboutUsApi = () => {
    return http.request('get', '/api/app/protocol/aboutme')
}

// 用户协议
export const userAgreementApi = () => {
    return http.request('get', '/api/app/protocol/terms')
}

// 隐私协议
export const privacyPolicyApi = () => {
    return http.request('get', '/api/app/protocol/privacy')
}

// 点击支持
export const supportApi = params => {
    return http.request('post', '/api/app/active/support', { params })
}

// 弹窗公告列表
export const announcementListApi = params => {
    return http.request('get', '/api/app/announcement', { params })
}


// 已读反馈 (让用户点击个按钮)
export const readAnnouncementApi = data => {
    return http.request('post', '/api/app/announcement/read', { data })
}
