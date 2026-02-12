<script setup>
import { useI18n } from 'vue-i18n'
import { getContractOrderApi } from '@/api/data'
import useList from '@/hooks/useList'
import { friendlyNumber, multiply, subtract, setBaseUrl, divide, formatNumber, percentage, usdcToUsd } from '@/utils/utils'
import dayjs from 'dayjs'
import useSocket from '@/hooks/useSocket'
const { t } = useI18n()
const recordMap = ref({})
const setListData = data => {
    recordMap.value[data.data.symbol] = data.data
}
useSocket('public:allticker', setListData)
function getData (row, prop, needSymbol = false) {
    let data = recordMap.value[row.symbol] || {}
    row[prop] = +data[prop] || 0
    const show = friendlyNumber(+data[prop]) || 0
    if (needSymbol) {
        if (formatNumber(show) > 0) {
            return `+${show}`
        }
    }
    return show
}
const setProfit = item => {
    //  盈亏 = 交易量(volume) * (最新价格(你获取到最新价格) - 开盘价(open_price))
    // 如果 是卖(side = sell) , 则还需要 abs[取反](盈亏)
    let latestPrice = getData(item, 'price')
    if (formatNumber(latestPrice) === 0) {
        return 0
    }
    let value = multiply(item.volume, subtract(latestPrice, item.open_price))
    return friendlyNumber(item.side === 'sell' ? multiply(value,-1) : value)
}
// 盈利百分比 
const setProfitRatio = item => {
    // ((最新市场价-买入价)* 交易量)/保证金
    return percentage(divide(setProfit(item), item.margin))
}
const { showList, loading, finished, onLoad } = useList(getContractOrderApi, { isNoPage: true, status: 'closed' })
const showInfoList = computed(() => {
    return [
        {
            key: 'volume',
            nameCb: data => {
                return `${t('contractOrder.info.label1')}(${data.name.split('/')[0]})`
            },
            cb: data => {
                return friendlyNumber(data.volume)
            },
        },
        {
            key: 'open_fee',
            name: t('contractOrder.info.label5'),
            cb: data => {
                return friendlyNumber(data.open_fee)
            },
        },
        {
            key: 'open_price',
            name: t('contractOrder.info.label2'),
            cb: data => {
                return friendlyNumber(data.open_price)
            },
        },
        {
                key: 'close_price',
                name: t('contractOrder.info.label8'),
                cb: data => {
                    return friendlyNumber(data.close_price)
            },
        },
        {
            key: 'profit',
            nameCb: data => {
                return `${t('contractOrder.info.label3')}(${usdcToUsd(data.name.split('/')[1])})`
            },
            cb: data => {
                return data.trade_status === 'open' ? setProfit(data) : friendlyNumber(data.profit)
            },
            cssCb: data => {
                return (data.trade_status === 'open' ? formatNumber(setProfit(data)) : +data.profit) >= 0
                    ? 'green-color'
                    : 'red-color'
            },
        },
        {
            key: 'profit_ratio',
            nameCb: data => {
                return `${t('contractOrder.info.label7')}`
            },
            cb: data => {
                return data.trade_status === 'open' ? `${setProfitRatio(data)}%` : `${percentage(data.profit_ratio)}%`
            },
            cssCb: data => {
                return (data.trade_status === 'open' ? formatNumber(setProfitRatio(data)) : +data.profit_ratio) >= 0
                    ? 'green-color'
                    : 'red-color'
            },
        },
        {
            key: 'close_fee',
            name: t('contractOrder.info.label6'),
            cb: data => {
                return friendlyNumber(data.close_fee)
            },
        },
        {
            key: 'trade_status',
            name: t('contractOrder.info.label4'),
            cb: data => {
                return t(`contractOrder.status.${data.trade_status}`)
            },
        },
        {
            key: 'close_time',
            name: t('contractOrder.info.label9'),
            cb: data => {
                return dayjs(data.close_time).format('YYYY-MM-DD HH:mm:ss')
            },
        },
    ]
})
</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top placeholder fixed left-arrow @click-left="$router.back()"
        :title="$t('contractOrder.title')">
    </van-nav-bar>
    <!-- <MyTab
        isShrink
        :tabList="tabList"
        :tabActive="activeTab"
        @tabChange="tabChange"
        class="pl-4 mt-6"
        isFew
    ></MyTab> -->
    <van-list v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')" @load="onLoad"
        class="flex-auto overflow-auto p-4">
        <MyShowInfo v-for="item in showList" :key="item.id" :title="usdcToUsd(item.name)" :infoList="showInfoList"
            :dataInfo="item">
            <template #left>
                <img v-if="item.logo" :src="setBaseUrl(item.logo)" class="b-img" alt="" />
            </template>
            <div class="flex mt-3">
                <div class="c-order-tip-box" :class="[item.trade_type === 'limit' ? 'green' : 'red']">
                    {{
                        item.trade_type === 'limit'
                            ? $t('contractOrder.order.order1')
                            : $t('contractOrder.order.order2')
                    }}
                </div>
                <div class="c-order-tip-box" :class="[item.side === 'buy' ? 'green' : 'red']">
                    {{
                        item.side === 'buy'
                            ? $t('contractOrder.type.type1')
                            : $t('contractOrder.type.type2')
                    }}
                </div>
                <div class="c-order-tip-box">
                    {{
                        item.margin_type === 'crossed'
                            ? $t('contractOrder.marginType.marginType1')
                            : $t('contractOrder.marginType.marginType2')
                    }}
                    {{ item.leverage }}x
                </div>
                <div class="c-order-tip-box">
                    {{ dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss') }}
                </div>
            </div>
        </MyShowInfo>
    </van-list>
</template>

<style scoped></style>
