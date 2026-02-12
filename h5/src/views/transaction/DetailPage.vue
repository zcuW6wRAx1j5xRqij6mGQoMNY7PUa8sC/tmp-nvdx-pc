<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Chart from './Chart.vue'
import { useRoute, useRouter } from 'vue-router'
import useSocket from '@/hooks/useSocket'
import { friendlyNumber, formatNumber, usdcToUsd } from '@/utils/utils'
import SelectB from './components/SelectB.vue'
import { addCollectApi, getSymbolDetailApi } from '@/api/data'
import { showSuccessToast, showLoadingToast } from 'vant'
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const isSpots = computed(() => route.query.type === '0')
const symbol = ref()
const symbolId = ref(route.query.symbolId)
// 基础币
const baseAsset = ref()
// 计价币
const quoteAsset = ref()
const activeB = ref('')
const isCollection = ref(false)
// 获取币的详情并且开启socket
const getDetail = () => {
    if (!symbolId.value) {
        return
    }
    const type = isSpots.value ? 'spot' : 'futures'
    getSymbolDetailApi({
        symbol_id: symbolId.value,
        symbol_type: type,
    }).then(data => {
        isCollection.value = data.is_collection
        activeB.value = data.name
        baseAsset.value = data.base_asset.toUpperCase()
        quoteAsset.value = data.quote_asset.toUpperCase()
        if (symbol.value) {
            // 清除上次订阅，传入回调函数引用
            if (currentBookCallbackRef.value) {
                unsubscribeChannel(`public:book_${symbol.value}`, currentBookCallbackRef.value)
                currentBookCallbackRef.value = null
            }
            if (currentTickerCallbackRef.value) {
                unsubscribeChannel(`public:ticker_${symbol.value}`, currentTickerCallbackRef.value)
                currentTickerCallbackRef.value = null
            }
        }
        symbol.value = data.symbol
        // 订阅新频道并保存回调函数引用
        currentBookCallbackRef.value = setListData
        currentTickerCallbackRef.value = setInfo
        setSub(`public:book_${symbol.value}`, setListData)
        setSub(`public:ticker_${symbol.value}`, setInfo)
    })
}
onMounted(getDetail)
// 切换币
const showLeft = ref(false)
const selectHandle = item => {
    if (item?.id === symbolId.value) {
        showLeft.value = false
        return
    }
    symbolId.value = item?.id
    getDetail()
    showLeft.value = false
}
// 头部数据
const detailInfo = ref({})

const setInfo = ctx => {
    detailInfo.value = ctx.data || {}
}
const { setSub, unsubscribeChannel } = useSocket()
// 保存当前订阅的回调函数引用，用于取消订阅
const currentBookCallbackRef = ref(null)
const currentTickerCallbackRef = ref(null)
// 买卖数据
const buyList = ref([])
const sellList = ref([])
function setListData(ctx) {
    const data = ctx.data
    buyList.value = data.bids || []
    sellList.value = data.asks || []
}
const rightList = computed(() => {
    return [
        {
            label: t('detail.label1'),
            key: 'low_price_24h',
            class: 'red-color',
        },
        {
            label: t('detail.label2'),
            key: 'high_price_24h',
            class: 'red-color',
        },
        {
            label: t('detail.label3'),
            key: 'volume',
        },
        // {
        //     label: t('detail.label4'),
        //     key: 'trade_volume',
        // },
    ]
})

// 1买 2卖
const toOpe = type => {
    const path = isSpots.value ? '/SpotOpe' : '/ContractOpe'
    router.push({
        path,
        query: {
            type: type,
            symbolId: symbolId.value,
        },
    })
}
const columns = computed(() => {
    return [
        {
            width: 33,
            align: 'left',
            label: `${t('detail.th.th1')}(${usdcToUsd(quoteAsset.value)})`,
            value: 'price',
            isNum: true,
        },
        {
            width: 33,
            label: `${t('detail.th.th2')}(${baseAsset.value})`,
            value: 'price',
            isNum: true,
            align: 'right',
        },
        {
            width: 33,
            label: t('detail.th.th3'),
            value: 'price_change_percent',
            align: 'right',
        },
    ]
})
const recordMap = ref({})
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
const collect = () => {
    showLoadingToast()
    // spot 现货/ futures 合约
    addCollectApi({
        symbol_id: symbolId.value,
        symbol_type: isSpots.value ? 'spot' : 'futures',
    }).then(() => {
        showSuccessToast(t('common.opeSuccess'))
        isCollection.value = !isCollection.value
    })
}
const activeTab = ref(0)

// 返回上一页
const handleBack = () => {
    const backParams = {
        symbolId: symbolId.value || null,
    }
    const path = isSpots.value ? '/SpotOpe' : '/ContractOpe'
    router.push({
        path, // 假设上一页是交易列表页
        query: backParams
    })
}
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        left-arrow
        @click-left="handleBack"
        fixed
        placeholder
    >
        <template #title>
            <div class="flex items-center" @click="showLeft = true">
                <p class="b-title" style="margin-right: 5px;">{{ usdcToUsd(activeB) }}</p>
                <!-- <img src="../../assets/img/arrow-down.svg" class="arrow-down" alt="" /> -->
				<svg class="lang-icon" width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path id="Polygon 5" d="M3.37814 6.23756C3.7876 6.7369 4.55151 6.7369 4.96098 6.23756L8.14411 2.35578C8.60063 1.79906 8.20456 0.962061 7.48459 0.962061L0.854525 0.962061C0.134554 0.96206 -0.261519 1.79906 0.195007 2.35578L3.37814 6.23756Z" fill="currentColor"/>
				</svg>
            </div>
        </template>
        <template #right>
            <img
                src="./img/collect.svg"
                v-if="!isCollection"
                @click="collect"
                class="w-5 h-5"
                alt=""
            />
            <img src="./img/collect-active.svg" @click="collect" v-else class="w-5 h-5" alt="" />
        </template>
    </van-nav-bar>
    <div class="p-4 flex-auto overflow-auto flex flex-col">
        <div class="flex mb-6">
            <div class="left-box" :class="{ 'green-color': detailInfo.change > 0 }">
                <div
                    class="price"
                    :class="[detailInfo.price_latest_change >= 0 ? 'green-color' : 'red-color']"
                >
                    {{ friendlyNumber(detailInfo.price) || '-' }}
                </div>
                <div
                    class="left-tip"
                    :class="[detailInfo.price_change_percent >= 0 ? 'green-color' : 'red-color']"
                >
                    {{ friendlyNumber(detailInfo.price_change, false, true) || '-' }}
                </div>
                <div
                    class="left-tip"
                    :class="[detailInfo.price_change_percent >= 0 ? 'green-color' : 'red-color']"
                >
                    {{ friendlyNumber(detailInfo.price_change_percent, false, true) || '-' }}%
                </div>
            </div>
            <div class="right-box">
                <div class="right-li" v-for="item in rightList" :key="item.key">
                    <div class="right-label">{{ item.label }}</div>
                    <div class="right-value" v-if="item.key">
                        {{ friendlyNumber(detailInfo[item.key]) || '-' }}
                    </div>
                </div>
            </div>
        </div>
        <Chart
            v-if="setSub"
            :setSub="setSub"
            :unsubscribeChannel="unsubscribeChannel"
            :symbol="symbol"
            :symbolId="symbolId"
            :isSpots="isSpots"
        ></Chart>
        <div class="price-ul mt-6" v-if="activeTab === 0">
            <div class="flex-auto w-1/3">
                <div class="info-box">
                    <span class="info-title">{{ $t('detail.top2') }}({{ baseAsset }})</span>
                </div>
                <div class="info-box" v-for="(item, index) in buyList" :key="index">
                    <span class="c-is-num">{{ friendlyNumber(item[1]) }}</span>
                    <span class="green-color">{{ friendlyNumber(item[0]) }}</span>
                </div>
            </div>
            <div class="ml-3 flex-auto w-1/3">
                <div class="info-box">
                    <span class="info-title spec-title"
                        >{{ $t('detail.top1') }}({{ usdcToUsd(quoteAsset) }})</span
                    >
                    <span class="info-title">{{ $t('detail.top2') }}({{ baseAsset }})</span>
                </div>
                <div class="info-box" v-for="(item, index) in sellList" :key="index">
                    <span class="red-color">{{ friendlyNumber(item[0]) }}</span>
                    <span class="c-is-num">{{ friendlyNumber(item[1]) }}</span>
                </div>
            </div>
        </div>
        <MyTable :dataList="buyList" :columns="columns" isSmall v-if="activeTab === 1">
            <template #default="{ data, th }">
                <div v-if="th.value === 'price'">
                    {{ getData(data, 'price') }}
                </div>
                <div
                    v-else-if="th.value === 'high_price_24h'"
                    :class="[data.price_change_percent > 0 ? 'green-color' : 'red-color ']"
                >
                    {{ getData(data, 'high_price_24h') }}
                </div>
                <div
                    class="is-num"
                    v-else-if="th.value === 'price_change_percent'"
                    :class="[data.price_change_percent > 0 ? 'green-color' : 'red-color ']"
                >
                    {{ getData(data, 'price_change_percent', true) }}%
                </div>
            </template>
        </MyTable>
        <div class=" flex">
            <MyButton class="flex-auto" type="green" @click="toOpe(1)">{{
                $t('detail.buy')
            }}</MyButton>
            <MyButton class="flex-auto ml-3" type="danger" @click="toOpe(2)">{{
                $t('detail.sell')
            }}</MyButton>
        </div>
    </div>
    <SelectB
        v-model="showLeft"
        :setSub="setSub"
        :isSpots="isSpots"
        @selectHandle="selectHandle"
    ></SelectB>
</template>

<style scoped lang="scss">
	.lang-icon {
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.left-box {
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #e34646;
    flex: auto;
    .price {
        font-family: DIN;
        font-weight: 500;
        font-size: 28px;
        color: #00b481;
        line-height: 41px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        word-wrap: break-word;
    }
    .left-tip {
        font-family: DIN;
        font-weight: 500;
        font-size: 15px;
        color: #8b939a;
        line-height: 18px;
        text-align: left;
        margin-top: 10px;
    }
}
.right-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 50%;
    flex: auto;
    overflow: auto;
    margin-left: 24px;
    margin-top: -10px;
    .right-li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: auto;
        margin-top: 10px;
        .right-label {
            color: #8b939a;
            font-size: 11px;
        }
        .right-value {
            // color: #fff;
			color: var(--text-color);
            text-align: right;
            font-family: DIN;
            font-size: 11px;
            font-style: normal;
            font-weight: 500;
            line-height: normal;
            margin-left: 10px;
        }
    }
}

.price-ul {
    display: flex;
    justify-content: space-between;
    padding-bottom: 16px;
    .info-box {
        // color: #fff;
		color: var(--text-color);
        font-family: DIN;
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: 14px; /* 14.4px */
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        &:first-child {
            margin-top: 0;
        }
        .info-title {
            font-family: PingFang SC;
            font-weight: 400;
            font-size: 13px;
            color: #8b939a;
            line-height: 15px;
            margin-bottom: 6px;
        }
    }
}
.footer-css {
    background-color: #1e252f;
    padding: 16px 0;
    flex-shrink: 0;
}
:deep(.van-stepper) {
    display: flex;
    margin-bottom: 12px;
    input {
        flex: auto;
        background: #1c252b;
        // color: #fff;
		color: var(--text-color);
    }
    button {
        background-color: #495b67;
        // color: #fff;
		color: var(--text-color);
    }
}
.form-tip {
    color: #a1a1a1;
    font-family: 'PingFang SC';
    font-size: 11px;
    font-style: normal;

    line-height: normal;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    max-width: 100%;
}
.b-title {
    font-size: 16px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 19px;
    text-align: center;
    font-style: normal;
    text-transform: none;
    font-weight: bold;
}
.arrow-down {
    width: 12px;
    height: 12px;
    margin-left: 14px;
    margin-right: auto;
}
.spec-title {
    margin-left: -40px;
}
</style>
