import { onBeforeUnmount } from 'vue'

let socketInfo = {
    url:  `${import.meta.env.VITE_WS_DOMAIN_REAL}connection/websocket`,
}

let centrifuge = null
// 全局订阅管理器，解决多个组件共享订阅的问题
const globalSubscriptions = {
    // channelUrl -> { subscription, callbacks: [fn1, fn2, ...] }
}

// url: 订阅的频道 fn 处理数据的函数
export default function useSocket(url, fn) {
    // 组件级别的订阅记录，用于组件卸载时清理
    const componentSubscriptions = []
    
    if (!centrifuge) {
        centrifuge = new Centrifuge(socketInfo.url, {
            token: localStorage.getItem('ws_token'),
        })
    }
    
    function connectHandle(scriptUrl) {
        try {
            if (!centrifuge) return
            centrifuge
                .on('connecting', function (ctx) {
                    console.log(`connecting: ${ctx.code}, ${ctx.reason}`)
                })
                .on('connected', function (ctx) {
                    console.log(`connected over ${ctx.transport}`)
                })
                .on('disconnected', function (ctx) {
                    console.log(`disconnected: ${ctx.code}, ${ctx.reason}`)
                })
                .on('error', function (ctx) {
                    console.log('client error', ctx)
                })
                .connect()
            if (!scriptUrl) {
                return
            }
            setSub(scriptUrl, fn)
        } catch (error) {
            console.error('connectHandle error:', error)
        }
    }
    
    // 再次订阅其他的
    function setSub(subUrl, subFn, token = '') {
        try {
            console.log('setSub called for channel:', subUrl)
            
            if (!subUrl || !subFn) return null
            
            const opt = {}
            if (token.length > 0) {
                opt.token = token
            }
            
            // 检查全局订阅中是否已存在该频道
            if (globalSubscriptions[subUrl]) {
                console.log(`Channel ${subUrl} already exists in global subscriptions`)
                // 已存在，添加新的回调函数
                globalSubscriptions[subUrl].callbacks.push(subFn)
                // 记录组件级别的订阅
                componentSubscriptions.push(subUrl)
                return globalSubscriptions[subUrl].subscription
            }
            
            // 创建新的订阅
            const subscription = centrifuge.newSubscription(subUrl, opt)
            if (!subscription) {
                return null
            }
            
            // 初始化全局订阅记录
            globalSubscriptions[subUrl] = {
                subscription,
                callbacks: [subFn]
            }
            
            // 记录组件级别的订阅
            componentSubscriptions.push(subUrl)
            
            subscription
                .on('publication', function (ctx) {
                    // 通知所有回调函数
                    globalSubscriptions[subUrl].callbacks.forEach(callback => {
                        callback && callback(ctx)
                    })
                })
                .on('subscribing', function (ctx) {
                    console.log(`subscribing: ${ctx.code}, ${ctx.reason}`)
                })
                .on('subscribed', function (ctx) {
                    console.log('subscribed', ctx)
                })
                .on('unsubscribed', function (ctx) {
                    console.log(`unsubscribed: ${ctx}, ${ctx.reason}`)
                    // 从全局订阅中移除
                    delete globalSubscriptions[subUrl]
                })
                .on('error', function (ctx) {
                    console.error(`subscription error: ${ctx.code}, ${ctx.reason}`)
                })
                .subscribe()
                
            return subscription
        } catch (error) {
            console.error('setSub error:', error)
            return null
        }
    }
    
    connectHandle(url)

    // 取消特定频道的订阅（只移除当前组件的回调，不影响其他组件）
    function unsubscribeChannel(channelUrl, callbackFn) {
        try {
            if (!globalSubscriptions[channelUrl]) return
            
            // 从组件订阅记录中移除
            const index = componentSubscriptions.indexOf(channelUrl)
            if (index !== -1) {
                componentSubscriptions.splice(index, 1)
            }
            
            // 从回调数组中移除对应的回调函数
            if (callbackFn && globalSubscriptions[channelUrl].callbacks) {
                const callbackIndex = globalSubscriptions[channelUrl].callbacks.indexOf(callbackFn)
                if (callbackIndex !== -1) {
                    globalSubscriptions[channelUrl].callbacks.splice(callbackIndex, 1)
                    console.log(`Removed callback for channel ${channelUrl}`)
                }
            }
            
            // 如果没有其他组件订阅该频道，才真正取消订阅
            if (globalSubscriptions[channelUrl].callbacks.length === 0) {
                console.log(`No more callbacks for channel ${channelUrl}, unsubscribing`)
                const subscription = globalSubscriptions[channelUrl].subscription
                subscription.unsubscribe()
                centrifuge.removeSubscription(subscription)
                delete globalSubscriptions[channelUrl]
            }
        } catch (error) {
            console.error('unsubscribeChannel error:', error)
        }
    }

    // 取消当前组件的所有订阅
    function unsubscribeComponent() {
        try {
            componentSubscriptions.forEach(channelUrl => {
                if (!globalSubscriptions[channelUrl]) return
                
                // 从全局回调中移除当前组件的回调
                globalSubscriptions[channelUrl].callbacks = globalSubscriptions[channelUrl].callbacks.filter(
                    callback => callback !== fn
                )
                
                // 如果没有其他组件订阅该频道，才真正取消订阅
                if (globalSubscriptions[channelUrl].callbacks.length === 0) {
                    console.log(`No more callbacks for channel ${channelUrl}, unsubscribing`)
                    const subscription = globalSubscriptions[channelUrl].subscription
                    subscription.unsubscribe()
                    centrifuge.removeSubscription(subscription)
                    delete globalSubscriptions[channelUrl]
                }
            })
            // 清空组件订阅记录
            componentSubscriptions.length = 0
        } catch (error) {
            console.error('unsubscribeComponent error:', error)
        }
    }
    
    // 取消所有订阅（谨慎使用，会影响所有组件）
    function unsubscribeAll() {
        try {
            Object.keys(globalSubscriptions).forEach(channelUrl => {
                const subscription = globalSubscriptions[channelUrl].subscription
                subscription.unsubscribe()
                centrifuge.removeSubscription(subscription)
            })
            // 清空全局订阅
            Object.keys(globalSubscriptions).forEach(key => {
                delete globalSubscriptions[key]
            })
            // 清空组件订阅记录
            componentSubscriptions.length = 0
        } catch (error) {
            console.error('unsubscribeAll error:', error)
        }
    }
    
    // 组件卸载时只清理自己的订阅
    onBeforeUnmount(() => {
        unsubscribeComponent()
    })
    
    function unConnectHandle() {
        if (centrifuge) {
            unsubscribeAll()
            centrifuge.disconnect()
            centrifuge = null
        }
    }
    
    return { 
        connectHandle, 
        setSub, 
        unsubscribeChannel, 
        unsubscribeAll, 
        unConnectHandle 
    }
}
