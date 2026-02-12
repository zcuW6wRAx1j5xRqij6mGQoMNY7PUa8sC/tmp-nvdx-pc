<script lang="ts" setup>
import { friendlyNumber, usdcToUsd } from '@/utils/utils'
import { computed, nextTick, ref, watch } from 'vue'
const props = defineProps<{
    nowData: Object
    name: string
    symbol: string
    setSub: Function
    unsubscribeChannel: Function
    isSpots: Boolean,
    showLength: Number
}>()
// 买卖数据
const buyList = ref([])
const sellList = ref([])
function setListData(ctx) {
    const data = ctx.data
    buyList.value = data.bids || []
    sellList.value = data.asks || []
}
// 保存当前订阅的回调函数引用，用于取消订阅
const currentCallbackRef = ref(null)
nextTick(() => {})
watch(
    () => props.symbol,
    (newVal, oldVal) => {
        if (props.setSub) {
            // 取消旧订阅时传入回调函数引用
            if (oldVal && currentCallbackRef.value) {
                props.unsubscribeChannel(`public:book_${oldVal}`, currentCallbackRef.value)
                currentCallbackRef.value = null
            }
            // 订阅新频道并保存回调函数引用
            if (newVal) {
                currentCallbackRef.value = setListData
                props.setSub(`public:book_${newVal}`, setListData)
            }
        }
    },
    { immediate: true },
)
// 基础币
const baseAsset = computed(() => {
    const nameList = props.name?.split('/') || []
    return nameList[0]?.toUpperCase()
})
// 计价币
const quoteAsset = computed(() => {
    const nameList = props.name?.split('/') || []
    return nameList[1]?.toUpperCase()
})
const showList = computed(() => {
    return props.showLength ? props.showLength : 10
})
const buyListShow = computed(() => {
    return buyList.value.slice(0, showList.value)
})
const sellListShow = computed(() => {
    return sellList.value.slice(0, showList.value)
})
</script>
<!--  -->
<template>
    <div class="price-ul">
        <div class="flex-auto">
            <div class="info-box">
                <span class="info-title">{{ $t('detail.top1') }}({{ usdcToUsd(quoteAsset) }})</span>
                <span class="info-title"> | </span>
                <span class="info-title">{{ $t('detail.top2') }}({{ baseAsset }})</span>
            </div>
            <div class="info-box" v-for="(item, index) in buyListShow" :key="index">
                <span class="green-color">{{ friendlyNumber(item[0]) }}</span>
                <span class="c-is-num">{{ friendlyNumber(item[1]) }}</span>
            </div>
            <div
                class="now-price"
                :class="{ 'red-color': friendlyNumber(+nowData.price_latest_change) < 0 }"
            >
                {{ friendlyNumber(nowData.price) || 0 }}
            </div>
            <div class="info-box" v-for="(item, index) in sellListShow" :key="index">
                <span class="red-color">{{ friendlyNumber(item[0]) }}</span>
                <span class="c-is-num">{{ friendlyNumber(item[1]) }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.price-ul {
    display: flex;
    justify-content: space-between;
    flex: auto;
    min-width: 150px;
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
.now-price {
    margin-top: 10px;
    font-family: DIN;
    font-weight: 500;
    font-size: 20px;
    color: #00b481;
    line-height: 23px;
    flex-shrink: 0;
}
</style>
