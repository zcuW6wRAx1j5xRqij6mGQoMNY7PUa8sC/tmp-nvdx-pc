<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import useList from '@/hooks/useList'
import { friendlyNumber, setBaseUrl } from '@/utils/utils'
import dayjs from 'dayjs'
import { financialProductOrderListApi, financialProductRedeemApi } from '@/api/data'
import { useRouter } from 'vue-router'
import { showLoadingToast } from 'vant'
const router = useRouter()
const showOut = ref(false)
const clickInfo = ref({})
const liClick = item => {
    console.log(item)
    if (item.status === 'pending') {
        showOut.value = true
        clickInfo.value = item
    }
}
const { t } = useI18n()
const { showList, loading, finished, onLoad, initData } = useList(financialProductOrderListApi,)
const tabList = computed(() => {
    return [
        { id: 'pending', name: t('aiHis.tab1') },
        { id: 'settled', name: t('aiHis.tab2') },
    ]
})
const activeTab = ref('pending')
const tabChange = id => {
    activeTab.value = id
    initData({ status: id })
}
onMounted(() => {
    onLoad({ status: activeTab.value })
})
const showInfoList = computed(() => {
    let list = [
        {
            key: 'amount',
            nameCb: data => {
                return `${t('aiHis.label1')}`
            },
            cb: data => {
                return `${friendlyNumber(data.amount)} USD`
            },
        },
        {
            key: 'end_at',
            nameCb: data => {
                return `${t('aiHis.label2')}`
            },
            cb: data => {
                return dayjs(data.end_at).format('YYYY-MM-DD')
            },
        },
        {
            key: 'amount',
            nameCb: data => {
                return `${t('aiHis.label3')}`
            },
            cb: data => {
                return friendlyNumber(data.amount)
            },
        },
        {
            key: 'penalty_amount',
            nameCb: data => {
                return `${t('aiHis.label4')}`
            },
            cb: data => {
                return friendlyNumber(data.penalty_amount)
            },
        },
        {
            key: 'expected_total_profit',
            nameCb: data => {
                return `${t('aiHis.label5')}`
            },
            cb: data => {
                return friendlyNumber(data.expected_total_profit)
            },
            cssCb: (data) => {
                return +data.expected_total_profit < 0 ? 'red-color' : 'green-color'
            },
        },
    ]
    return list
})
const submitHandle = () => {
    showLoadingToast({
        forbidClick: true,
        loadingType: 'spinner',
        duration: 0,
    })
    financialProductRedeemApi({
        order_id: clickInfo.value.id,
    }).then(() => {
        showOut.value = false
        tabChange(activeTab.value)
    })
}
</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top :title="$t('aiHis.title')" left-arrow @click-left="$router.back()" fixed
        placeholder>
    </van-nav-bar>
    <MyTab :tabList="tabList" :tabActive="activeTab" @tabChange="tabChange" isFew class="pl-2"></MyTab>
    <div class="c-content p-4 overflow-auto flex-auto">
        <NoData v-if="!showList.length"></NoData>
        <van-list v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')" @load="onLoad"
            v-if="showList.length">
            <MyShowInfo v-for="item in showList" :key="item.id" :title="item.financial && item.financial.name"
                :infoList="showInfoList" :dataInfo="item" @click="liClick(item)">
                <template #left>
                    <img v-if="item.financial && item.financial && item.financial.logo"
                        :src="setBaseUrl(item.financial.logo)" class="b-img" alt="" />
                </template>
                <template #right>
                    <div class="c-status-box is-small ml-auto"
                        :class="[activeTab === 'pending' ? 'blue' : 'status-grey']">
                        {{
                            activeTab === 'pending'
                                ? $t('aiHis.status1')
                                : $t('aiHis.status2')
                        }}
                    </div>
                </template>
                <div class="flex mt-3">
                    <div class="c-order-tip-box blue">
                        <span class=" c-is-num">{{
                            item.duration
                        }}</span>
                        {{ $t('aiHis.days') }}
                    </div>
                    <div class="c-order-tip-box">
                        {{ dayjs(item.start_at).format('YYYY-MM-DD') }}
                    </div>
                </div>
                <template #data="{ prop }">
                    <span v-if="prop === 'delivery_time'">{{
                        prop === 'delivery_time' && item.value
                    }}</span>
                </template>
            </MyShowInfo>
        </van-list>
        <MyConfirm v-model="showOut" @confirm="submitHandle" btnType="primary" :title="t('aiHis.sureTip')"
            titleColor="#fff">
        </MyConfirm>
    </div>
</template>

<style scoped>
.show-title {
    font-weight: 500;
    font-size: 14px;
    color: #000000;
}

.show-desc {
    font-weight: 500;
    font-size: 14px;
    color: #595959;
    display: flex;
    align-items: center;
}
</style>
