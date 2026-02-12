<script setup>
import { useI18n } from 'vue-i18n'
import { getSpotOrderApi } from '@/api/data'
import useList from '@/hooks/useList'
import { friendlyNumber, setBaseUrl } from '@/utils/utils'
import dayjs from 'dayjs'
import { onMounted } from 'vue'
const { t } = useI18n()
const { showList, loading, finished, onLoad } = useList(getSpotOrderApi, { isNoPage: true })
onMounted(onLoad)
const showInfoList = computed(() => {
    return [
        {
            key: 'volume',
            name: t('spotOrder.label1'),
            nameCb: data => {
                return `${t('spotOrder.label1')}(${data.name.split('/')[0]})`
            },
            cb: data => {
                return `${data.trade_status === 'failed' ? '-' : friendlyNumber(data.volume)}/${friendlyNumber(data.volume)}`
            },
        },
        {
            key: 'trade_volume',
            name: t('spotOrder.label2'),
            cb: data => {
                return `${data.trade_status === 'failed' ? '-' : friendlyNumber(data.trade_volume)}/${friendlyNumber(data.trade_volume)}`
            },
        },
        {
            key: 'match_price',
            name: t('spotOrder.label3'),
            cb: data => {
                return `${data.trade_status === 'failed' ? '-' : friendlyNumber(data.match_price)}`
            },
        },
        {
            key: 'match_price',
            name: t('spotOrder.label4'),
            cb: data => {
                return `${data.trade_status === 'failed' ? '-' : friendlyNumber(data.price)}`
            },
        },
    ]
})
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        placeholder
        fixed
        left-arrow
        @click-left="$router.back()"
        :title="$t('spotOrder.title')"
    >
    </van-nav-bar>
    <NoData v-if="!showList.length" style="padding: 0"></NoData>
    <van-list
        v-else
        v-model:loading="loading"
        :finished="finished"
        :finished-text="$t('common.noMore')"
        @load="onLoad"
        class="flex-auto overflow-auto p-4"
    >
        <MyShowInfo
            v-for="item in showList"
            :key="item.id"
            :title="item.name"
            :infoList="showInfoList"
            :dataInfo="item"
        >
            <template #left>
                <img v-if="item.logo" :src="setBaseUrl(item.logo)" class="b-img" alt="" />
            </template>
            <div class="flex mt-3">
                <div
                    class="c-order-tip-box"
                    :class="[item.trade_type === 'limit' ? 'green' : 'red']"
                >
                    {{
                        item.trade_type === 'limit'
                            ? $t('spotOrder.order.order1')
                            : $t('spotOrder.order.order2')
                    }}
                </div>
                <div class="c-order-tip-box" :class="[item.side === 'buy' ? 'green' : 'red']">
                    {{
                        item.side === 'buy'
                            ? $t('spotOrder.type.type1')
                            : $t('spotOrder.type.type2')
                    }}
                </div>
                <div class="c-order-tip-box">
                    {{ dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss') }}
                </div>
            </div>
            <template #right>
                <div class="status">
                    {{
                        item.trade_status === 'pending'
                            ? $t('spotOrder.pending')
                            : item.trade_status === 'success'
                              ? $t('spotOrder.success')
                              : $t('spotOrder.failed')
                    }}
                </div>
            </template>
        </MyShowInfo>
    </van-list>
</template>

<style scoped>
.status {
    font-weight: 500;
    font-size: 12px;
    color: #8b939a;
    line-height: 14px;
    margin-left: auto;
}
</style>
