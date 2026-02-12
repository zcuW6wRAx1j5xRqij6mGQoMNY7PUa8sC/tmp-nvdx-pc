import { defineStore } from 'pinia'
import { storageLocal } from '@utils/storage'
import router from '/@/router'
export const useUserStore = defineStore({
    id: 'pure-user',
    state: () => ({
        userInfo: null,
        curCurrency: '', // 当前货币类型
        imgBase: ''
    }),
    actions: {
        // 获取旧版saas信息
        setUserInfo(userInfo: any) {
            storageLocal.setItem('userInfo', userInfo)
            this.userInfo = userInfo
        },
        // 登出
        logOut() {
            storageLocal.removeItem('token')
            router.replace('/login')
        },
        // 设置图片基础地址
        setImgBase(url) {
            this.imgBase = url
        }
    },
    getters: {
        userInfoData(state) {
            return state.userInfo ? state.userInfo : storageLocal.getItem('userInfo') || {}
        },
        imgBaseUrl() {
            this.setImgBase(localStorage.getItem('imgBaseUrl'))
            return this.imgBase
        }
    },
})

export function useUserStoreHook() {
    return useUserStore()
}
