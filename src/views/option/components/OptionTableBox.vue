<script setup>
import { ref, watch, reactive, nextTick, computed } from "vue"
import { useI18n } from "vue-i18n"
import { optionsOrderListApi } from "@/api/options"
import { friendlyNumber, usdcToUsd } from "@/utils/utils"
import dayjs from "dayjs"

const { t } = useI18n()
const emit = defineEmits(["change"])

const props = defineProps({
  isRefreshBottomTable: { type: Boolean, default: false },
})

// 与 ContractTableBox 一致的 tab 结构
const searchList = computed(() => [
  { id: "pending", name: t("spotOrder.tab.tab1") },
  { id: "closed", name: t("spotOrder.tab.tab2") },
])
const tabActive = ref("pending")
const tableParams = reactive({ status: "pending", page: 0, page_size: 100 })
const tableSearch = ref(false)



const getTableList = () => {
  tableParams.status = tabActive.value
  nextTick(() => {
    tableSearch.value = !tableSearch.value
  })
}

const tabChange = (id) => {
  tabActive.value = id
  getTableList()
}

watch(
  () => props.isRefreshBottomTable,
  (newVal, oldVal) => {
    if (newVal !== oldVal) getTableList()
  }
)
</script>

<template>
  <div class="table-box">
    <div class="box-tab">
      <MyTab
        :tabList="searchList"
        :tabActive="tabActive"
        @tabChange="tabChange"
        class="flex-shrink-0 mb-4"
        isBlock
      />
    </div>

    <ob-table-page
      :tableSearch="tableSearch"
      :tableParams="tableParams"
      :hasBtn="false"
      :getTableUrl="optionsOrderListApi"
      :defaultGet="false"
      isSmall
    >
      <template #table="{ tableData }">
        <el-table :data="tableData" height="auto">
          <el-table-column :label="t('spotOpe.colum4.field1')" min-width="120">
            <template #default="{ row }">
              {{ usdcToUsd(row.symbol?.name) || "-" }}
            </template>
          </el-table-column>
          <el-table-column :label="t('spotOpe.colum4.field3')" min-width="80">
            <template #default="{ row }">
              <span :class="row.side === 'buy' ? 'green-color' : 'red-color'">
                {{ row.side === "buy" ? t("spotOrder.type.type1") : t("spotOrder.type.type2") }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="t('spotOrder.buyAmount')" min-width="120" align="right">
            <template #default="{ row }">
              {{ friendlyNumber(+row.amount || 0) }}
            </template>
          </el-table-column>
          <el-table-column :label="t('spotOrder.openPrice')" min-width="120" align="right">
            <template #default="{ row }">
              {{ friendlyNumber(+row.open_price || 0) }}
            </template>
          </el-table-column>
          <el-table-column :label="t('spotOrder.deliveryTime')" min-width="180">
            <template #default="{ row }">
              {{ row.settlement_time ? dayjs(row.settlement_time).format("DD.MM.YYYY HH:mm:ss") : "-" }}
            </template>
          </el-table-column>
          <el-table-column :label="t('spotOrder.profitAmount')" min-width="120" align="right">
            <template #default="{ row }">
              <span :class="+row.profit >= 0 ? 'green-color' : 'red-color'">
                {{ friendlyNumber(row.profit) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="t('spotOrder.statusLabel')" min-width="100">
            <template #default="{ row }">
              <span :class="row.status === 'pending' ? 'status-pending' : 'status-end'">
                {{
                  row.status === "pending"
                    ? t("spotOrder.status.pending")
                    : t("spotOrder.status.end")
                }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </ob-table-page>
  </div>
</template>

<style scoped lang="scss">
/* 与 ContractTableBox 统一 */
.table-box {
  height: 600px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  margin-top: 36px;

  .box-tab {
    display: flex;
    align-items: center;
    justify-content: space-between;

    :deep(.tab-block) {
      min-width: 120px;
    }
  }
}

.status-pending {
  padding: 2px 8px;
  border-radius: 4px;
  background: #ffc148;
  color: #553800;
  font-size: 12px;
}

.status-end {
  padding: 2px 8px;
  border-radius: 4px;
  background: #222324;
  color: #8b939a;
  font-size: 12px;
}

:deep(.el-table .cell) {
  padding: 0 6px !important;
}
</style>
