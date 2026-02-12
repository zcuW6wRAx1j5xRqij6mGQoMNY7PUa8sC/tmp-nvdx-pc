<script setup>
import { useI18n } from 'vue-i18n'
import {
    getContractOrderApi,
    cancelContractOrderApi,
    closeContractOrderApi,
    updateMarginApi,
    updateStopProfitApi,
} from '@/api/data'
import useList from '@/hooks/useList'
import { friendlyNumber, multiply, divide, subtract, add, setBaseUrl, formatNumber, percentage, usdcToUsd } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { showSuccessToast, showLoadingToast } from 'vant'
import dayjs from 'dayjs'
import { onMounted, onUnmounted } from 'vue'
const props = defineProps({
    isRefresh: {
        type: Boolean,
        default: false,
    },
    spotId: {
        type: [Number, String],
        default: '',
    },
    contractBalance: {
        type: Number,
        default: 0,
    },
    recordMap: {
        type: Object,
        default: () => {
            return {}
        },
    },
    setSub: {
        type: Function,
        default: () => { },
    },
})
function getData (row, prop, needSymbol = false) {
    let data = props.recordMap[row.symbol] || {}
    row[prop] = +data[prop] || 0
    const show = friendlyNumber(+data[prop]) || 0
    if (needSymbol) {
        if (formatNumber(show) > 0) {
            return `+${show}`
        }
    }
    return show
}
watch(
    () => props.isRefresh,
    () => {
        resetData()
    },
)
watch(
    () => props.spotId,
    () => {
        checked.value = false
        resetData()
    },
)
const orderMap = ref({})
function socketHandle (data) {
    let eventName = data.data?.event
    if (eventName === 'refresh') {
        resetData()
    }
    if (eventName === 'order_margin_ratio') {
        let socketData = data.data.payload || {}
        orderMap.value[socketData.order_id] = socketData
    }
}
// 设置轮询
const setupPolling = () => {
    // 清除之前的定时器
    if (pollingTimer) {
        clearInterval(pollingTimer)
        pollingTimer = null
    }
    
    // 只有在 activeTab.value === 1 时才启动轮询
    // if (activeTab.value === 1) {
    //     pollingTimer = setInterval(() => {
    //         resetData()
    //     }, 5000) // 每5秒刷新一次数据
    // }
}

// 清除轮询
const clearPolling = () => {
    if (pollingTimer) {
        clearInterval(pollingTimer)
        pollingTimer = null
    }
}

onMounted(() => {
    props.setSub(
        `person:${localStorage.getItem('uid')}`,
        socketHandle,
        localStorage.getItem('ws_channel_token'),
    )
    // 初始化时设置轮询
    setupPolling()
})

// onUnmounted(() => {
//     // 组件销毁时清除定时器
//     clearPolling()
// })
const { t } = useI18n()
const router = useRouter()
// 类型
const searchList = computed(() => {
    return [
        {
            name: t('contractOpe.tab.tab1'),
            id: 0,
        },
        {
            name: t('contractOpe.tab.tab2'),
            id: 1,
        },
    ]
})
const activeTab = ref(0)
// 轮询定时器
let pollingTimer = null

const searchChange = id => {
    activeTab.value = id
    resetData()
    // 切换tab时重新设置轮询
    setupPolling()
}
const checked = ref(false)
const { showList, loading, finished, onLoad, initData } = useList(getContractOrderApi, {
    status: 'pending',
    isNoPage: true,
})
const showInfoList = computed(() => {
    if (activeTab.value === 0) {
        return [
            {
                key: 'price',
                name: t('contractOpe.info.amount'),
                cb: data => {
                    return friendlyNumber(data.price)
                },
            },
            {
                key: 'match_price',
                name: t('contractOpe.info.exchangeAmount'),
                cb: data => {
                    return friendlyNumber(data.match_price)
                },
            },
            {
                key: 'volume',
                nameCb: data => {
                    return `${t('contractOpe.info.status')}(${data.name.split('/')[0]})`
                },
                cb: data => {
                    return friendlyNumber(data.volume)
                },
            },
            {
                name: t('contractOpe.info.label4'),
                key: 'volume',
                cb: data => {
                    return friendlyNumber(data.trade_volume)
                },
            },
        ]
    } else if (activeTab.value === 1) {
        return [
            {
                key: 'volume',
                nameCb: data => {
                    return `${t('contractOpe.info2.label1')}(${data.name.split('/')[0]})`
                },
                cb: data => {
                    return friendlyNumber(data.volume)
                },
            },
            {
                key: 'margin_type',
                nameCb: data => {
                    return `${t('contractOpe.info2.label2')}(${usdcToUsd(data.name.split('/')[1])})${data.margin_type === 'isolated'
                            ? '<img src="/add.svg" class="w-4 h-4 ml-2" alt="" />'
                            : ''
                        }`
                },
                cb: data => {
                    return friendlyNumber(data.margin)
                },
            },
            {
                key: 'profit_ratio',
                name: t('contractOpe.info2.label3'),
                cb: data => {
                    return `${data.margin_type !== 'crossed' ? friendlyNumber(data.margin_ratio) : percentage(orderMap.value[data.id]?.margin_ratio || data.margin_ratio, false)}%`
                },
            },
            {
                key: 'open_price',
                name: t('contractOpe.info2.label4'),
                cb: data => {
                    return friendlyNumber(data.open_fee)
                },
            },
            {
                key: 'open_price',
                name: t('contractOpe.info2.label5'),
                cb: data => {
                    return friendlyNumber(data.open_price)
                },
            },
            {
                key: 'force_close_price',
                name: t('contractOpe.info2.label6'),
                cb: data => {
                    return data.margin_type !== 'crossed'
                        ? friendlyNumber(data.force_close_price)
                        : orderMap.value[data.id]?.force_price ||
                        friendlyNumber(data.force_close_price)
                },
            },
        ]
    }
})
// onMounted(onLoad)
const toPage = (path, query) => {
    router.push({ path, query })
}
const toOpe = (item, dataInfo) => {
    if (dataInfo.margin_type === 'isolated' && item.key === 'margin_type') {
        showItem.value = dataInfo
        bondValue.value = 0
        bondHeight.value = bondAnchors[1]
    }
}
const changeCheck = val => {
    checked.value = val
    resetData()
}
function resetData () {
    initData({
        futures_id: checked.value ? props.spotId : undefined,
        status: activeTab.value === 0 ? 'pending' : 'open',
        hideLoading: true
    })
}
const emit = defineEmits(['cancel'])
// 取消
const cancelHandle = data => {
    showLoadingToast({})
    cancelContractOrderApi({ order_id: data.id }).then(() => {
        resetData()
        showSuccessToast(t('common.opeSuccess'))
        emit('cancel')
    })
}
const closeHandle = data => {
    showLoadingToast({})
    closeContractOrderApi({ order_id: data.id }).then(() => {
        resetData()
        showSuccessToast(t('contractOpe.closeSuccess'))
        emit('cancel')
    })
}
const showItem = ref({})
// 调整保证金
const bondValue = ref(0)
const bondAnchors = [0, Math.round(0.7 * window.innerHeight)]
const bondHeight = ref(bondAnchors[0])
const bondList = computed(() => [
    {
        name: t('contractOpe.bond.tab.tab1'),
        id: 1,
    },
    {
        name: t('contractOpe.bond.tab.tab2'),
        id: 2,
    },
])
const bondActiveTab = ref(1)
const bondChange = id => {
    bondActiveTab.value = id 
}
const bondChangeHandle = () => {
    showLoadingToast({})
    const value = bondActiveTab.value === 1 ? bondValue.value : -bondValue.value
    updateMarginApi({
        order_id: showItem.value.id,
        amount: value,
    }).then(() => {
        bondHeight.value = 0
        resetData()
        showSuccessToast(t('common.opeSuccess'))
        emit('cancel')
    })
}
// 保证金调整后
const afterMargin = computed(() => {
    const value = bondActiveTab.value === 1 ? bondValue.value : -bondValue.value
    return friendlyNumber(add(+showItem.value.margin, +value))
})
// 调整后强平价格
const afterClosePrice = computed(() => {
    // 买: open_price * (1 - margin / (open_price * volume))
    // 卖 open_price * (1+ margin / (open_price * volume))
    if (showItem.value.side === 'buy') {
        return friendlyNumber(
            multiply(
                showItem.value.open_price,
                subtract(
                    1,
                    divide(
                        afterMargin.value,
                        multiply(showItem.value.open_price, showItem.value.volume),
                    ),
                ),
            ),
        )
    } else {
        return friendlyNumber(
            multiply(
                showItem.value.open_price,
                add(
                    1,
                    divide(
                        afterMargin.value,
                        multiply(showItem.value.open_price, showItem.value.volume),
                    ),
                ),
            ),
        )
    }
})
const profitShow = ref(false)
// 止盈止损
const showProfit = data => {
    showItem.value = data
    checkFrom.value.sl = friendlyNumber(data.sl)
    checkFrom.value.tp = friendlyNumber(data.tp)
    profitShow.value = true
}
const checkFrom = ref({
    sl: '',
    tp: '',
})
const profitChangeHandle = () => {
    showLoadingToast({})
    updateStopProfitApi({
        order_id: showItem.value.id,
        sl: checkFrom.value.sl,
        tp: checkFrom.value.tp,
    }).then(() => {
        profitShow.value = false
        resetData()
        showSuccessToast(t('common.opeSuccess'))
        emit('cancel')
    })
}
const setHandle = item => {
    // 比例 = (盈亏 / 保证金(margin) ) * 100%
    return formatNumber(
        multiply(
            (divide(setProfit(item), item.margin)),
            100
        )
    )
}

const adjustColor = item => {
    const res = setProfit(item)
    if (typeof res === 'number') {
        return res < 0 ? 'red-color' : 'green-color'
    }
    if (typeof res === 'string') {
        if (res.startsWith('-')) {
            return 'red-color'
        } else {
            return 'green-color'
        }
    }
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
</script>
<!--  -->
<template>
    <div class="flex-shrink-0 p-4 pt-1">
        <div class="mb-4 flex items-center justify-between">
            <MyTab :tabList="searchList" :tabActive="activeTab" @tabChange="searchChange" class="flex-auto" isFew
                isShrink></MyTab>
            <!-- <img src="../img/right.svg" class="w-6 h-6" alt="" @click="toPage('/ContractOrder')" /> -->
			<svg class="lang-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" @click="toPage('/ContractOrder')">
			<g id="&#231;&#148;&#179;&#232;&#180;&#173;&#232;&#174;&#176;&#229;&#189;&#149;">
			<path id="Vector" d="M4.48096 20.6255L4.47344 4.4668H6.9873V5.29389C6.9873 6.21957 7.73503 6.97314 8.65486 6.97314H15.3451C15.7888 6.97115 16.2136 6.79322 16.5262 6.4784C16.8388 6.16357 17.0138 5.73757 17.0127 5.29389V4.4668L19.519 4.46011L19.5257 20.6188L4.48096 20.6255ZM15.3418 3.6397L15.3451 5.30225L8.6582 5.29389V3.6397L8.65486 3.63135L15.3418 3.6397ZM19.5149 2.7959H16.7788C16.4897 2.29881 15.9584 1.96045 15.3451 1.96045H8.65486C8.04164 1.96045 7.51113 2.29797 7.22123 2.7959H4.47344C4.03227 2.79634 3.60932 2.97185 3.29744 3.28388C2.98557 3.5959 2.81028 4.01895 2.81006 4.46011V20.6255C2.81006 21.5428 3.55695 22.2897 4.47427 22.2897H19.5257C19.9669 22.289 20.3898 22.1135 20.7018 21.8015C21.0137 21.4896 21.1893 21.0667 21.1899 20.6255V4.46011C21.1882 4.0174 21.0108 3.59348 20.6967 3.28145C20.3826 2.96942 19.9576 2.79479 19.5149 2.7959Z" fill="currentColor"/>
			<path id="Vector_2" d="M14.7955 10.5734L10.8338 14.9044L9.21214 13.0873C9.06458 12.922 8.85739 12.8221 8.63616 12.8095C8.41493 12.797 8.19778 12.8729 8.03249 13.0204C7.8672 13.168 7.76729 13.3752 7.75476 13.5964C7.74222 13.8176 7.81808 14.0348 7.96565 14.2001L10.203 16.7064C10.2808 16.7936 10.376 16.8634 10.4825 16.9115C10.589 16.9596 10.7044 16.9848 10.8212 16.9855H10.8262C11.0602 16.9855 11.2841 16.8869 11.4428 16.7139L16.0286 11.7012C16.1781 11.5377 16.2566 11.3215 16.2467 11.1001C16.2369 10.8787 16.1395 10.6703 15.9759 10.5208C15.8124 10.3712 15.5962 10.2927 15.3748 10.3026C15.1534 10.3125 14.945 10.4099 14.7955 10.5734Z" fill="currentColor"/>
			</g>
			</svg>
        </div>
        <div class="flex justify-between items-center mb-4 mt-6">
            <van-checkbox v-model="checked" checked-color="#1EB576" @change="changeCheck">
                <template #icon="props">
                    <img class="w-4 h-4" v-if="props.checked" src="../img/check.svg" />
                    <img class="w-4 h-4" v-if="!props.checked" src="../img/check-no.svg" />
                </template>
                {{ $t('contractOpe.hidden') }}
            </van-checkbox>
            <!-- <div class="all-cancel">{{ $t('contractOpe.allCancel') }}</div> -->
        </div>
        <NoData v-if="!showList.length" style="padding: 0"></NoData>
        <van-list v-else v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')"
            @load="onLoad" class="overflow-auto">
            <template v-if="activeTab === 0">
                <MyShowInfo v-for="item in showList" :key="item.id" :title="usdcToUsd(item.name)" :infoList="showInfoList"
                    :dataInfo="item">
                    <template #left>
                        <img v-if="item.logo" :src="setBaseUrl(item.logo)" class="b-img" alt="" />
                    </template>
                    <div class="flex mt-3">
                        <div class="c-order-tip-box" :class="[item.side === 'buy' ? 'green' : 'red']">
                            {{
                                item.side === 'buy'
                                    ? $t('contractOpe.btn.btn1')
                                    : $t('contractOpe.btn.btn2')
                            }}
                        </div>
                        <div class="c-order-tip-box">
                            {{ dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss') }}
                        </div>
                    </div>
                    <template #right>
                        <div class="cancel" @click="cancelHandle(item)">
                            {{ $t('contractOpe.cancel') }}
                        </div>
                    </template>
                </MyShowInfo>
            </template>
            <template v-else-if="activeTab === 1">
                <MyShowInfo v-for="item in showList" :key="item.id" :title="usdcToUsd(item.name)" :infoList="showInfoList"
                    :dataInfo="item" @liClick="toOpe" isInline>
                    <template #left>
                        <img v-if="item.logo" :src="setBaseUrl(item.logo)" class="b-img" alt="" />
                    </template>
                    <div class="flex mt-3 overflow-auto">
                        <div class="c-order-tip-box" :class="[item.side === 'buy' ? 'green' : 'red']">
                            {{
                                item.side === 'buy'
                                    ? $t('contractOpe.btn.btn1')
                                    : $t('contractOpe.btn.btn2')
                            }}
                        </div>
                        <div class="c-order-tip-box" :class="[item.margin_type === 'crossed' ? 'red' : 'green']">
                            {{
                                item.margin_type === 'crossed'
                                    ? $t('contractOpe.level.tab.tab1')
                                    : $t('contractOpe.level.tab.tab2')
                            }}
                            {{ item.leverage }}x
                        </div>
                        <div class="c-order-tip-box">
                            {{ dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss') }}
                        </div>
                        <div class="c-order-tip-box" v-if=item.lots>
                           {{ $t('unit.lots') }} {{ item.lots }}
                        </div>
                    </div>
                    <div class="flex justify-between mt-3">
                        <div>
                            <div class="c-label">{{ $t('contractOpe.info2.tip1') }}</div>
                            <div class="c-value text-xs mt-2 text-left"
                                :class="adjustColor(item)">
                                {{ setProfit(item) }}
                            </div>
                        </div>
                        <div>
                            <div class="c-label text-right" style="margin-right: 0">
                                {{ $t('contractOpe.info2.tip2') }}
                            </div>

                            <div class="c-value text-xs mt-2"
                                :class="adjustColor(item)">
                                {{ percentage(setHandle(item), false) }}%
                            </div>
                        </div>
                    </div>
                    <template #ope>
                        <div class="flex justify-between mt-4">
                            <MyButton type="black" size="mini" class="w-full" @click="showProfit(item)">{{
                                $t('contractOpe.info2.btn1') }}</MyButton>
                            <MyButton type="black" class="ml-4 w-full" size="mini" :clickFn="() => closeHandle(item)">{{
                                $t('contractOpe.info2.btn2') }}</MyButton>
                        </div>
                    </template>
                </MyShowInfo>
            </template>
        </van-list>
        <!-- 保证金调整 -->
        <van-overlay :show="bondHeight > 0">
            <van-floating-panel v-model:height="bondHeight" :anchors="bondAnchors">
                <div class="p-4 pb-8 h-full flex flex-col">
                    <div class="c-normal-title">{{ $t('contractOpe.bond.title') }}</div>
                    <div class="level-select mb-5">
                        <div class="level-item" v-for="item in bondList" :key="item.id"
                            :class="{ active: bondActiveTab === item.id }" @click="bondChange(item.id)">
                            {{ item.name }}
                        </div>
                    </div>
                    <MyInput v-model="bondValue" :errorObj="errorObj" propName="sl" isSmall >
                        <template #right>
                            USD
                            <span class="all-btn" @click="bondValue = contractBalance">{{
                                $t('contractOpe.bond.all')
                                }}</span></template>
                    </MyInput>
                    <div class="flex items-center justify-between">
                        <div class="bond-label">{{ $t('contractOpe.bond.label1') }}</div>
                        <div class="bond-value">{{ contractBalance }}USD</div>
                    </div>
                    <div class="flex justify-between">
                        <div class="bond-box">
                            <div class="bond-label">{{ showItem.name }}</div>
                            <div class="bond-label">{{ $t('contractOpe.bond.info.label3') }}</div>
                            <div class="bond-label">{{ $t('contractOpe.bond.info.label4') }}</div>
                        </div>
                        <div class="bond-box text-center">
                            <div class="bond-label">{{ $t('contractOpe.bond.info.label1') }}</div>
                            <div class="bond-value">{{ showItem.margin }}</div>
                            <div class="bond-value" :class="[bondActiveTab === 0 ? 'green-color' : 'red-color ']">
                                {{ afterMargin }}
                            </div>
                        </div>
                        <div class="bond-box text-right">
                            <div class="bond-label">{{ $t('contractOpe.bond.info.label2') }}</div>
                            <div class="bond-value">
                                {{ showItem.force_close_price }}
                            </div>
                            <div class="bond-value" :class="[bondActiveTab === 0 ? 'green-color' : 'red-color ']">
                                {{ afterClosePrice }}
                            </div>
                        </div>
                    </div>
                    <MyButton size="large" class="mt-4" :disabled="!bondValue" :clickFn="bondChangeHandle">{{
                        $t('contractOpe.bond.btn1') }}</MyButton>
                </div>
            </van-floating-panel>
        </van-overlay>
        <!-- 止盈止损 -->
        <van-popup v-model:show="profitShow" closeable position="bottom" :style="{ minHeight: '50%' }">
            <div class="p-4 pb-8 h-full flex flex-col">
                <div class="c-normal-title">{{ $t('contractOpe.profit.title') }}</div>
                <MyInput v-model="checkFrom.tp" :placeholder="$t('contractOpe.check.label1')" :errorObj="errorObj"
                    propName="tp" isSmall >
                </MyInput>
                <MyInput v-model="checkFrom.sl" :placeholder="$t('contractOpe.check.label2')" :errorObj="errorObj"
                    propName="sl" isSmall  isLast />
                <MyButton size="large" class="mt-4" :disabled="!checkFrom.tp || !checkFrom.sl"
                    :clickFn="profitChangeHandle">{{
                        $t('contractOpe.profit.btn1') }}</MyButton>
            </div>
        </van-popup>
    </div>
</template>

<style scoped lang="scss">
	.lang-icon {
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.all-cancel {
    font-weight: 400;
    font-size: 15px;
    color: #1EB576;
    line-height: 18px;
    text-align: right;
}

.cancel {
    margin-left: auto;
    background: #ffe63c;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 4px 13px;
    font-weight: 500;
    font-size: 12px;
    color: #2D2D2D;
    line-height: 14px;
    text-align: center;
    font-style: normal;
    text-transform: none;
}

.b-title {
    width: 100%;
    display: flex;
    align-items: center;
    // color: #fff;
	color: var(--text-color);
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
}

.b-value {
    font-family: DIN;
    font-weight: 500;
    font-size: 15px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 18px;
    margin-left: auto;
}

:deep(.van-tab) {
    margin-right: 32px !important;
}

.all-btn {
    font-weight: 400;
    font-size: 15px;
    color: #00b481;
    line-height: 18px;
    margin-left: 12px;
}

.bond-label {
    font-family: PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: #8b939a;
    line-height: 24px;
}

.bond-value {
    font-family: PingFang SC;
    font-weight: 400;
    font-size: 14px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 24px;
    word-break: break-all;
}

.bond-box {
    width: 30%;
    flex: auto;

    .bond-label,
    .bond-value {
        margin-top: 14px;
    }
}

.level-select {
    display: flex;
    justify-content: space-between;

    .level-item {
        font-family: DIN;
        min-width: 60px;
        padding: 15px;
        font-size: 18px;
        // color: #ffffff;
		color: var(--text-color);
        line-height: 18px;
        text-align: center;
        margin-right: 16px;
        background: rgba(139, 147, 154, 0.3);
        flex: auto;
        border-radius: 8px;

        &:last-child {
            margin-right: 0;
        }

        &.active {
            background: #1EB576;
        }
    }
}
:deep(.van-popup){
    // background-color: #0E0E0E;
	background-color: var(--surface-bg);
    padding-bottom: 60px;
}
:deep(.show-label){
    min-width: auto !important;
}
</style>
