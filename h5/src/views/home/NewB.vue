<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useList from '@/hooks/useList'
import useSocket from '@/hooks/useSocket'
import { getSpotListApi, getContractListApi } from '@/api/data'
import { friendlyNumber, formatNumber } from '@/utils/utils'

const router = useRouter()
const { t } = useI18n()
const typeTabList = computed(() => {
    return [
        { id: 'spot', name: t('transaction.tab1') },
        { id: 'futures', name: t('transaction.tab2') },
    ]
})
const typeActiveTab = ref('spot')
const typeTabChange = id => {
    typeActiveTab.value = id
    initData({
        api: typeActiveTab.value === 'spot' ? getSpotListApi : getContractListApi,
        symbol_type: id,
    })
    recordMap.value = {}
    unsubscribeAll()
    setSub(`public:allticker`, setListData)
}
const { showList, loading, finished, onLoad, initData } = useList(getSpotListApi, {
    coin_type: 'new',
})
const columns = computed(() => {
    return [
        {
            width: 40,
            align: 'left',
            label: t('transaction.th1'),
            prop: 'name',
            img: 'logo',
        },
        { width: 30, label: t('transaction.th2'), value: 'price', isNum: true, align: 'right' },
        {
            width: 30,
            label: t('newMy.th3'),
            value: 'price_change_percent',
            isNum: true,
            align: 'right',
        },
    ]
})
const tdClick = data => {
    let path = typeActiveTab.value === 0 ? '/SpotOpe' : '/ContractOpe'
    router.push({
        path: path,
        query: {
            symbolId: data.id,
        },
    })
}
const recordMap = ref({})
const setListData = data => {
    recordMap.value[data.data.symbol] = data.data
}
const { setSub, unsubscribeAll } = useSocket('public:allticker', setListData)
function getData(row, prop, needSymbol = false) {
    let data = recordMap.value[row.symbol] || {}
    row[prop] = +data[prop] || '-'
    const show = friendlyNumber(+data[prop]) || '-'
    if (needSymbol) {
        if (formatNumber(show) > 0) {
            return `+${show}`
        }
    }
    return show
}
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('home.menu10')"
        left-arrow
        @click-left="$router.back()"
        fixed
        placeholder
    >
    </van-nav-bar>
    <MyTab
        :tabList="typeTabList"
        :tabActive="typeActiveTab"
        @tabChange="typeTabChange"
        class="pl-4 mt-6"
        isSelect
    ></MyTab>
    <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="$t('common.noMore')"
        @load="onLoad"
        class="flex-auto overflow-auto mt-6 pl-4 pr-4"
    >
        <MyTable :dataList="showList" :columns="columns" @tdClick="tdClick">
            <template #default="{ data, th }">
                <div
                    v-if="th.value === 'price'"
                    :class="[
                        getData(data, 'price_latest_change') >= 0 ? 'green-color' : 'red-color ',
                    ]"
                >
                    {{ getData(data, 'price') }}
                </div>
                <div
                    class="c-status-box is-num"
                    v-else-if="th.value === 'price_change_percent'"
                    :class="[data.price_change_percent > 0 ? 'status-green' : 'status-red']"
                >
                    {{ getData(data, 'price_change_percent', true) }}%
                </div>
            </template>
        </MyTable>
    </van-list>
</template>

<style scoped lang="scss"></style>
