<script setup>
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useList from '@/hooks/useList'
import useSocket from '@/hooks/useSocket'
import { getSpotListApi, getContractListApi, getCollectListApi, addCollectApi } from '@/api/data'
import { friendlyNumber, formatNumber, setBaseUrl } from '@/utils/utils'
import { showLoadingToast, showSuccessToast } from 'vant'
// import { serChartData } from '@/utils/serChartData'
const router = useRouter()
const { t } = useI18n()
const tabList = computed(() => {
    return [
        { id: 0, name: t('transaction.tab1') },
        { id: 2, name: t('transaction.tab2') },
        { id: 1, name: t('transaction.tab.tab2') },
    ]
})
const activeTab = ref(0)
const tabChange = id => {
    activeTab.value = id
    initData({
        api:
            id === 1
                ? getCollectListApi
                : id === 0
                  ? getSpotListApi
                  : getContractListApi,
        symbol_type: id === 1 ? typeActiveTab.value === 0 ? 'spot' : 'futures' : id === 0 ? 'spot' : 'futures',
        isNoPage: id === 1,
    })
}
const typeTabList = computed(() => {
    return [
        { id: 0, name: t('transaction.tab1') },
        { id: 1, name: t('transaction.tab2') },
    ]
})
const typeActiveTab = ref(0)
const typeTabChange = id => {
    typeActiveTab.value = id
    const type = typeActiveTab.value === 0 ? 'spot' : 'futures'
    initData({
        api:
            activeTab.value === 1
                ? getCollectListApi
                : activeTab.value === 0
                  ? getSpotListApi
                  : getContractListApi,
        symbol_type: activeTab.value === 1 ? type: activeTab.value === 0 ? 'spot' : 'futures',
        isNoPage: activeTab.value === 1,
    })
    recordMap.value = {}
    unsubscribeAll()
    setSub(`public:allticker`, setListData)
}
const { showList, loading, finished, onLoad, initData } = useList(
    typeActiveTab.value === 0 ? getSpotListApi : getContractListApi, {page_size: 99}
)
// watchEffect(() => {
//     serChartData(showList.value, typeActiveTab.value === 0 ? 'spot' : 'futures')
// })
const columns = computed(() => {
    let list =  [
        {
            width: 30,
            align: 'left',
            label: t('transaction.th1'),
            value: 'name',
        },
        { width: 40, value: 'price', isNum: true, align: 'center', label: t('transaction.th2') },
       
    ]
    if(activeTab.value === 1){
        list.push({
            width: 20,
            label: t('transaction.th4'),
            value: 'price_change_percent',
            isNum: true,
            align: 'right',
        })
        list.push({
            width: 10,
            value: 'collet',
            align: 'right',
        })
    }else{
        list.push(
        {
            width: 30,
            label: t('transaction.th4'),
            value: 'price_change_percent',
            isNum: true,
            align: 'right',
        })
    }
    return list
})
const showName = ref(false)
const tdClick = data => {
    let path = (typeActiveTab.value === 0 && activeTab.value === 1 || activeTab.value===0) ? '/SpotOpe' : '/ContractOpe'
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
// 收藏
const collect = (data) => {
    showLoadingToast()
    // spot 现货/ futures 合约
    addCollectApi({
        symbol_id: data.id,
        symbol_type: typeActiveTab.value === 0 ? 'spot' : 'futures',
    }).then(() => {
        showSuccessToast(t('common.opeSuccess'))
        initData({
            api:
                activeTab.value === 1
                    ? getCollectListApi
                    : activeTab.value === 0
                      ? getSpotListApi
                      : getContractListApi,
            symbol_type: activeTab.value === 1 ? typeActiveTab.value === 0 ? 'spot' : 'futures': activeTab.value === 0 ? 'spot' : 'futures',
            isNoPage: activeTab.value === 1,
        })
    })
}
</script>
<!--  -->
<template>
    <MyTab
        isShrink
        :tabList="tabList"
        :tabActive="activeTab"
        @tabChange="tabChange"
        class="pl-4 mt-6"
        isFew
    ></MyTab>
    <MyTab
        v-if="activeTab === 1"
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
                <div v-if="th.value === 'name'" class="flex items-center">
                    <img
                        v-if="data.logo"
                        :src="setBaseUrl(data.logo)"
                        class="w-7 h-7 mr-2"
                        alt=""
                    />
                    <div class="b-title">
                        <div>{{ data.base_asset.toUpperCase() }}</div>
                    </div>
                </div>
                    <div
                    v-else-if="th.value === 'price'"
                        class="latest_change"
                        :class="[
                            formatNumber(getData(data, 'price_latest_change')) >= 0
                                ? 'green-color'
                                : 'red-color ',
                        ]"
                    >
                        {{ getData(data, 'price') }}
                    </div>
                <div
                    v-else-if="th.value === 'price_change_percent'"
                    class="num-count flex-shrink-0 ml-auto"
                    :class="[
                        formatNumber(getData(data, 'price_change_percent')) > 0 ? 'status-green' : 'status-red',
                    ]"
                >
                    <div
                        class="change_percent"
                        :class="[
                            formatNumber(getData(data, 'price_change_percent')) > 0 ? 'green-color' : 'red-color',
                        ]"
                    >
                        {{ friendlyNumber(getData(data, 'price_change_percent')) }}%
                    </div>
                </div>
                <div v-else-if="th.value === 'collet'">
                  
            <img src="./img/collect-active.svg" @click.stop="collect(data)"  class="w-5 h-5" alt="" />
                </div>
            </template>
        </MyTable>
    </van-list>
    <MyConfirm
        hideCancel
        v-model="showName"
        @confirm="$router.push('/RealName')"
        :content="$t('tipAll.tip')"
        :close-on-click-overlay="false"
    ></MyConfirm>
</template>

<style scoped lang="scss">
.num-count {
    min-width: 88px;
    text-align: right;
}
.latest_change {
    font-family: DIN, DIN;
    font-weight: 500;
    font-size: 15px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 18px;
}
.change_percent {
    font-family: DIN, DIN;
    font-weight: 500;
    font-size: 13px;
    line-height: 15px;
    margin-top: 4px;
}
.b-title {
    font-weight: 500;
    font-size: 15px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 18px;
    width: 25%;
}
.b-desc {
    font-weight: 500;
    font-size: 13px;
    color: #8b939a;
    line-height: 15px;
}
.chart {
    height: 30px;
}
:deep(.td-box){
// background: #17181A;
background-color: var(--surface-bg);
border-radius: 18px;
padding: 16px;
margin-bottom: 10px;
}
:deep(.th-box){
padding: 4px 16px;
}
</style>
