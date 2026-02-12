import { getMyInfoApi } from '@/api/my'
import { closeToast, showLoadingToast } from 'vant'
export function useUserInfo() {
    const userInfo = ref([])
    function initUserData() {
        showLoadingToast({
            forbidClick: true,
            loadingType: 'spinner',
            duration: 0,
        })
        getMyInfoApi()
            .then(data => {
                userInfo.value = data || {}
                localStorage.setItem('is_verified_identity', data.is_verified_identity)
            })
            .finally(() => {
                closeToast()
            })
    }
    initUserData()
    return { userInfo, initUserData }
}
