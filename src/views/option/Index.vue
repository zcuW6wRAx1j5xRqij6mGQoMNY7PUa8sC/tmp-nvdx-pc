<script setup>
import { ref, onMounted } from "vue"
import OptionChart from "./components/OptionChart.vue"
import OptionTableBox from "./components/OptionTableBox.vue"
import OptionTopHeader from "./components/OptionTopHeader.vue"
import RightTable from "@/views/trading/components/RightTable.vue"
import OptionBuy from "./components/OptionBuy.vue"
import useSocket from "@/hooks/useSocket"
import { useRoute } from "vue-router"
import { getSymbolDetailApi, getContractListApi } from "@/api/data"
import { optionsListApi } from "@/api/options"

const { setSub, unsubscribeChannel } = useSocket()
const route = useRoute()

const symbolInfo = ref({})
const symbolId = ref(+route.query.id || 0)
const changeCoin = async (item) => {
  symbolId.value = item.id
  await getDetail()
  change()
}
const getDetail = () => {
  if (!symbolId.value) return
  return getSymbolDetailApi({
    symbol_id: symbolId.value,
    symbol_type: "futures",
  }).then((data) => {
    symbolInfo.value = data || {}
    refreshBottomTable()
  })
}

const initDefaultSymbol = async () => {
  if (route.query.id) return
  const res = await getContractListApi({ page: 0, page_size: 1 })
  const items = res?.items || []
  if (items.length && items[0]?.id) {
    symbolId.value = items[0].id
    await getDetail()
  }
}

onMounted(() => {
  if (route.query.id) {
    getDetail()
  } else {
    initDefaultSymbol()
  }
})

const symbolData = ref({})
const changeData = (data) => {
  symbolData.value = data
}
const isRefreshBottomTable = ref(false)
const refreshBottomTable = () => {
  isRefreshBottomTable.value = !isRefreshBottomTable.value
}
const recordMap = ref({})
const getRecordMap = (data) => {
  recordMap.value = data
}
const change = () => {
  refreshBottomTable()
}

const optionList = ref([])
const getOptionsList = async () => {
  const res = await optionsListApi().catch(() => null)
  optionList.value = Array.isArray(res) ? res : res?.items ?? res?.data ?? []
}
onMounted(getOptionsList)
</script>

<template>
  <div class="contract-trading">
    <OptionTopHeader
      :setSub="setSub"
      :symbolInfo="symbolInfo"
      @changeData="changeData"
      @changeCoin="changeCoin"
      :unsubscribeChannel="unsubscribeChannel"
      @getRecordMap="getRecordMap"
    />
    <div class="contract-top flex">
      <div class="top-box">
        <OptionChart :symbol-id="symbolId" />
        <OptionBuy
          :option-list="optionList"
          :symbol-id="symbolId"
          @success="change"
        />
      </div>
    </div>
    <OptionTableBox
      :isRefreshBottomTable="isRefreshBottomTable"
      @change="change"
    />
  </div>
</template>

<style scoped lang="scss">
.contract-trading {
  flex: auto;

  .contract-top {
    height: auto;

    .top-box {
      position: relative;
      border-radius: 6px;
      overflow-y: auto;
      overflow-x: hidden;
      flex: auto;
      display: flex;
      padding-bottom: 4px;

      .tool-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 30px;
        height: 60px;
        border-bottom: 1px solid rgb(255 255 255 / 5%);
        font-family: "PingFang SC";
      }
    }
  }
}
</style>
