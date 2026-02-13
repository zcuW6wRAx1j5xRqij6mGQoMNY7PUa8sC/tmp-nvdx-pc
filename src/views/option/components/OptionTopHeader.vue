<script setup>
import { ref, watch, onMounted, nextTick } from "vue"
import { useI18n } from "vue-i18n"
import { friendlyNumber, setBaseUrl } from "@/utils/utils"
import { getContractListApi } from "@/api/data"
import { optionsListApi } from "@/api/options"
import { ArrowDownBold, ArrowLeftBold } from "@element-plus/icons-vue"
import { useRouter } from "vue-router"

const { t } = useI18n()
const router = useRouter()

const props = defineProps({
  setSub: { type: Function, default: () => {} },
  unsubscribeChannel: { type: Function, default: () => {} },
  symbolInfo: { type: Object, default: () => ({}) },
})

const emit = defineEmits(["changeData", "changeCoin", "getRecordMap"])

const tableList = ref([])
const getTableList = async () => {
  const [contractRes, optionsRes] = await Promise.all([
    getContractListApi({ page: 0, page_size: 999 }),
    optionsListApi().catch(() => null),
  ])
  const contracts = contractRes?.items || []
  const optionItems = Array.isArray(optionsRes) ? optionsRes : optionsRes?.items ?? optionsRes?.data ?? []
  const optionSymbolIds = new Set((optionItems || []).map((o) => o.symbol_id))
  tableList.value = contracts.filter((c) => optionSymbolIds.has(c.id))
}

const recordMap = ref({})
const setListData = (data) => {
  recordMap.value[data.data.symbol] = data.data
  emit("getRecordMap", recordMap.value)
}

nextTick(() => {
  props.setSub?.("public:allticker", setListData)
})

function getData(row, prop) {
  const data = recordMap.value[row.symbol] || {}
  const val = +data[prop]
  return val ?? "-"
}

const singleData = ref({})
const setInfo = (ctx) => {
  singleData.value = ctx.data || {}
  emit("changeData", singleData.value)
}

watch(
  () => props.symbolInfo.symbol,
  (newValue, oldValue) => {
    if (oldValue) props.unsubscribeChannel?.(`public:ticker_${oldValue}`)
    if (newValue) props.setSub?.(`public:ticker_${newValue}`, setInfo)
  },
  { immediate: true }
)

const popoverRef = ref()
const toggleCurrency = (item) => {
  if (item.id === props.symbolInfo.id) return
  emit("changeCoin", item)
  popoverRef.value?.hide()
}

onMounted(() => {
  getTableList()
})

const handleBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="top-header">
    <div class="item-box flex items-center" style="margin-left: 0">
      <el-icon class="el-icon--right mr-4 cursor-pointer" size="16" @click="handleBack">
        <ArrowLeftBold />
      </el-icon>
      <el-popover placement="bottom" trigger="click" ref="popoverRef">
        <template #reference>
          <div class="cur-currency">
            <img v-if="symbolInfo.logo" :src="setBaseUrl(symbolInfo.logo)" class="b-img-large" />
            {{ symbolInfo.name }}
            <el-icon class="el-icon--right" size="12">
              <ArrowDownBold />
            </el-icon>
          </div>
        </template>
        <div class="dropList">
          <div class="table-header">
            <div class="flex-auto">{{ t("tradingCommon.text19") }}</div>
            <div style="width: 140px; text-align: right">{{ t("tradingCommon.text20") }}</div>
            <div style="width: 140px; text-align: right">{{ t("tradingCommon.text9") }}</div>
          </div>
          <div class="table-body">
            <div
              v-for="(item, i) in tableList"
              :key="i"
              class="body-row"
              @click="toggleCurrency(item)"
            >
              <div class="flex flex-auto">
                <img :src="setBaseUrl(item.logo)" class="b-img" alt="" />
                {{ item.name }}
              </div>
              <div
                style="width: 140px; text-align: right"
                :class="getData(item, 'price_latest_change') >= 0 ? 'green-color' : 'red-color'"
              >
                {{ friendlyNumber(getData(item, 'price')) }}
              </div>
              <div
                style="width: 140px; text-align: right"
                :class="getData(item, 'price_change_percent') > 0 ? 'green-color' : 'red-color'"
              >
                {{ friendlyNumber(getData(item, 'price_change_percent')) }}%
              </div>
            </div>
          </div>
        </div>
      </el-popover>
    </div>
    <div class="item-box">
      <div
        class="number color-red fs-24 fs-bold font-DIN flex items-center"
        :class="singleData.price_latest_change >= 0 ? 'green-color' : 'red-color'"
        v-if="singleData.price"
      >
        {{ friendlyNumber(singleData?.price) }}
        <div
          v-if="singleData.price_change_percent"
          class="is-small ml-2 sub-number color-red"
          :class="[
            'sub-number',
            singleData.price_change_percent > 0 ? 'c-num-status' : 'c-num-status is-red',
          ]"
        >
          {{ friendlyNumber(singleData?.price_change_percent, false) }}%
        </div>
      </div>
    </div>
    <div class="item-box">
      <div class="sub-number fs-18 font-DIN" v-if="singleData.volume">
        {{ friendlyNumber(singleData?.volume) }}
      </div>
      <div class="number color-grey fs-12 mt-1 flex items-center">
        <img src="@/views/trading/img/icon1.svg" alt="" class="mr-1" />
        24h {{ t("tradingCommon.text12") }}
      </div>
    </div>
    <div class="item-box ml-70">
      <div class="sub-number fs-18 font-DIN">
        {{ friendlyNumber(singleData.trade_volume) }}
      </div>
      <div class="number color-grey fs-12 mt-1 flex items-center">
        <img src="@/views/trading/img/icon1.svg" alt="" class="mr-1" />
        24h {{ t("tradingCommon.text13") }}
      </div>
    </div>
    <div class="item-box">
      <div class="sub-number fs-18 font-DIN" v-if="singleData.high_price_24h">
        {{ friendlyNumber(singleData?.high_price_24h) }}
      </div>
      <div class="number color-grey fs-12 mt-1 flex items-center">
        <img src="@/views/trading/img/icon2.svg" alt="" class="mr-1" />
        24h {{ t("tradingCommon.text10") }}
      </div>
    </div>
    <div class="item-box">
      <div class="sub-number fs-18 font-DIN" v-if="singleData.low_price_24h">
        {{ friendlyNumber(singleData?.low_price_24h) }}
      </div>
      <div class="number color-grey fs-12 mt-1 flex items-center">
        <img src="@/views/trading/img/icon3.svg" alt="" class="mr-1" />
        24h {{ t("tradingCommon.text11") }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.top-header {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  overflow: auto;
  margin-bottom: 24px;

  .item-box {
    position: relative;
    text-align: right;
    margin-left: 4vw;

    .cur-currency {
      font-size: 22px;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
  }
}
.fs-18 {
  font-size: 18px;
}
</style>
