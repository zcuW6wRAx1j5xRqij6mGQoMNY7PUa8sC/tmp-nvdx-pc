<script setup>
import { ref, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { optionsRulesApi, optionsCreateApi } from "@/api/options"
import { getOptionsWalletApi } from "@/api/my"
import { successMessage } from "@/utils/message"
import { friendlyNumber, formatNumber } from "@/utils/utils"

const { t } = useI18n()
const emit = defineEmits(["success"])

const props = defineProps({
  optionList: { type: Array, default: () => [] },
  symbolId: { type: Number, default: 0 },
})

const errorObj = ref({})
const timeList = ref([])
const formData = ref({
  amount: "",
  proportion_id: 0,
  proportion: 0,
  max_price: 0,
  min_price: 0,
  status: 1,
  unit: "USD",
  fee: 0,
})

const getData = async () => {
  const res = await optionsRulesApi({}).catch(() => null)
  if (res && res.length) {
    res.forEach((item) => {
      item.time = item.duration_sec + "s"
      item.rate = formatNumber(+item.profit_rate)
      item.fee = formatNumber(+item.fee_rate)
    })
    timeList.value = res
    if (timeList.value.length) handleSelectClick(timeList.value[0])
  }
}

const walletData = ref({})
const getWalletApi = async () => {
  const res = await getOptionsWalletApi().catch(() => null)
  if (res) {
    res.balance = formatNumber(+res.balance || 0)
    walletData.value = res
  }
}

const handleSelectClick = (item) => {
  formData.value.proportion_id = item.id
  formData.value.proportion = item.rate
  formData.value.max_price = item.max_price
  formData.value.min_price = item.min_price
  formData.value.fee = item.fee
}

const onPeriodChange = (id) => {
  const item = timeList.value.find((r) => r.id === id)
  if (item) handleSelectClick(item)
}

const estimated = computed(() => {
  const val = formData.value
  const amount = +String(val.amount).replace(/,/g, "") || 0
  return friendlyNumber(amount + amount * +val.proportion || 0)
})

const handleMaxClick = () => {
  const balance = +walletData.value.balance || 0
  const maxPrice = +formData.value.max_price || 0
  formData.value.amount = balance >= maxPrice ? formData.value.max_price : balance
}

// 涨/跌 Tab（与 ContractTransaction 一致）
const typeList = computed(() => [
  { name: t("spotOpe.Up"), id: 1 },
  { name: t("spotOpe.Down"), id: 2 },
])
const typeActive = ref(1)
const typeChange = (val) => {
  typeActive.value = val
  formData.value.status = val
}

const fullscreenLoading = ref(false)
const dialogVisible = ref(false)

// 确认弹窗展示信息（参考 ContractTransaction suerShow）
const sureShow = computed(() => {
  const side = formData.value.status === 1 ? t("spotOpe.Up") : t("spotOpe.Down")
  const rule = timeList.value.find((r) => r.id === formData.value.proportion_id)
  return [
    { name: t("spotOpe.Price"), value: `${formData.value.amount || "0"} ${formData.value.unit}` },
    { name: t("spotOpe.Fee"), value: `${((+formData.value.fee || 0) * 100).toFixed(2)}%` },
    { name: t("spotOpe.Estimated"), value: estimated.value },
    { name: t("spotOpe.label.label1"), value: friendlyNumber(walletData.value.balance || 0) },
  ]
})

const handleConfirm = async () => {
  if (fullscreenLoading.value) return
  const data = formData.value
  const optionItem = props.optionList.find((o) => o.symbol_id === props.symbolId)
  const option_id = optionItem?.id
  if (!option_id) {
    successMessage(t("spotOpe.noOption") )
    return
  }
  fullscreenLoading.value = true
  try {
    await optionsCreateApi({
      option_id,
      rule_id: data.proportion_id,
      side: data.status === 1 ? "buy" : "sell",
      amount: data.amount,
    })
    successMessage( t("common.opeSuccess"))
    formData.value.amount = ""
    getWalletApi()
    emit("success")
    dialogVisible.value = false
  } finally {
    fullscreenLoading.value = false
  }
}

const sureHandle = () => {
  if (!formData.value.amount || formData.value.amount == 0) return
  dialogVisible.value = true
}

onMounted(() => {
  getData()
  getWalletApi()
})
</script>

<template>
  <div class="trading-operation option-buy" v-loading.fullscreen.lock="fullscreenLoading">
    <MyTab
      :tabList="typeList"
      :tabActive="typeActive"
      @tabChange="typeChange"
      class="flex-shrink-0 mb-4 w-full"
      isBlock
    />

    <el-select
      popper-class="my-select-popper"
      size="large"
      v-model="formData.proportion_id"
      :placeholder="t('spotOpe.Price')"
      class="w-full mb-2"
      @change="onPeriodChange"
    >
      <el-option
        v-for="item in timeList"
        :key="item.id"
        :label="`${item.time} (${(formatNumber(+item.rate || 0) * 100)}%)`"
        :value="item.id"
      />
    </el-select>

    <div class="title">
      {{ t("spotOpe.Price") }}
      <span class="fee-text">{{ t("spotOpe.Fee") }} {{ ((+formData.fee || 0) * 100).toFixed(2) }}%</span>
    </div>
    <MyInput
      isLarge
      v-model="formData.amount"
      type="number"
      placeholder="0.00"
      :errorObj="errorObj"
      propName="amount"
      hasSuffix
    >
      <template #suffix>
        <span>{{ formData.unit }}</span>
        <span class="max-btn" @click.stop="handleMaxClick">{{ t("spotOpe.Max") }}</span>
      </template>
    </MyInput>

    <div class="title">
      {{ t("spotOpe.label.label1") }}
      <span class="balance">{{ friendlyNumber(walletData.balance || 0) }}</span>
    </div>
    <div class="title">
      {{ t("spotOpe.Min Purchase") }}
      <span class="balance">{{ friendlyNumber(formData.min_price || 0) }} {{ formData.unit }}</span>
    </div>
    <div class="title">
      {{ t("spotOpe.Estimated") }}
      <span class="balance">{{ estimated }}</span>
    </div>

    <MyButton
      size="large"
      :clickFn="sureHandle"
      class="mt-auto"
      :type="typeActive === 1 ? 'green' : 'danger'"
      :disabled="!formData.amount || formData.amount == 0"
    >
      {{ t("spotOpe.Immediate Execution") }}
    </MyButton>

    <my-dialog
      v-model="dialogVisible"
      :title="t('spotOpe.Immediate Execution')"
      @confirm="handleConfirm"
      @close="dialogVisible = false"
      :width="400"
    >
      <div class="flex items-center justify-between mt-4" v-for="(item, index) in sureShow" :key="index">
        <div class="bond-label">{{ item.name }}</div>
        <div class="bond-value">{{ item.value }}</div>
      </div>
    </my-dialog>
  </div>
</template>

<style scoped lang="scss">
.option-buy {
  min-width: 320px;
  border-left: 1px solid var(--border-color, rgb(255 255 255 / 8%));
}

/* 与 ContractTransaction 统一 */
.trading-operation {
  font-family: "PingFang SC";
  padding: 0 24px;
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

:deep(.my-input),
:deep(.el-select) {
  margin-bottom: 10px;
}

.title {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-secondary, #8b939a);

  .balance {
    font-family: DIN;
    font-weight: bold;
    font-size: 14px;
    color: var(--text-primary);
  }

  .fee-text {
    font-size: 12px;
    color: var(--text-secondary, #8b939a);
  }
}

.max-btn {
  margin-left: 8px;
  font-size: 13px;
  color: var(--color-primary, #1eb576);
  cursor: pointer;
}

.bond-label {
  font-family: "PingFang SC";
  font-weight: 400;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 24px;
}

.bond-value {
  font-family: "PingFang SC";
  font-weight: 400;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 24px;
  word-break: break-all;
}

:deep(.el-dialog__footer) {
  button {
    flex: auto;
  }
}

/* el-select 与 ContractTransaction 一致 */
:global(.my-select-popper.el-popper),
:global(.my-select-popper.el-select__popper) {
  background: var(--bg-popup) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
  box-shadow: var(--shadow-popup) !important;
}

:global(.my-select-popper .el-select-dropdown),
:global(.my-select-popper .el-select-dropdown__wrap),
:global(.my-select-popper .el-scrollbar),
:global(.my-select-popper .el-scrollbar__view),
:global(.my-select-popper .el-scrollbar__wrap) {
  background: var(--bg-popup) !important;
}

:global(.my-select-popper .el-select-dropdown__item) {
  color: var(--text-primary) !important;
}

:global(.my-select-popper .el-select-dropdown__item:hover),
:global(.my-select-popper .el-select-dropdown__item.hover) {
  background: var(--bg-hover) !important;
}

:global(.my-select-popper .el-select-dropdown__item.is-selected) {
  background: var(--bg-hover) !important;
  color: var(--text-primary) !important;
}
</style>
