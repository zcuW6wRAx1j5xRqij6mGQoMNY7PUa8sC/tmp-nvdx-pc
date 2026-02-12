<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import useList from '@/hooks/useList'
import { getSpotListApi, getContractListApi } from '@/api/data'
import { optionsListApi } from '@/api/options'
import { computed, nextTick, onMounted, ref, watchEffect } from 'vue'
import { friendlyNumber, formatNumber, setBaseUrl, usdcToUsd } from '@/utils/utils'
import { useRoute } from 'vue-router'
import { serChartData } from '@/utils/serChartData'
const route = useRoute()
const { t } = useI18n()
const props = withDefaults(
    defineProps<{
        modelValue: boolean
        isSpots: boolean
        setSub: Function
        isOptions: boolean
    }>(),
    { modelValue: false, isSpots: true, isOptions: false },
)
const emit = defineEmits(['update:modelValue', 'selectHandle', 'dataChange'])
const data = useVModel(props, 'modelValue', emit)
let isInit = true
const initFn = data => {
    const status = props.isOptions ? optionsList.value.length > 0 : true
    if (optionsList.value.length) {
        const list = []
        showList.value.forEach(item => {
            optionsList.value.find(opt => opt.symbol_id === item.id) && list.push(item)
        })
        data = list
    }
    if (!route.query.symbolId && isInit && status) {
        isInit = false
        if (data && data.length > 0) {
            console.log(data[0])
            tdClick(data[0])
        }
    }
    open()
}
const { showList, loading, finished, onLoad } = useList(
    props.isSpots ? getSpotListApi : getContractListApi,
    { noLoading: true },
    initFn,
)

const optionsList = ref([])
const getOptionsList = async () => {
    const res = await optionsListApi()
    optionsList.value = res
}

const showListOptions = computed(() => {
    if (!showList.value.length || !optionsList.value.length) return []
    const list = []
    showList.value.forEach(item => {
        optionsList.value.find(opt => opt.symbol_id === item.id) && list.push(item)
    })
    return list
})
onMounted(() => {
    if (!route.query.symbolId) {
        onLoad()
    }
    if (props.isOptions) {
        getOptionsList()
    }
})
const tdClick = val => {
    emit('selectHandle', val)
}

const columns = computed(() => {
    return [
        {
            width: 30,
            align: 'left',
            label: t('transaction.th1'),
            value: 'name',
        },
        { width: 40, value: 'price', isNum: true, align: 'right' },
        {
            width: 30,
            label: t('newMy.th3'),
            value: 'price_change_percent',
            isNum: true,
            align: 'right',
        },
    ]
})
let isInit1 = true
function open() {
    if (!data.value) return
    nextTick(() => {
        serChartData(showList.value, props.isSpots ? 'spot' : 'futures')
    })
}
const recordMap = ref({})
const setListData = data => {
    recordMap.value[data.data.symbol] = data.data
    emit('dataChange', data.data, recordMap.value)
}
nextTick(() => {
    const type = props.isSpots ? 'spot' : 'futures'
    props.setSub && props.setSub(`public:allticker`, setListData)
})
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
    <van-popup v-model:show="data" position="left" :style="{ width: '90%', height: '100%' }" :lock-scroll="false"
        safe-area-inset-top safe-area-inset-bottom close-on-popstate @open="open">
        <van-list v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')" @load="onLoad"
            class="flex-auto overflow-auto pl-2 pr-2">
            <MyTable :dataList="props.isOptions ? showListOptions : showList" :columns="columns" @tdClick="tdClick">
                <template #default="{ data, th }">
                    <div v-if="th.value === 'name'" class="flex items-center">
                        <img v-if="data.logo" :src="setBaseUrl(data.logo)" class="w-7 h-7 mr-2" alt="" />
                        <div class="b-title">
                            <div>{{ usdcToUsd(data.base_asset.toUpperCase()) }}</div>
                            <div class="b-desc">{{ usdcToUsd(data.quote_asset.toUpperCase()) }}</div>
                        </div>
                    </div>
                    <div v-else-if="th.value === 'price'" class="flex-auto flex justify-center chart"
                        :id="`chart${data.id}`"></div>
                    <div v-else-if="th.value === 'price_change_percent'" class="num-count flex-shrink-0 ml-auto" :class="[
                        formatNumber(getData(data, 'price_change_percent')) > 0
                            ? 'status-green'
                            : 'status-red',
                    ]">
                        <div class="latest_change" :class="[
                            formatNumber(getData(data, 'price_latest_change')) >= 0
                                ? 'green-color'
                                : 'red-color ',
                        ]">
                            {{ getData(data, 'price') }}
                        </div>
                        <div class="change_percent" :class="[
                            formatNumber(getData(data, 'price_change_percent')) > 0
                                ? 'green-color'
                                : 'red-color',
                        ]">
                            {{ friendlyNumber(getData(data, 'price_change_percent')) }}%
                        </div>
                    </div>
                </template>
            </MyTable>
        </van-list>
    </van-popup>
</template>

<style scoped lang="scss">
.van-popup {
    padding-top: 30px;
    // background-color: #14171c;
	background-color: var(--surface-bg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

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
</style>
