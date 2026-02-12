<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { friendlyNumber, setBaseUrl, formatNumber, usdcToUsd } from '@/utils/utils'
import SelectB from './SelectB.vue'

const { t } = useI18n()
interface info {
    symbol: string
    symbolId: number
    name: string
    bLogo: string
}
const props = withDefaults(
    defineProps<{
        isSpots: boolean
        defaultValue: info
        setSub: Function,
        notData: boolean
        websocketData: any
    }>(),
    {
        isSpots: false,
        notData: false,
        websocketData: {},
    },
)

const proportion = ref(1)
const emit = defineEmits(['bChange', 'dataChange'])
// 切换币
const symbolId = ref()
const activeB = ref()
const asset = ref()
const symbol = ref()
const currentData = ref({})
watchEffect(() => {
    if (props.defaultValue && props.defaultValue.symbolId) {
        // const assetName = props.defaultValue?.quote_asset || ''
        activeB.value = props.defaultValue.name
        // asset.value = assetName.toUpperCase()
        symbolId.value = +props.defaultValue.symbolId
        symbol.value = props.defaultValue.symbol
    }
})

const showLeft = ref(false)
const selectHandle = item => {
    console.log('item', item)
    if (item?.id === symbolId.value) {
        showLeft.value = false
        return
    }
    activeB.value = item?.name
    asset.value = item?.quote_asset.toUpperCase()
    symbol.value = item?.symbol
    symbolId.value = item?.id
    emit('bChange', item)
    showLeft.value = false
}
const changeVal = ref()

const updateChange = (val) => {
    if (val.symbol === symbol.value) {
        currentData.value = val
        changeVal.value = friendlyNumber(+val.price_change_percent)
    }
}

const dataChange = (val, recordMap) => {
    updateChange(val)
    emit('dataChange', val, recordMap)
}

// 直接处理WebSocket数据更新
watchEffect(() => {
    // 当symbol变化时，确保currentData是最新的
    if (symbol.value && currentData.value && currentData.value.symbol !== symbol.value) {
        currentData.value = {};
        changeVal.value = undefined;
    }
});

// 监听父组件传递的WebSocket数据
watch(() => props.websocketData, (newData) => {
    if (newData && newData.symbol === symbol.value) {
        updateChange(newData);
    }
}, { deep: true });

const USPrice = computed(() => {
    return friendlyNumber(formatNumber(+currentData.value?.price || 0) * proportion.value)
})

const volumeData = computed(() => {
    return [
        {   //24小时交易额
            name: t('spotOpe.24h Volume'),
            key: 'volume',
            cb: (data) => {
                return friendlyNumber(friendlyNumber(+data?.volume || 0))
            }
        },
        {  //24小时交易量
            name: t('spotOpe.24h Trade Volume'),
            key: 'trade_volume',
            cb: (data) => {
                return friendlyNumber(friendlyNumber(+data?.trade_volume || 0))
            }
        },
    ]
})

defineExpose({
    updateChange
})
</script>
<!--  -->
<template>
    <div class="flex justify-between w-[100%]" v-if="!notData">
        <div class="data-left">
            <div class="flex items-center" @click="showLeft = true">
                <img v-if="defaultValue.bLogo" :src="setBaseUrl(defaultValue.bLogo)" class="b-img" alt="" />
                <div class="b-title">
                    {{ usdcToUsd(activeB) }}
                    <div class="change_percent">{{ asset }}</div>
                </div>
				<svg style="margin-left: 5px;" class="lang-icon" width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path id="Polygon 5" d="M3.37814 6.23756C3.7876 6.7369 4.55151 6.7369 4.96098 6.23756L8.14411 2.35578C8.60063 1.79906 8.20456 0.962061 7.48459 0.962061L0.854525 0.962061C0.134554 0.96206 -0.261519 1.79906 0.195007 2.35578L3.37814 6.23756Z" fill="currentColor"/>
				</svg>
                <!-- <img src="../../../assets/img/arrow-down.svg" class="arrow-down" alt="" /> -->
            </div>
            <div class="qua-price">US$ {{ USPrice }}</div>
            <div class="change-price" :class="[formatNumber(changeVal) > 0 ? 'green-color' : 'red-color']">
                {{ formatNumber(currentData?.price || 0) }} （{{ formatNumber(changeVal) > 0 ? '+' : '' }}{{ changeVal
                }}%）
            </div>
        </div>

        <div class="data-right volume-list flex flex-col">
            <div class="volume-item" v-for="(item, index) in volumeData" :key="index">
                <div class="volume-name">{{ item.name }}</div>
                <div class="volume-num">{{ item.cb(currentData) }}</div>
            </div>
        </div>
    </div>

    <div class="flex items-center mb-4" @click="showLeft = true" v-if="notData">
        <img v-if="defaultValue.bLogo" :src="setBaseUrl(defaultValue.bLogo)" class="b-img" alt="" />
        <div class="b-title">
            {{ usdcToUsd(activeB) }}
            <div class="change-price" :class="[formatNumber(changeVal) > 0 ? 'green-color' : 'red-color']">
                {{ formatNumber(changeVal) > 0 ? '+' : '' }}{{ changeVal }}%
            </div>
        </div>
        <!-- <img src="../../../assets/img/arrow-down.svg" class="arrow-down" alt="" /> -->
		<svg style="margin-left: 5px;" class="lang-icon" width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path id="Polygon 5" d="M3.37814 6.23756C3.7876 6.7369 4.55151 6.7369 4.96098 6.23756L8.14411 2.35578C8.60063 1.79906 8.20456 0.962061 7.48459 0.962061L0.854525 0.962061C0.134554 0.96206 -0.261519 1.79906 0.195007 2.35578L3.37814 6.23756Z" fill="currentColor"/>
		</svg>
    </div>
    <SelectB v-model="showLeft" :isSpots="isSpots" :isOptions="!notData" :setSub="setSub" @selectHandle="selectHandle"
        @dataChange="dataChange"></SelectB>
</template>

<style scoped>
	.lang-icon {
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.arrow-down {
    width: 10px;
    margin-left: 19px;
}

.b-img {
    width: 34px;
    height: 34px;
    margin-right: 10px;
}

.b-title {
    font-size: 14px;
    line-height: 20px;
    /* color: #ffffff; */
	color: var(--text-color);
    font-weight: bold;
}

.qua-price {
    font-weight: bold;
    line-height: 31px;
    /* color: #fff; */
	color: var(--text-color);
    font-size: 26px;
    margin: 12px 0 2px;
}

.change-price {
    font-size: 12px;
    line-height: 15px;
}

.volume-list {
    gap: 14px;
    flex: 1;
    text-align: right;

    .volume-name {
        color: #8B939A;
        line-height: 15px;
        font-size: 12px;
    }

    .volume-num {
        font-family: DIN, DIN;
        line-height: 16px;
        /* color: #fff; */
		color: var(--text-color);
        font-size: 13px;
        margin-top: 6px;
    }
}

.change_percent {
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    text-align: left;
    color: #8B939A;
}
</style>
