<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDisabled } from '@/hooks/useDisabled'
import { useI18n } from 'vue-i18n'
import { showSuccessToast, showLoadingToast } from 'vant'
import { useBalance } from '@/hooks/useBalance'
import { getCoinSelectorApi, instantExchangeApi, getInstantExchangeFeeApi } from '@/api/my'
import { friendlyNumber, multiply, divide, subtract, removeDot } from '@/utils/utils'
import useSocket from '@/hooks/useSocket'
const { walletInfo, getSpotBalance, getWalletData } = useBalance([1])
const { t } = useI18n()
const router = useRouter()

// 跳转到历史记录页面
const toPage = (path, query) => {
    if (query) {
        router.push({ path, query })
    } else {
        router.push(path)
    }
}
const fromData = reactive({
    fromCurrency: '',
    fromCurrencyLabel: '',
    toCurrency: '',
    toCurrencyLabel: '',
    amount: 0,
})
const recordMap = ref({})
const setListData = data => {
    if (data && data.data && data.data.symbol && data.data.price) {
        if(recordMap.value[data.data.symbol]){
            return
        }
        recordMap.value[data.data.symbol] = data.data.price
    }
}
useSocket('public:allticker', setListData)

const errorObj = ref({})
const isDisabled = useDisabled(fromData)

// 货币列表
const currencyList = ref([])

const excludedSymbols = ['HMXR', 'HLNP', 'EDNE']

// 获取币种选择器数据
const getCurrencyList = async () => {
    try {
        const data = await getCoinSelectorApi()
        // 确保数据格式正确，包含name和id字段
        currencyList.value = (data || [])
            .map(item => {
                const name = item.name || item.coin_name || item.symbol || ''
                return {
                    ...item,
                    name,
                    id: item.id || item.coin_id || item.symbol_id
                }
            })
            .filter(item => !excludedSymbols.includes(item.name.toUpperCase()))
        fromData.fromCurrency = currencyList.value[0]?.id
        fromData.fromCurrencyLabel = currencyList.value[0]?.name
        fromData.toCurrency = currencyList.value[1]?.id
        fromData.toCurrencyLabel = currencyList.value[1]?.name
    } catch (error) {
        console.error('获取币种列表失败:', error)
    }
}

// 页面加载时获取币种列表和手续费
onMounted(() => {
    getCurrencyList()
    getExchangeFee()
})

// 选择源货币
const fromCurrencyChange = (_, item) => {
    fromData.amount = ''
    fromData.fromCurrency = item.id
    fromData.fromCurrencyLabel = item.name
    // 重新获取手续费
    getExchangeFee()
}

// 选择目标货币
const toCurrencyChange = (_, item) => {
    fromData.toCurrency = item.id
    fromData.toCurrencyLabel = item.name
}

// 可选择的源货币列表(排除已选择的目标货币)
const fromCurrencyList = computed(() => {
    return currencyList.value.filter(item => item.id !== fromData.toCurrency)
})

// 可选择的目标货币列表(排除已选择的源货币)
const toCurrencyList = computed(() => {
    return currencyList.value.filter(item => item.id !== fromData.fromCurrency)
})

// 切换货币
const switchCurrency = () => {
    fromData.amount = ''
    const tempId = fromData.fromCurrency
    fromData.fromCurrency = fromData.toCurrency
    fromData.toCurrency = tempId

    const tempLabel = fromData.fromCurrencyLabel
    fromData.fromCurrencyLabel = fromData.toCurrencyLabel
    fromData.toCurrencyLabel = tempLabel
}

// 确认兑换
const confirmExchange = async () => {
    if (fromData.fromCurrency === fromData.toCurrency) {
        errorObj.value = {
            fromCurrency: t('transform.errorAccount'),
            toCurrency: t('transform.errorAccount')
        }
        return
    }

    if (!fromData.amount) {
        errorObj.value = {
            amount: t('exchange.errorAmount')
        }
        return
    }

    showLoadingToast({})

    try {
        const exchangeData = {
            from_coin_id: fromData.fromCurrency,
            to_coin_id: fromData.toCurrency,
            quantity: fromData.amount
        }

        await instantExchangeApi(exchangeData)
        showSuccessToast(t('common.opeSuccess'))
        fromData.amount = ''
        getWalletData(1)
    } catch (error) {
        errorObj.value = error
        // 错误处理已经在http拦截器中处理
    }
}

// 手续费
const exchangeFee = ref(0)

// 获取手续费
const getExchangeFee = async () => {
    try {
        const data = await getInstantExchangeFeeApi()
        exchangeFee.value = data?.fee || 0
    } catch (error) {
        console.error('获取手续费失败:', error)
    }
}

// 可用余额
const availableBalance = computed(() => {
    return getSpotBalance(fromData.fromCurrencyLabel) || 0
})

// 获取源货币价格
const fromCurrencyPrice = computed(() => {
    if(fromData.fromCurrencyLabel === 'USDC') {
        return 1
    }
    const symbol = `${fromData.fromCurrencyLabel}USDC`.toLowerCase()
    const symbol2 = `${fromData.fromCurrencyLabel}USDT`.toLowerCase()
    return recordMap.value[symbol] || recordMap.value[symbol2] || 0
})

// 获取目标货币价格
const toCurrencyPrice = computed(() => {
    if(fromData.toCurrencyLabel === 'USDC') {
        return 1
    }
    const symbol = `${fromData.toCurrencyLabel}USDC`.toLowerCase()
    const symbol2 = `${fromData.toCurrencyLabel}USDT`.toLowerCase()
    console.log(recordMap.value,recordMap.value[symbol2])
    return recordMap.value[symbol] || recordMap.value[symbol2] || 0
})

// 计算兑换比例
const exchangeRate = computed(() => {
    if (!fromCurrencyPrice.value || !toCurrencyPrice.value) return 0
    return fromCurrencyPrice.value / toCurrencyPrice.value
})

// 计算手续费金额（以目标货币计价）
const feeAmount = computed(() => {
    if (!fromData.amount || !exchangeFee.value || !exchangeRate.value) return 0
    // 先将源货币转换为目标货币，然后计算手续费
    const targetAmount = multiply(fromData.amount, exchangeRate.value)
    return multiply(targetAmount, exchangeFee.value)
})

// 计算实际兑换数量（转换为目标货币）
const actualAmount = computed(() => {
    if (!fromData.amount || !exchangeFee.value || !exchangeRate.value) return 0
    // 先将源货币转换为目标货币
    const targetAmount = multiply(fromData.amount, exchangeRate.value)
    // 扣除以目标货币计价的手续费
    return subtract(targetAmount, feeAmount.value)
})

// 格式化目标货币数量显示
const formattedTargetAmount = computed(() => {
    if (!fromData.amount || !exchangeRate.value) return 0
    return friendlyNumber(multiply(removeDot(fromData.amount), exchangeRate.value))
})

// 更新 dataInfo
const dataInfo = computed(() => ({
    amount: fromData.amount ? multiply(removeDot(fromData.amount), exchangeRate.value) : 0, // 显示目标货币数量
    fee: feeAmount.value,
    actualAmount: actualAmount.value,
    // 添加转换后的目标货币数量（不含手续费）
    targetAmount: fromData.amount ? multiply(removeDot(fromData.amount), exchangeRate.value) : 0
}))

const showInfoList = computed(() => {
    let list = [
        {
            key: 'amount',
            nameCb: data => {
                return `${t('exchange.label1')}`
            },
            cb: data => {
                return `${friendlyNumber(data.amount)} ${fromData.toCurrencyLabel}`
            },
        },
        {
            key: 'fee',
            nameCb: data => {
                return `${t('exchange.label5')}`
            },
            cb: data => {
                return `${friendlyNumber(data.fee)} ${fromData.toCurrencyLabel}`
            },
        },
        {
            key: 'actualAmount',
            nameCb: data => {
                return `${t('exchange.label4')}`
            },
            cb: data => {
                return `${friendlyNumber(data.actualAmount)} ${fromData.toCurrencyLabel}`
            },
        },
    ]
    return list
})
</script>

<template>
    <div class="exchange-page overflow-auto flex-auto">
        <div class="tip mb-2">
            <div class="c-label">{{ $t('exchange.label3') }}</div>
            <span class="is-num">{{ friendlyNumber(availableBalance) }} {{ fromData.fromCurrencyLabel }}</span>
        </div>
        <!-- 源货币选择 -->
        <MyInput isBlock v-model="fromData.amount" :placeholder="$t('transform.pla3')" :errorObj="errorObj"
            propName="from_coin_id" selectAndInput :dataList="fromCurrencyList" @selectChange="fromCurrencyChange"
            :title="$t('transformTwo.label1')">
            <template #select>
                <span class="mr-1">{{ fromData.fromCurrencyLabel }}</span>
            </template>
        </MyInput>

        <!-- 切换按钮 -->
            <img
            src="./img/btn3.svg"
            class="w-8 h-8 mt-7 mb-7 ml-auto mr-auto"
            alt=""
            @click="switchCurrency"
        />
        <!-- 目标货币选择 -->
        <MyInput isBlock :modelValue="formattedTargetAmount" :placeholder="$t('transform.pla3')" :errorObj="errorObj"
            propName="quantity" selectAndInput :dataList="toCurrencyList" @selectChange="toCurrencyChange"
            :title="$t('transformTwo.label2')" readonly>
            <template #select>
                <span class="mr-1">{{ fromData.toCurrencyLabel }}</span>
            </template>
        </MyInput>
        <div class="exchange-tip mb-2">{{ $t('exchange.label2') }}</div>
        <MyShowInfo 
                :infoList="showInfoList" :dataInfo="dataInfo" >
                </MyShowInfo>
                <div class="tip-box mt-4">
                    <div >{{ $t('exchange.tip1') }}</div>
                    <div class="tip-text " v-html="$t('exchange.tip2', { fee: exchangeFee * 100 }) "></div>
                </div>
    </div>

    <!-- 底部确认按钮 -->
    <div class="c-footer">
        <MyButton :disabled="isDisabled " :clickFn="confirmExchange">{{
            $t('transformTwo.btn1')
            }}</MyButton>
    </div>
</template>

<style scoped lang="scss">
.exchange-page {
    padding:16px;
}

.tip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'PingFang SC';
    font-size: 14px;
    font-style: normal;
    line-height: normal;

    .c-label {
        font-size: 14px;
    }

    .is-num {
        font-family: DIN;
        font-weight: 500;
    }
}

.exchange-title {
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
}

.exchange-tip {
    font-weight: 400;
    color: #8B939A;
}
:deep(.show-li){
   &:first-child{
    margin-top: 0 !important
   }
}

.debug-info {
    background: #f5f5f5;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
    
    .debug-item {
        margin-bottom: 4px;
        
        &:last-child {
            margin-bottom: 0;
        }
    }
}
.tip-text{
font-weight: 400;
font-size: 14px;
color: #8B939A;
line-height: 28px;
margin-top: 8px;
}
</style>
