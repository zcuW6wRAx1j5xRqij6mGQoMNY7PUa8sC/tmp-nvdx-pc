<script setup>
import { useDisabled } from "@/hooks/useDisabled"
import { useI18n } from "vue-i18n"
import { ref, onMounted, reactive, computed } from "vue"
import { friendlyNumber } from "@/utils/utils"
import { successMessage } from "@utils/message"
import {
    transferApi,
    getTransferBalanceApi,
    getOptionsWalletApi,
} from "@/api/my"
import { useBalance } from "@/hooks/useBalance"
const { getWalletData, walletInfo, getSpotBalance } =
    useBalance([1, 2])
const { t } = useI18n()
const transferDataInit = {
    amountKey: "USDC",
    account: "",
    account1: "",
    amount: "",
}
const transferData = reactive({
    ...transferDataInit,
})
const isTransferDisabled = useDisabled(transferData)
const contactTotal = ref(0)
const optionsWallet = ref({})
const getTransferBalance = () => {
    getTransferBalanceApi().then((data) => {
        contactTotal.value = data
    })
}
const getOptionsWallet = () => {
    getOptionsWalletApi().then((data) => {
        optionsWallet.value = data || {}
    })
}
onMounted(() => {
    getTransferBalance()
    getOptionsWallet()
})
const errorObj = ref({})
const total = computed(() => {
    if (transferData.account === "spot") return friendlyNumber(walletInfo.value.total)
    if (transferData.account === "options") return friendlyNumber(optionsWallet.value.balance)
    return friendlyNumber(contactTotal.value)
})
const accountList = computed(() => [
    { name: t("transform.select1"), id: "spot" },
    { name: t("transform.select3"), id: "derivative" },
    { name: t("transform.select4"), id: "options" },
])
// 合约与期权互斥：只能现货<->合约、现货<->期权，不能合约<->期权
const isOptions = (val, other) => {
    if (val === "options" && other === "derivative") return false
    if (val === "derivative" && other === "options") return false
    return true
}
const transferList = [
    {
        id: "USDC",
        name: "USD",
    },
]
const accountChange = () => {
    transferData.amount = ""
}
const accountList1 = computed(() => {
    return accountList.value.filter(
        (item) => item.id !== transferData.account1 && isOptions(item.id, transferData.account1)
    )
})
const accountList2 = computed(() => {
    return accountList.value.filter(
        (item) => item.id !== transferData.account && isOptions(item.id, transferData.account)
    )
})
const change = () => {
    transferData.amount = ""
    const temp = transferData.account
    transferData.account = transferData.account1
    transferData.account1 = temp
}
const emit = defineEmits(["success"])
const sureHandle = () => {
    if (transferData.account === transferData.account1) {
        errorObj.value = { account: t("transform.errorAccount"), account1: t("transform.errorAccount") }
        return
    }
    return transferApi({
        amount: transferData.amount,
        from: transferData.account,
        to: transferData.account1,
    })
        .then(() => {
            successMessage(t("common.opeSuccess"))
            transferData.amount = ""
            getWalletData(1)
            getWalletData(2)
            getTransferBalance()
            getOptionsWallet()
            emit("success")
        })
        .catch((err) => {
            errorObj.value = err
        })
}
</script>
<template>
    <div class="transfer-body">
        <el-select v-model="transferData.amountKey" size="large" disabled :placeholder="t('withdrawal.pla1')"
            class="mb-10px">
            <el-option v-for="item in transferList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>

        <div class="flex items-center mb-4">
            <el-select popper-class="my-select-popper" v-model="transferData.account" size="large" :placeholder="t('transform.pla1')">
                <el-option v-for="item in accountList1" :key="item.id" :label="item.name" :value="item.id"
                    @click.stop="accountChange" />
            </el-select>
            <img src="./img/transfer.svg" class="mx-3  flex-shrink-0 cursor-pointer" @click="change" alt="" />
            <el-select popper-class="my-select-popper" v-model="transferData.account1" size="large" :placeholder="t('transform.pla2')">
                <el-option v-for="item in accountList2" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
        </div>
        <MyInput isLarge v-model="transferData.amount" :placeholder="$t('transform.pla4')" :errorObj="errorObj"
            propName="amount" hasSuffix>
            <template #suffix>
                <span class="all-btn" @click="transferData.amount = total">{{ $t("contractOpe.bond.all")
                }}</span>
            </template>
        </MyInput>
        <div class="from-label flex justify-between">
            <span class="text-[#9098A2]">{{ $t("withdrawal.tip.tip1") }}</span>{{ friendlyNumber(total) }}USD
        </div>
        <MyButton :clickFn="sureHandle" :disabled="isTransferDisabled" size="large" class="justify-self-end submit-btn">
            {{
                $t("transform.title") }}
        </MyButton>
    </div>
</template>
<style scoped lang="scss">
	
	:global(.el-input-group__prepend) {
	  border-radius: 20px !important;
	  overflow: hidden; /* 非常关键 */
	}
	
	
	
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
	
	:global(.my-select-popper .el-select-group__title) {
	  color: var(--text-secondary) !important;
	}
	
	:global(.my-select-popper .el-popper__arrow::before) {
	  background: var(--bg-popup) !important;
	  border: 1px solid var(--border-color) !important;
	}
	
	:global(.my-select-popper .el-scrollbar__bar.is-vertical > div),
	:global(.my-select-popper .el-scrollbar__bar.is-horizontal > div) {
	  background: var(--scrollbar-thumb) !important;
	}
.transfer-body {
    max-width: 800px;
    width: 100%;
    flex-shrink: 0;
    margin: 0 auto;
}

.set-box {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.from-label {
    margin-bottom: 10px;
}

.all-btn {
    font-weight: 400;
    font-size: 15px;
    color: var(--el-color-primary);
    line-height: 18px;
    margin-left: 12px;
    cursor: pointer;
}

.submit-btn {
    height: 60px;
    min-width: 180px;
    border-radius: 20px;
    margin-top: 30px;
}
</style>