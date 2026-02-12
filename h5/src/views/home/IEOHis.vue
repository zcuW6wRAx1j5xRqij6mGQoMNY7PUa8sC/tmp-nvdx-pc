<script setup>
import { useI18n } from 'vue-i18n'
import { getMyIEOOrderApi } from '@/api/data'
import useList from '@/hooks/useList'
import { friendlyNumber, setBaseUrl, subtract } from '@/utils/utils'
import dayjs from 'dayjs'
import { computed } from 'vue'
const { t } = useI18n()
const tabList = computed(() => {
    return [
        { id: 1, name: t('ieo.status1') },
        { id: 2, name: t('ieo.status4') },
        { id: 3, name: t('ieo.status5') },
    ]
})
const activeTab = ref(1)
const tabChange = id => {
    activeTab.value = id
    initData({
        api: getMyIEOOrderApi,
        status: id === 1 ? 'pending' : id === 2 ? 'processing' : id === 3 ? 'completed' : '',
    })
}
const { showList, loading, finished, onLoad, initData } = useList(getMyIEOOrderApi, {
    status: 'pending',
})
const showInfoList = computed(() => {
    return [
        {
            key: 'unit_price',
            name: t('ieo.tab2.label1'),
            cb: data => {
                return friendlyNumber(data.unit_price)
            },
        },
        {
            key: 'quantity',
            name: t('ieo.tab2.label2'),
        },
        {
            key: 'trade_volume',
            name: t('ieo.tab2.label3'),
            cb: data => {
                return friendlyNumber(data.total_amount)
            },
        },
        {
            key: 'result_total_amount',
            name: t('ieo.tab2.label4'),
            cb: data => {
                return friendlyNumber(data.result_total_amount)
            },
        },
        {
            key: 'result_quantity',
            name: t('ieo.tab2.label5'),
        },
        {
            key: 'result_unit_price',
            name: t('ieo.tab2.label6'),
            cb: data => {
                return friendlyNumber(data.result_unit_price)
            },
        },
        {
            key: 'trade_volume',
            name: t('ieo.tab2.label7'),
            cb: data => {
                return data.result_time ? dayjs(data.result_time).format('YYYY.MM.DD') : '-'
            },
        },
        {
            key: 'trade_volume',
            name: t('ieo.tab2.label8'),
            cb: data => {
                return (
                    friendlyNumber(data.subscribed_amount) +
                    ' USD / ' +
                    friendlyNumber(data.result_total_amount) +
                    ' USD'
                )
            },
        },
        {
            key: 'trade_volume',
            name: t('ieo.tab2.label9'),
            cb: data => {
                return (
                    friendlyNumber(subtract(data.result_total_amount, data.subscribed_amount)) +
                    ' USD'
                )
            },
        },
    ]
})
</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top placeholder fixed left-arrow @click-left="$router.back()">
        <template #title>
            <MyTab
                isShrink
                :tabList="tabList"
                :tabActive="activeTab"
                @tabChange="tabChange"
                class="pl-4"
                isFew
            ></MyTab>
        </template>
    </van-nav-bar>

    <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="$t('common.noMore')"
        @load="onLoad"
        class="flex-auto overflow-auto p-4"
    >
        <MyShowInfo
            v-for="item in showList"
            :key="item.id"
            :title="item.ieo && item.ieo.ieo_name"
            :infoList="showInfoList"
            :dataInfo="item"
        >
            <template #left>
                <img
                    v-if="item.ieo && item.ieo.coin.logo"
                    :src="setBaseUrl(item.ieo && item.ieo.coin.logo)"
                    class="b-img"
                    alt=""
                />
            </template>
            <template #right>
                <div
                    class="c-status-box status ml-auto"
                    :class="[
                        item.status === 0
                            ? 'status-yellow'
                            : item.status === 1
                              ? 'status-green'
                              : item.status === 2
                                ? 'status-grey'
                                : 'status-red',
                    ]"
                >
                    {{
                        item.status === 0
                            ? $t('ieo.status6')
                            : item.status === 1
                              ? $t('ieo.status4')
                              : item.status === 2
                                ? $t('ieo.status7')
                                : $t('ieo.status8')
                    }}
                </div>
            </template>
        </MyShowInfo>
    </van-list>
</template>
<style scoped lang="scss">
.status {
    font-weight: 500;
    border-radius: 6px;
    color: #fff !important;
}


:deep(.is-few .van-tabs__wrap) {
    margin-right: 12px !important;
    flex: auto;
}

:deep(.van-nav-bar__title) {
    min-width: 100%;
    padding-right: 10px !important;
    display: flex;
    justify-content: space-between;
}
</style>
