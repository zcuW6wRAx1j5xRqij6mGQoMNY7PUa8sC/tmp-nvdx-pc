import Axios from 'axios'
import qs from 'qs'
import { loadEnv } from '@build/index'
import { showToast } from 'vant'
import router from '@/router'
const { VITE_PROXY_DOMAIN, VITE_PROXY_DOMAIN_REAL } = loadEnv()

const defaultConfig = {
    baseURL: VITE_PROXY_DOMAIN_REAL,
    timeout: 60000,

    paramsSerializer: params => qs.stringify(params, { indices: false }),
}
class PureHttp {
    constructor() {
        this.pendingRequests = new Map() // 用于存储待处理的请求
        this.requestCache = new Map() // 用于存储请求缓存

        this.httpInterceptorsRequest()
        this.httpInterceptorsResponse()
    }

    static initConfig = {}

    static axiosInstance = Axios.create(defaultConfig)

    httpInterceptorsRequest() {
        PureHttp.axiosInstance.interceptors.request.use(
            config => {
                const lang = localStorage.getItem('lang') || 'en'
                config.headers['Accept-Language'] = lang
                const token = localStorage.getItem('token')
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`
                    return config
                } else {
                    return config
                }
            },
            error => {
                return Promise.reject(error)
            },
        )
    }

    httpInterceptorsResponse() {
        const instance = PureHttp.axiosInstance
        instance.interceptors.response.use(
            response => {
                if (response.headers['content-type'].includes('application/vnd.ms-excel')) {
                    return Promise.resolve(response)
                } else if (response.headers['content-type'] === 'image/jpeg') {
                    const url = window.URL.createObjectURL(response.data)
                    return Promise.resolve(url)
                } else {
                    const responseCode = response.status
                    if (responseCode === 200 && response.data.code === 0) {
                        return Promise.resolve(response.data.data)
                    } else if (responseCode === 200 && response.data.code === 422) {
                        return Promise.reject(response.data.errors)
                    } else {
                        if ([401, 411].includes(response.data.code)) {
                            localStorage.removeItem('token')
                            router.push('/Login')
                            return
                        }
                        if (response.data.message) {
                            showToast({
                                type: 'fail',
                                message: response.data.message,
                            })
                        }
                        return Promise.reject(response.data)
                    }
                }
            },
            error => {
                if (error.code === 'ERR_CANCELED"') {
                    return
                }
                if (error.response?.data?.code === 422) {
                    return Promise.reject(error.response.data.data.errors)
                }
                if ([401, 411].includes(error.response?.data?.code)) {
                    localStorage.removeItem('token')
                    router.push('/Login')
                    return
                }
                if (error.data && error.data.message) {
                    showToast({
                        type: 'fail',
                        message: error.data && error.data.message,
                    })
                }
                // error.isCancelRequest = Axios.isCancel(error)
                return Promise.reject(error)
            },
        )
    }
    // 取消重复请求的逻辑
    cancelPendingRequest(url, method) {
        const key = `${method}:${url}`
        if (this.pendingRequests.has(key)) {
            const cancel = this.pendingRequests.get(key)
            cancel('Request canceled due to duplicate request')
            this.pendingRequests.delete(key)
        }
    }

    // 获取请求的唯一key
    getRequestKey(config) {
        const { method, url, params, data } = config
        return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
    }

    // 检查是否有相同请求正在进行中
    checkPendingRequest(config) {
        const requestKey = this.getRequestKey(config)
        if (this.requestCache.has(requestKey)) {
            return this.requestCache.get(requestKey)
        }
        return null
    }

    // 缓存请求
    cacheRequest(config, promise) {
        const requestKey = this.getRequestKey(config)
        this.requestCache.set(requestKey, promise)

        // 请求完成后删除缓存
        promise.finally(() => {
            this.requestCache.delete(requestKey)
        })
    }

    // 修改request方法
    request(method, url, param, axiosConfig) {
        const config = {
            method,
            url,
            ...param,
            ...axiosConfig
        }

        // 检查是否有相同请求正在进行中
        const pendingRequest = this.checkPendingRequest(config)
        if (pendingRequest) {
            return pendingRequest
        }

        // 发起新请求
        const promise = new Promise((resolve, reject) => {
            PureHttp.axiosInstance
                .request(config)
                .then(response => {
                    resolve(response)
                })
                .catch(error => {
                    reject(error)
                })
        })

        // 缓存请求
        this.cacheRequest(config, promise)

        return promise
    }

    post(url, params, config) {
        return this.request('post', url, params, config)
    }

    get(url, params, config) {
        return this.request('get', url, params, config)
    }
}

export const http = new PureHttp()
