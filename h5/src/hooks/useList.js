import { isEmpty } from '../utils/is'
import { showLoadingToast, closeToast } from 'vant'

export default function useList(api, initParams = {}, fn) {
    const showList = ref([])
    const loading = ref(false)
    const finished = ref(false)
    const searchInfo = reactive({
        page: 0,
        page_size: initParams.page_size || 30,
    })
    const onLoad = (params = {}) => {
        if (isEmpty(api)) {
            return
        }
        searchInfo.page++
        loading.value = true
        let action = api
        if (params.api) {
            action = params.api
            Reflect.deleteProperty(params, 'api')
        }
        if (!initParams.noLoading && !params.hideLoading) {
            showLoadingToast({
                forbidClick: true,
                loadingType: 'spinner',
                duration: 0,
            })
        }
        action({ ...initParams, ...searchInfo, ...params })
            .then(data => {
                if (searchInfo.page === 1) {
                    showList.value = []
                }
                const list = data.items || data.data || data.items || data || []
                if (params.hasPage) {
                    showList.value = showList.value.concat(list)
                    if (data.total <= showList.value.length) {
                        finished.value = true
                    }
                    return
                }
                
                if (params.isNoPage || initParams.isNoPage) {
                    showList.value =  data.items || data || []
                    loading.value = false
                    finished.value = true
                    console.log(data.items)
                    closeToast()
                    return
                }
                showList.value = showList.value.concat(list)
                if (data.total <= showList.value.length) {
                    finished.value = true
                }
                fn && fn(showList.value)
            })
            .catch(e => {
                finished.value = true
            })
            .finally(() => {
                loading.value = false
                setTimeout(() => {
                    closeToast()
                }, 1000)
            })
    }
    const initData = params => {
        searchInfo.page = 0
        showList.value = []
        finished.value = false
        onLoad(params)
    }
    return {
        showList,
        loading,
        finished,
        searchInfo,
        onLoad,
        initData,
    }
}
