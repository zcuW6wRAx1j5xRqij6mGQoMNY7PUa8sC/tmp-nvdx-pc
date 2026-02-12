<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import OpeTop from './components/OpeTop.vue'
import BookList from './components/BookList.vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useSocket from '@/hooks/useSocket'
import { friendlyNumber, multiply, divide, removeDot, formatByCoinType, usdcToUsd } from '@/utils/utils'
import SpotOrderCom from './components/SpotOrderCom.vue'
import { useBalance } from '@/hooks/useBalance'
import { getSymbolDetailApi, addSpotOrderApi } from '@/api/data'
import { showSuccessToast, closeToast, showLoadingToast } from 'vant'
const { getSpotBalance, getWalletData } = useBalance([1])
const { setSub, unsubscribeChannel } = useSocket()
const { t } = useI18n()
const route = useRoute()

const symbol = ref()
const symbolId = ref(+(route.query.symbolId as string))
const name = ref()
// 基础币
const baseAsset = ref()
// 计价币
const quoteAsset = ref()
const spotId = ref()
const bLogo = ref()
// 获取币的详情并且开启socket
const getDetail = () => {
    if (!symbolId.value) {
        return
    }
    getSymbolDetailApi({
        symbol_id: symbolId.value,
        symbol_type: 'spot',
    }).then(data => {
        isInit = true
        name.value = data.name
        baseAsset.value = data.base_asset.toUpperCase()
        quoteAsset.value = data.quote_asset.toUpperCase()
        symbol.value = data.symbol
        spotId.value = data.id
        bLogo.value = data.logo
        initFromHandle()
    })
}
onMounted(getDetail)
// 现货情况下，卖的时候显示的可用余额
const balance = computed(() => {
    let base = activeTab.value === 1 ? quoteAsset.value : baseAsset.value
    return getSpotBalance(base)
})
// 币切换
const bChange = item => {
    symbolId.value = item?.id
    getDetail()
}
// 获取当前数据给到bookList组件用于显示当前价格
const nowData = ref({})
let isInit = true
const dataChange = val => {
    if (val.symbol === symbol.value) {
        nowData.value = val
        // 初始化价格
        if (isInit) {
            isInit = false
            fromData.value.price = friendlyNumber(val.price)
        }
    }
}
// 表单
const searchList = computed(() => {
    return [
        {
            name: t('spotOpe.type.type1'),
            id: 1,
        },
        {
            name: t('spotOpe.type.type2'),
            id: 2,
        },
    ]
})
const activeTab = ref(+(route.query.type as string) || 1)
const searchChange = id => {
    activeTab.value = id
    initFromHandle()
}
const isBuy = computed(() => {
    return activeTab.value === 1
})
const dataList = computed(() => {
    return [
        {
            name: t('spotOpe.order.order2'),
            id: 'market',
        },
        {
            name: t('spotOpe.order.order1'),
            id: 'limit',
        }
    ]
})

const slider = ref(0)

const selectChange = (_, item) => {
    fromData.value.document_type = item.id
    fromData.value.document_type_label = item.name
    fromData.value.amount = 0
    fromData.value.money = 0
    slider.value = 0
}
const errorObj = ref({})
const initFrom = {
    document_type_label: '',
    document_type: 'market',
    price: 0, // 价格
    amount: 0, // 数量
    money: 0, // 金额
}
const fromData = ref({ ...initFrom })
// 是否是限价订单
const isLimit = computed(() => {
    return fromData.value.document_type === 'limit'
})
// 初始化表单
const initFromHandle = () => {
    fromData.value = {
        ...initFrom,
    }
    slider.value = 0
    const defaultValue = dataList.value[0]
    fromData.value.document_type_label = defaultValue.name
    fromData.value.document_type = defaultValue.id
    fromData.value.price = friendlyNumber(nowData.value.price)
}
onMounted(() => {
    initFromHandle()
})

const changeAmount = event => {
    const val = event.target.value
    if (!val) {
        fromData.value.money = 0
    } else {
        fromData.value.money = friendlyNumber(multiply(removeDot(fromData.value.price), removeDot(val)))
    }
}
const changeMoney = event => {
    const val = event.target.value
    if (!val || !fromData.value.price) {
        fromData.value.amount = 0
    } else {
        fromData.value.amount = friendlyNumber(divide(removeDot(val), removeDot(fromData.value.price)))
    }
}
const changeSlide = val => {
    let setVal = multiply(divide(val, 100), balance.value, isBuy.value ? quoteAsset.value : baseAsset.value)
    if (!val || !fromData.value.price) {
        fromData.value.amount = 0
        fromData.value.money = 0
        return
    }
    if (isBuy.value) {
        fromData.value.money = setVal
        fromData.value.amount = divide(setVal, removeDot(fromData.value.price), quoteAsset.value)
    } else {
        fromData.value.amount = setVal
        fromData.value.money = multiply(setVal, removeDot(fromData.value.price))
    }
}
// 提交买卖
const isRefresh = ref(false)
const submitHandle = () => {
    showLoadingToast({
            forbidClick: true,
            loadingType: 'spinner',
            duration: 0,
        })
    return addSpotOrderApi({
        spot_id: spotId.value,
        side: isBuy.value ? 'buy' : 'sell', // 买卖方向
        quantity: isBuy.value ? fromData.value.money : fromData.value.amount, // 买：金额 USD 卖：数量
        trade_type: fromData.value.document_type, // 交易类型
        price: fromData.value.price, // 价格
    })
        .then(() => {
            showSuccessToast(t('common.opeSuccess'))
            initFromHandle()
            getWalletData(1)
            isRefresh.value = !isRefresh.value
        })
        .catch(() => {
            
        }).finally(() => {
            setTimeout(() => {
                closeToast()
            }, 1000);
        })
}
const showLength = computed(() => {
    // 市价的时候5 限价的时候7 如果止盈止损话 再加上2
    let limit = 5
    if (fromData.value.document_type === 'limit') {
        limit = 7
    }
    return limit
})
</script>
<!--  -->
<template>
    <OpeTop
        :isSpots="true"
        :defaultValue="{ symbol, symbolId, name, bLogo }"
        :setSub="setSub"
        @bChange="bChange"
        @dataChange="dataChange"
    ></OpeTop>
    <div class="p-4 flex">
        <BookList
            :nowData="nowData"
            :name="name"
            :symbol="symbol"
            :setSub="setSub"
            :unsubscribeChannel="unsubscribeChannel"
            :isSpots="true"
            :showLength="showLength"
        ></BookList>
        <div class="from-box">
            <div class="type-select">
                <div
                    class="level-item"
                    :class="[`level${index + 1}`, activeTab === item.id ? 'active' : '']"
                    v-for="(item, index) in searchList"
                    :key="item.id"
                    @click="searchChange(item.id)"
                >
                    <span class="level-name">{{ item.name }}</span>
                </div>
            </div>
            <MyInput
                :modelValue="fromData.document_type_label"
                :errorObj="errorObj"
                propName="trade_type"
                readonly
                isSelect
                :dataList="dataList"
                @selectChange="selectChange"
                isSmall
                class="mt-3"
            ></MyInput>
            <MyInput
                v-model="fromData.price"
                :placeholder="$t('spotOpe.price')"
                :errorObj="errorObj"
                propName="price"
                isSmall
                :disabled="!isLimit"
            ></MyInput>
            <MyInput
                v-if="isLimit || (!isLimit && !isBuy)"
                v-model="fromData.amount"
                :placeholder="$t('spotOpe.amount')"
                :errorObj="errorObj"
                propName="quantity"
                isSmall
                @input="changeAmount"
            >
                <template #right>
                    {{ baseAsset }}
                </template>
            </MyInput>
            <div class="pl-3 pr-3 pt-3 pb-3 relative">
                <van-slider
                    v-model="slider"
                    active-color="#1EB576"
                    inactive-color="#38444D"
                    @update:model-value="changeSlide"
                    step="25"
                >
                    <template #button>
                        <div class="custom-button">{{ slider }}%</div>
                    </template>
                </van-slider>
                <div class="spot-box">
                    <div class="spot"></div>
                    <div class="spot" style="left: 50%"></div>
                    <div class="spot" style="left: 75%"></div>
                </div>
            </div>
            <MyInput
                v-if="isLimit || (!isLimit && isBuy)"
                v-model="fromData.money"
                :placeholder="$t('spotOpe.money')"
                :errorObj="errorObj"
                propName="money"
                isSmall
                class="mt-3"
                
                @input="changeMoney"
            >
                <template #right>
                    {{ usdcToUsd(quoteAsset) }}
                </template>
            </MyInput>
            <div class="c-show-info mb-3">
                <div class="c-label">{{ $t('unit.available') }}</div>
                <div class="c-value text-xs">{{ formatByCoinType(balance, isBuy ? quoteAsset : baseAsset) }}{{ isBuy ? quoteAsset : baseAsset }}</div>
            </div>
            <MyButton
                :type="isBuy ? 'green' : 'danger'"
                class="c-is-num mt-auto ope-btn-css"
                :clickFn="submitHandle"
                :disabled="!fromData.price || !fromData.amount"
            >
                {{ isBuy ? $t('spotOpe.type.type1') : $t('spotOpe.type.type2') }}
                {{ baseAsset }}
            </MyButton>
        </div>
    </div>
    <div class="after-line"></div>
    <SpotOrderCom :setSub="setSub" :isRefresh="isRefresh" :spotId="spotId" @cancel="getWalletData(1)"></SpotOrderCom>
</template>

<style scoped lang="scss">
.from-box {
    width: 50%;
    flex: auto;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
}
.type-select {
    display: flex;
    justify-content: space-between;
    border-radius: var(--border-radius);
    overflow: hidden;
    border-radius: 12px;
    .level-item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 94px;
        height: 36px;
        font-family: Yuanti-Regular;
        font-weight: 400;
        font-size: 15px;
        position: relative;
        color: #fff;
        z-index: 2;
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-size: 100% 100%;
            background-repeat: no-repeat;
            background-position: center;
            transform-origin: center;
            pointer-events: none; /* 防止伪元素干扰鼠标事件 */
            background-image: url('./img/bg.png');
            z-index: 1;
        }
        &.active {
            &::before {
                background-image: url('./img/red.png');
            }
        }
        &.level1 {
            &::before {
                transform: rotate(180deg); /* 旋转角度，可以根据需要调整 */
            }
            &.active {
                &::before {
                    background-image: url('./img/active-bg.png');
                    transform: rotate(0); /* 旋转角度，可以根据需要调整 */
                }
            }
        }
        &.level2 {
            &::before {
                transform: rotate(0); /* 旋转角度，可以根据需要调整 */
            }
        }
        .level-name {
            z-index: 3;
        }
    }
}
.ope-btn-css {
    font-weight: 500 !important;
}
.after-line {
    content: '';
    width: 100%;
    height: 10px;
    background: #14171c;
    flex-shrink: 0;
}
:deep(.my-input) {
    margin-bottom: 12px;
}
</style>
