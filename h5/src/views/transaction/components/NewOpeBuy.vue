<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted } from 'vue'
import { optionsRulesApi, optionsCreateApi } from '@/api/options'
import { getOptionsWalletApi } from '@/api/my'
import { showToast,showLoadingToast,closeToast } from 'vant'

import { formatNumber, setBaseUrl, friendlyNumber } from '@/utils/utils'

const { t } = useI18n()
const buy = 1
const sell = 2
const timeList = ref([])
const formData = ref({
    amount: 0,
    proportion_id: 0,
    proportion:0,
    max_price: 0,
    min_price: 0,
    status: 1,
    bLogo: '',
    unit: 'USD',
    fee:0
})

const props = withDefaults(
    defineProps<{
        optionList: Array,
        symbolId: String,
    }>(),
    {
        optionList: [],
        symbolId: '',   
    },
)

// 获取数据
const getData = async () => {
    const res = await optionsRulesApi({})
    if(res &&res.length) {
        res.forEach(item => {
            item.time = item.duration_sec + 's'
            item.rate = `${formatNumber(+item.profit_rate)}`
            item.fee = `${formatNumber(+item.fee_rate)}`
        })
        timeList.value = res

        handleSelectClick(timeList.value[0])
    }
}

const walletData = ref({})

// 获取期权钱包数据
const getWalletApi = async () => {
    const res = await getOptionsWalletApi()
    if(res) {
        res.balance = formatNumber(+res.balance || 0)
        walletData.value = res
    }
}

// 选择
const handleSelectClick = item => {
    formData.value.proportion_id = item.id
    formData.value.proportion = item.rate
    formData.value.max_price = item.max_price
    formData.value.min_price = item.min_price
    formData.value.fee = item.fee
}

const estimated = computed(() => {
    const val = formData.value
    const amount =  formatNumber(+val.amount || 0)
    // const price = formatNumber(+val.amount || 0) * +val.fee || 0
    return friendlyNumber(amount + amount * +val.proportion || 0) 
})

const handleMaxClick = () => {
    const isBig = (walletData.value.balance - +formData.value.max_price || 0) > 0
    formData.value.amount = isBig ? formData.value.max_price : walletData.value.balance
}

const showOut = ref(false)
const suerShow = computed(() => {
    return [
        {name:t('spotOpe.money'),value: formatNumber(+formData.value.amount || 0)},
        {name:t('spotOpe.Fee'),value: friendlyNumber(formData.value.fee || 0) * 100 + '%'},
        {name:t('spotOpe.Estimated'),value: formatNumber(+estimated.value || 0)},
    ]
})

const submitHandle = async () => {
    showOut.value = false
    const data = formData.value
    const option_id = props.optionList.filter(item => item.symbol_id === props.symbolId)[0]?.id
    showLoadingToast({
        message: 'Loading',
        duration: 10000,
    })
    const res = await optionsCreateApi({
        option_id:option_id,
        rule_id:data.proportion_id,
        side:data.status === 1 ? 'buy' : 'sell',
        amount:data.amount,
    })
    closeToast()
    if(!res) {
        showToast({
            message: t('contractOpe.Success'),
            duration: 2000,
        })
        formData.value.amount = ''
        getWalletApi()
    }
}

onMounted(() => {
    getData()
    getWalletApi()
})
</script>

<template>
    <div class="overflow-hidden">
        <!-- 涨 跌 按钮 -->
        <div class="flex justify-between buy-sell">
            <div class="flex-1 buy-btn" :class="{ 'active': formData.status === buy }" @click="formData.status = buy">{{
                t('spotOpe.Up')
            }}</div>
            <div class="flex-1 sell-btn" :class="{ 'active': formData.status === sell }"
                @click="formData.status = sell">{{
                    t('spotOpe.Down') }}</div>
        </div>

        <!-- 时间选择 -->
        <div class="time-list">
            <div v-for="(item, index) in timeList" :key="item.id" class="time-item"
                :class="{ 'active': formData.proportion_id === item.id }" @click="handleSelectClick(item)">
                <div class="item-time">{{ item.time }}</div>
                <div class="item-num">{{ (formatNumber(+item.rate || 0) * 100) }}%</div>
            </div>
        </div>

        <div class="footer">
            <!-- 手续费 -->
            <div class="flex justify-between width-[100%] mt-4 mb-2.5">
                <div class="buy-price">{{ t('spotOpe.Price') }}</div>
                <div class="fee flex  items-center">{{ t('spotOpe.Fee') }}
                    <div class="fee-right">&nbsp;{{ friendlyNumber(formData.fee || 0) * 100 }}%</div>
                </div>
            </div>

            <!-- 购买金额 -->
            <div class="flex width-[100%] gap-3">
                <!-- 单位 -->
                <div class="price-left flex items-center">
                    <!-- <img :src="setBaseUrl('/logo/usdt.svg')" class="w-6 h-6 rounded-full" alt=""> -->
                    <div class="unit">{{ formData.unit }}</div>
                </div>
                <!-- 输入框 -->
                <div class="relative flex-1">
                    <MyInput v-model="formData.amount" class="flex-1" placeholder="0.00" type="number"></MyInput>
                    <div class="max" @click="handleMaxClick">{{ $t('spotOpe.Max') }}</div>
                </div>
            </div>

            <div class="label-price mt-4">
                {{ t('spotOpe.label.label1') }}: {{ friendlyNumber(walletData.balance) }}
            </div>

            <div class="flex mt-2.5 mb-7 items-center">
                <div class="flex-1 min-purchase">{{(t('spotOpe.Min Purchase'))}}: {{ friendlyNumber(formData.min_price || 0) }} {{ formData.unit }}</div>
                <div class="estimated flex items-center">{{ t('spotOpe.Estimated') }}: 
                    <div class="mt-[3px]">&nbsp; {{ estimated }}</div>
                </div>
            </div>
            <MyButton class="w-[100%] h-[48px]" :disabled="!formData.amount || formData.amount == 0" type="primary" @click="showOut=true">{{ t('spotOpe.Immediate Execution') }}</MyButton>

        </div>
    </div>

    <MyConfirm v-model="showOut" @confirm="submitHandle" btnType="primary" :title="t('contractOpe.orderSure.title')"
        titleColor="#fff">
        <div class="flex items-center justify-between mt-4" v-for="(item, index) in suerShow" :key="index">
            <div class="bond-label">{{ item.name }}</div>
            <div class="bond-value">{{ item.value }}</div>
        </div>
    </MyConfirm>
</template>

<style scoped lang="scss">
.buy-btn,
.sell-btn {
    background-image: url('@/views/transaction/img/default-bg.svg');
    background-size: 100% auto;
    background-repeat: no-repeat;
    width: 165px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
	// color: var(--text-color);
    margin: 19px 0 16px;
}

.buy-btn.active {
    background-image: url('@/views/transaction/img/default-bg-active.svg');
}

.sell-btn {
    background-image: url('@/views/transaction/img/default-bg-right.svg');
    &.active {
        background-image: url('@/views/transaction/img/default-bg-right-active.svg');
    }
}

.time-list {
    overflow-x: auto;
    display: flex;
    gap: 10px;

    .time-item {
        min-width: 75px;
        height: 68px;
        box-sizing: border-box;
        padding: 0 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 9px;
        border: 1px solid #303030;
        background-color: #0E0E0E;
        font-family: DIN, DIN;
        gap: 8px;

        &.active {
            background-color: #1EB576;
            border-color: none;

            .item-num {
                // color: #fff;
				color: var(--text-color);
                opacity: .8;
            }
        }

        .item-time {
            line-height: 19px;
            // color: #fff;
			color: var(--text-color);
            font-size: 16px;
        }

        .item-num {
            line-height: 17px;
            color: #939393;
            font-size: 14px;
        }
    }
}

.footer {

    .buy-price,
    .fee {
        line-height: 20px;
        font-size: 14px;
        // color: #fff;
		color: var(--text-color);
    }

    .fee-right {
        margin-top: 3px;
    }

    .max {
        position: absolute;
        top: 14px;
        right: 16px;
        font-size: 14px;
        line-height: 20px;
        color: #1EB576;
    }

    :deep(.van-cell),
    .price-left {
        border-radius: 9px;
    }

    :deep(.my-input) {
        flex: 1;
        margin: 0;
    }

    .price-left {
        border: 1px solid #303030;
        width: 125px;
        height: 48px;
        box-sizing: border-box;
        padding: 12px 16px;
    }

    .unit {
        line-height: 20px;
        font-size: 14px;
        // color: #fff;
		color: var(--text-color);
        margin-left: 16px;
    }

    :deep(.my-button) {
        border-radius: 8px;
    }
}
</style>
