<script setup>
import { useI18n } from 'vue-i18n'
import { optionsOrderListApi } from '@/api/options'
import useList from '@/hooks/useList'
import { friendlyNumber, setBaseUrl } from '@/utils/utils'
import dayjs from 'dayjs'
import { onMounted } from 'vue'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const symbolId = computed(() => route.query.symbolId)
const { t } = useI18n()

const tabList = computed(() => {
    return [
        { id: 'pending', name: t('spotOrder.tab.tab1') },
        { id: 'closed', name: t('spotOrder.tab.tab2') },
    ]
})
const activeTab = ref(tabList.value[0].id)
const { showList, loading, finished, onLoad, initData } = useList(optionsOrderListApi, {
    status: activeTab.value,
})
onMounted(onLoad)
const tabChange = id => {
    activeTab.value = id
    initData({
        status: activeTab.value,
        api: optionsOrderListApi,
    })
}

const showInfoList = computed(() => {
    let list = [
        {
            // 购买金额
            key: 'amount',
            name: t('spotOrder.buyAmount'),
            // nameCb: data => {
            //     return `${t('spotOrder.label1')}(${data.name.split('/')[0]})`
            // },
            cb: data => {
                return friendlyNumber(+data.amount || 0)
            },
        },
        {
            // 开仓价
            key: 'open_price',
            name: t('spotOrder.openPrice'),
            cb: data => {
                return friendlyNumber(+data.open_price || 0)
            },
        },
        {
            // 交割时间
            key: 'deliveryTime',
            name: t('spotOrder.deliveryTime'),
            cb: data => {
                return dayjs(data.settlement_time).format('YYYY-MM-DD HH:mm:ss')
            },
        },
        {
            // 收益金额
            key: 'profit_mount',
            name: t('spotOrder.profitAmount'),
            cb: data => {
                return friendlyNumber(data.profit)
            },
        },]
    // if (activeTab.value === 0) {
    //     list.push({
    //         // 剩余时间
    //         key: 'remainTime',
    //         name: t('spotOrder.remainTime'),
    //         cb: data => {
    //             return 0
    //         },
    //     })
    // }
    return list
})

const handleClickLeft = () => {
    router.push({
        path: '/ContractOpe',
        query: {
            symbolId: symbolId.value,
        }
    })
}

</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top placeholder fixed left-arrow @click-left="handleClickLeft"
        :title="$t('spotOpe.OptionsHistory')">
    </van-nav-bar>
    <MyTab :tabList="tabList" :tabActive="activeTab" @tabChange="tabChange"></MyTab>
    <NoData v-if="!showList.length" style="padding: 0"></NoData>
    <van-list v-else v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')" @load="onLoad"
        class="flex-auto overflow-auto p-4">
        <MyShowInfo v-for="item in showList" :key="item.id" :title="item.name" :infoList="showInfoList"
            :dataInfo="item">
            <template #left>
                <div class="title">{{ item.symbol?.name || '-' }}</div>
            </template>
            <div class="flex mt-3">
                <!-- <div
                    class="c-order-tip-box"
                    :class="[item.trade_type === 'limit' ? 'green' : 'red']"
                >
                    {{
                        item.trade_type === 'limit'
                            ? $t('spotOrder.order.order1')
                            : $t('spotOrder.order.order2')
                    }}
                </div> -->
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
                <div class="status" :class="item.status === 'pending' ? 'pending' : 'end'">
                    {{
                        item.status === 'pending'
                            ? $t('spotOrder.status.pending')
                            : $t('spotOrder.status.end')
                    }}
                </div>
            </template>
        </MyShowInfo>
    </van-list>
</template>

<style scoped>
.title {
    font-size: 16px;
    font-weight: bold;
    color: #fff;
}

.status {
    font-weight: 500;
    font-size: 12px;
    color: #8b939a;
    line-height: 14px;
    margin-left: auto;
    padding: 3px 6px;
    max-width: 110px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 18px;
    box-sizing: border-box;

    &.pending {
        background: #FFC148;
        color: #553800;
    }

    &.end {
        background: #222324;
        color: #8B939A;
    }
}

:deep(.van-tab) {
    flex: none !important;
}
</style>
