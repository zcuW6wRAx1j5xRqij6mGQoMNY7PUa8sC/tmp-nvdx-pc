<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import OpeTop from './components/OpeTop.vue'
import BookList from './components/BookList.vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useSocket from '@/hooks/useSocket'
import Decimal from 'decimal.js'
import { friendlyNumber, formatNumber, formatByCoinType, usdcToUsd } from '@/utils/utils'
import SpotOrderCom from './components/SpotOrderCom.vue'
import { useBalance } from '@/hooks/useBalance'
import { getSymbolDetailApi, addSpotOrderApi } from '@/api/data'
import { showSuccessToast, closeToast, showLoadingToast } from 'vant'

const { getSpotBalance, getWalletData } = useBalance([1])
const { setSub, unsubscribeChannel } = useSocket()
const { t } = useI18n()
const route = useRoute()

const symbol = ref<any>()
const symbolId = ref<number>(+(route.query.symbolId as string))
const name = ref<any>()
// 基础币
const baseAsset = ref<any>()
// 计价币
const quoteAsset = ref<any>()
const spotId = ref<any>()
const bLogo = ref<any>()

// 获取币的详情并且开启socket
let isInit = true
const getDetail = () => {
  if (!symbolId.value) return
  getSymbolDetailApi({
    symbol_id: symbolId.value,
    symbol_type: 'spot',
  }).then((data: any) => {
    isInit = true
    name.value = data.name
    baseAsset.value = data.base_asset?.toUpperCase()
    quoteAsset.value = data.quote_asset?.toUpperCase()
    symbol.value = data.symbol
    spotId.value = data.id
    bLogo.value = data.logo
    initFromHandle()
  })
}
onMounted(getDetail)

// 现货：买入用 quote 余额；卖出用 base 余额
const activeTab = ref<number>(+(route.query.type as string) || 1)
const isBuy = computed(() => activeTab.value === 1)

const balance = computed(() => {
  const asset = isBuy.value ? quoteAsset.value : baseAsset.value
  return getSpotBalance(asset)
})

// 币切换
const bChange = (item: any) => {
  symbolId.value = item?.id
  getDetail()
}

// 获取当前数据给到bookList组件用于显示当前价格
const nowData = ref<any>({})
const dataChange = (val: any) => {
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
const searchList = computed(() => [
  { name: t('spotOpe.type.type1'), id: 1 },
  { name: t('spotOpe.type.type2'), id: 2 },
])

const searchChange = (id: number) => {
  activeTab.value = id
  initFromHandle()
}

const dataList = computed(() => [
  { name: t('spotOpe.order.order2'), id: 'market' },
  { name: t('spotOpe.order.order1'), id: 'limit' },
])

const slider = ref(0)

const errorObj = ref<Record<string, any>>({})

const initFrom = {
  document_type_label: '',
  document_type: 'market',
  price: 0 as any, // 价格（显示用字符串/数字都可能）
  amount: 0 as any, // 数量
  money: 0 as any, // 金额
}

const fromData = ref<any>({ ...initFrom })

// 是否是限价订单
const isLimit = computed(() => fromData.value.document_type === 'limit')

// 初始化表单
const initFromHandle = () => {
  fromData.value = { ...initFrom }
  slider.value = 0
  const defaultValue = dataList.value[0]
  fromData.value.document_type_label = defaultValue.name
  fromData.value.document_type = defaultValue.id

  // nowData 还没到时给 0，避免 friendlyNumber('') -> ''
  const p = nowData.value?.price
  fromData.value.price = p ? friendlyNumber(p) : 0
}
onMounted(initFromHandle)

const selectChange = (_: any, item: any) => {
  fromData.value.document_type = item.id
  fromData.value.document_type_label = item.name
  fromData.value.amount = 0
  fromData.value.money = 0
  slider.value = 0
}

// ============ ✅ 计算修复（核心） ============

// 兼容 MyInput 可能传 value 或原生 event
const getInputVal = (e: any) => {
  if (e == null) return ''
  if (e?.target && 'value' in e.target) return e.target.value
  return e
}

// 把任何输入（"1,234.56" / "1.234,56" / number）转成纯 number
const toNum = (v: any) => {
  const n = formatNumber(v)
  return typeof n === 'number' && !Number.isNaN(n) ? n : 0
}

const calcMoney = (price: any, amount: any) => {
  const p = new Decimal(toNum(price))
  const a = new Decimal(toNum(amount))
  if (p.lte(0) || a.lte(0)) return 0
  return friendlyNumber(p.times(a).toNumber())
}

const calcAmount = (money: any, price: any) => {
  const m = new Decimal(toNum(money))
  const p = new Decimal(toNum(price))
  if (m.lte(0) || p.lte(0)) return 0
  return friendlyNumber(m.div(p).toNumber())
}

// 数量变化 -> 金额
const changeAmount = (e: any) => {
  const val = getInputVal(e)
  if (!val) {
    fromData.value.money = 0
    return
  }
  fromData.value.money = calcMoney(fromData.value.price, val)
}

// 金额变化 -> 数量
const changeMoney = (e: any) => {
  const val = getInputVal(e)
  if (!val || !fromData.value.price) {
    fromData.value.amount = 0
    return
  }
  fromData.value.amount = calcAmount(val, fromData.value.price)
}

// 滑块变化（25/50/75/100）
const changeSlide = (val: number) => {
  if (!val || !fromData.value.price) {
    fromData.value.amount = 0
    fromData.value.money = 0
    return
  }

  const bal = new Decimal(toNum(balance.value))
  const ratio = new Decimal(val).div(100)
  const picked = bal.times(ratio)

  if (isBuy.value) {
    // 买：money = picked, amount = money/price
    fromData.value.money = friendlyNumber(picked.toNumber())
    fromData.value.amount = calcAmount(picked.toNumber(), fromData.value.price)
  } else {
    // 卖：amount = picked, money = amount*price
    fromData.value.amount = friendlyNumber(picked.toNumber())
    fromData.value.money = calcMoney(fromData.value.price, picked.toNumber())
  }
}

// ✅ 按不同模式判断按钮禁用
const canSubmit = computed(() => {
  const priceOk = toNum(fromData.value.price) > 0
  const amountOk = toNum(fromData.value.amount) > 0
  const moneyOk = toNum(fromData.value.money) > 0

  // 限价：需要 price + amount
  if (isLimit.value) return priceOk && amountOk

  // 市价：买只需要 money；卖只需要 amount
  return isBuy.value ? moneyOk : amountOk
})

// 提交买卖
const isRefresh = ref(false)
const submitHandle = () => {
  showLoadingToast({
    forbidClick: true,
    loadingType: 'spinner',
    duration: 0,
  })

  // 提交前全部转成纯数字（不带逗号/欧式）
  const price = fromData.value.price
  const amount = fromData.value.amount
  const money = fromData.value.money

  return addSpotOrderApi({
    spot_id: spotId.value,
    side: isBuy.value ? 'buy' : 'sell',
    quantity: isBuy.value ? money : amount, // 买：金额；卖：数量
    trade_type: fromData.value.document_type,
    price,
  })
    .then(() => {
      showSuccessToast(t('common.opeSuccess'))
      initFromHandle()
      getWalletData(1)
      isRefresh.value = !isRefresh.value
    })
    .finally(() => {
      setTimeout(() => closeToast(), 1000)
    })
}

const showLength = computed(() => {
  // 市价5，限价7
  return fromData.value.document_type === 'limit' ? 7 : 5
})
</script>

<template>
  <OpeTop
    :isSpots="true"
    :defaultValue="{ symbol, symbolId, name, bLogo }"
    :setSub="setSub"
    @bChange="bChange"
    @dataChange="dataChange"
  />

  <div class="p-4 flex">
    <BookList
      :nowData="nowData"
      :name="name"
      :symbol="symbol"
      :setSub="setSub"
      :unsubscribeChannel="unsubscribeChannel"
      :isSpots="true"
      :showLength="showLength"
    />

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
      />

      <MyInput
        v-model="fromData.price"
        :placeholder="$t('spotOpe.price')"
        :errorObj="errorObj"
        propName="price"
        isSmall
        :disabled="!isLimit"
      />

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
        <div class="c-value text-xs">
          {{ formatByCoinType(balance, isBuy ? quoteAsset : baseAsset) }}{{ usdcToUsd(isBuy ? quoteAsset : baseAsset) }}
        </div>
      </div>

      <MyButton
        :type="isBuy ? 'green' : 'danger'"
        class="c-is-num mt-auto ope-btn-css"
        :clickFn="submitHandle"
        :disabled="!canSubmit"
      >
        {{ isBuy ? $t('spotOpe.type.type1') : $t('spotOpe.type.type2') }}
        {{ baseAsset }}
      </MyButton>
    </div>
  </div>

  <div class="after-line"></div>

  <SpotOrderCom
    :setSub="setSub"
    :isRefresh="isRefresh"
    :spotId="spotId"
    @cancel="getWalletData(1)"
  />
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
      pointer-events: none;
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
        transform: rotate(180deg);
      }
      &.active {
        &::before {
          background-image: url('./img/active-bg.png');
          transform: rotate(0);
        }
      }
    }
    &.level2 {
      &::before {
        transform: rotate(0);
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
  background-color: var(--surface-bg);
  flex-shrink: 0;
}
:deep(.my-input) {
  margin-bottom: 12px;
}
</style>