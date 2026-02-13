<script setup>
import { useI18n } from "vue-i18n"
import { ref, onMounted, reactive } from "vue"
import { friendlyNumber } from "@/utils/utils"
import { successMessage } from "@utils/message"
import { useDisabled } from "@/hooks/useDisabled"
import {
    withdrawalApi,
    getRechargeCoinListApi,
    transferApi,
    getTransferBalanceApi,
} from "@/api/my"
import { useBalance } from "@/hooks/useBalance"
import { getWithdrawApi } from "@/api/common"
import QRCode from "qrcode"
import copy from "@/utils/copy.js"
import { useUserInfo } from "@/hooks/useUserInfo"
const { userInfo } = useUserInfo()
const { getWalletData, walletInfo, getSpotBalance } =
    useBalance([1, 2])
const { t } = useI18n()

function getImageUrl (imageName) {
    return new URL(`../img/${imageName}.svg`, import.meta.url).href
}
const dialogVisible = ref(false)
const emit = defineEmits(["toSet"])
const handleConfirm = () => {
    emit("toSet")
    dialogVisible.value = false
}
// 对币的操作
const opeMoneyList = computed(() => {
    return [
        {
            name: t("userPopup.btn1"),
            path: "/Withdrawal",
            img: 'tx',
        },
        {
            name: t("userPopup.btn2"),
            path: "/Recharge",
            img: 'cz',
        },
        // {
        //     name: t("userPopup.btn3"),
        //     path: "/Transform",
        //     img: getImageUrl("btn3"),
        // },
    ]
})
const currencyList = ref([])

const getWithDrawData = () => {
    // 重置
    Object.keys(fromDataInit).forEach((key) => {
        fromData[key] = fromDataInit[key]
    })

    if (currencyList.value.length === 0) {
        getWithdrawApi().then((data) => {
            // coin_id相等的时候 coin_block字段添加到对象的children
            let currency = {}
            data.forEach((el) => {
                if (currency[el.coin_id]) {
                    currency[el.coin_id].children.push({
                        name: el.block,
                        id: el.id,
                    })
                } else {
                    currency[el.coin_id] = {
                        id: el.coin_id,
                        name: el.coin_name,
                        children: [{ name: el.block, id: el.id }],
                    }
                }
            })
            currencyList.value = Object.values(currency)
        })
    }
}
const depositVisible = ref(false)
const fromRechargeDataInit = {
    coin_id: "",
    coin_label: "",
    child_name: "",
    child_address: "",
}
const fromRechargeData = reactive({
    ...fromRechargeDataInit,
})
const codeUrl = ref("")
const currencyRechargeList = ref([])
const childRechargeList = ref([])
const isRechargeDisabled = useDisabled(fromRechargeData)
const selectRechargeChange = (item) => {
    fromRechargeData.coin_id = item.id
    fromRechargeData.coin_label = item.name
    childRechargeList.value = item.children
    codeUrl.value = ""
    selectRechargeChildChange(item.children[0] || {})
}
const selectRechargeChildChange = (item) => {
    fromRechargeData.child_name = item.name
    fromRechargeData.child_address = item.id
    QRCode.toDataURL(item.id).then((dataUrl) => {
        codeUrl.value = dataUrl
    })
}
const getRechargeData = () => {
    // 重置
    Object.keys(fromRechargeDataInit).forEach((key) => {
        fromRechargeData[key] = fromRechargeDataInit[key]
    })
    if (currencyRechargeList.value.length === 0) {
        getRechargeCoinListApi().then((data) => {
            // coin_id相等的时候 coin_block字段添加到对象的children
            let currency = {}
            data.forEach((el) => {
                if (currency[el.coin_id]) {
                    currency[el.coin_id].children.push({
                        name: el.coin_block,
                        id: el.address,
                    })
                } else {
                    currency[el.coin_id] = {
                        id: el.coin_id,
                        name: el.coin_name,
                        children: [{ name: el.coin_block, id: el.address }],
                    }
                }
            })
            currencyRechargeList.value = Object.values(currency)
        })
    }
}

const openHandle = (item) => {
    switch (item.path) {
        case "/Withdrawal":
            if (!userInfo.value.has_trade_password) {
                dialogVisible.value = true
                return
            }
            getWithDrawData()
            WithdrawalVisible.value = true
            break
        case "/Recharge":
            getRechargeData()
            depositVisible.value = true
            break
        case "/Transform":
            Object.keys(transferDataInit).forEach((key) => {
                transferData[key] = transferDataInit[key]
            })
            transferVisible.value = true
            break
    }
}
const fromDataInit = {
    wallet_address: "",
    amount: "",
    coin_id: "",
    coin_label: "",
    child_name: "",
    trade_pwd: "",
    coin_id_p: "",
}
const fromData = reactive({
    ...fromDataInit,
})
const isDisabled = useDisabled(fromData)
const WithdrawalVisible = ref(false)
const childList = ref([])
const selectChange = (item) => {
    fromData.coin_label = item.name
    childList.value = item.children
    selectChildChange(item.children[0] || {})
}
const selectChildChange = (item) => {
    fromData.child_name = item.name
    fromData.coin_id = item.id
}
const coinValue = computed(() => {
    return getSpotBalance(fromData.coin_label) || 0
})
const errorObj = ref({})
const submitForm = () => {
    return withdrawalApi(fromData)
        .then(() => {
            successMessage(t("common.opeSuccess"))
            getWalletData([1, 2])
            getTotal()
            WithdrawalVisible.value = false
        })
        .catch((error) => {
            errorObj.value = error
        })
        .finally(() => { })
}

// 划转
const transferVisible = ref(false)
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
onMounted(() => {
    getTransferBalanceApi().then((data) => {
        contactTotal.value = data
    })
})
const total = computed(() => {
    return friendlyNumber(
        transferData.account === 0 ? walletInfo.value.total : contactTotal.value
    )
})
const accountList = computed(() => {
    return [
        { name: t("transform.select1"), id: 0 },
        { name: t("transform.select3"), id: 2 },
    ]
})
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
    return accountList.value.filter((item) => item.id !== transferData.account1)
})
const accountList2 = computed(() => {
    return accountList.value.filter((item) => item.id !== transferData.account)
})
const change = () => {
    transferData.amount = ""
    const temp = transferData.account
    transferData.account = transferData.account1
    transferData.account1 = temp
}
const sureHandle = () => {
    let to = "spot"
    if (transferData.account === 0) {
        to = "derivative"
    }
    return transferApi({ amount: transferData.amount, to: to }).then(() => {
        transferVisible.value = false
        successMessage(t("common.opeSuccess"))
        getWalletData([1, 2])
        getTotal()
    }).catch(err => {
        errorObj.value = err
    })
}
</script>
<template>
    <div class="flex gap-4">
        <div v-for="item in opeMoneyList" :key="item.path" @click="openHandle(item)" class="ope-box" size="small">
			<template v-if="item.img == 'tx' || item.img == 'cz'">
				<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if='item.img == "cz"'>
				<g id="Frame">
				<path id="Vector" d="M21.3074 9.33034H2.93411C2.51029 9.33034 2.16992 8.97085 2.16992 8.5307C2.16992 8.09056 2.51029 7.72876 2.93411 7.72876H21.3118C21.7312 7.72876 22.076 8.08595 22.076 8.5307C22.0716 8.97085 21.7312 9.33034 21.3074 9.33034Z" fill="currentColor"/>
				<path id="Vector_2" d="M13.4273 16.4778C13.4273 18.8948 15.3869 20.8521 17.8016 20.8521C20.2164 20.8521 22.1759 18.8948 22.1759 16.4778C22.1759 14.0608 20.2186 12.1035 17.8016 12.1035C15.3847 12.1035 13.4273 14.0608 13.4273 16.4778ZM21.1976 16.48C21.1976 18.3551 19.6767 19.876 17.8016 19.876C15.9244 19.876 14.4057 18.353 14.4057 16.4778C14.4057 14.6027 15.9265 13.0819 17.8016 13.0819C19.6767 13.0819 21.1976 14.6048 21.1976 16.48Z" fill="currentColor" stroke="currentColor" stroke-width="0.2"/>
				<path id="Vector_3" d="M18.3154 16.7689L19.1178 15.9665C19.3186 15.7657 19.6457 15.7657 19.8466 15.9665C20.0474 16.1673 20.0474 16.4945 19.8466 16.6953L18.1669 18.375C17.9661 18.5758 17.6389 18.5758 17.4381 18.375L15.7584 16.6953C15.5576 16.4945 15.5576 16.1673 15.7584 15.9665C15.9592 15.7657 16.2864 15.7657 16.4872 15.9665L17.2851 16.7644L17.2833 14.5917V14.5916C17.2833 14.3053 17.5163 14.0756 17.7994 14.0756C18.0856 14.0756 18.3154 14.3085 18.3154 14.5916V16.7689Z" fill="currentColor" stroke="currentColor" stroke-width="0.3"/>
				<path id="Vector 21" d="M12.4529 19.6527H5.86328C4.20643 19.6527 2.86328 18.3096 2.86328 16.6527V7.2392C2.86328 5.58234 4.20643 4.2392 5.86328 4.2392H18.5716C20.2284 4.2392 21.5716 5.58234 21.5716 7.2392V11.2989" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				</g>
				</svg>
				<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if='item.img == "tx"'>
				<g id="Frame">
				<path id="Vector" d="M21.3074 10.8516H2.93411C2.51029 10.8516 2.16992 10.4921 2.16992 10.052C2.16992 9.61184 2.51029 9.25005 2.93411 9.25005H21.3118C21.7312 9.25005 22.076 9.60723 22.076 10.052C22.0716 10.4921 21.7312 10.8516 21.3074 10.8516Z" fill="currentColor"/>
				<path id="Vector_2" d="M8.98906 7.94518H5.61575C5.19193 7.94518 4.85156 7.58569 4.85156 7.14554C4.85156 6.70539 5.19193 6.3436 5.61575 6.3436H8.99345C9.41288 6.3436 9.75764 6.70078 9.75764 7.14554C9.75324 7.58569 9.41288 7.94518 8.98906 7.94518Z" fill="currentColor"/>
				<path id="Vector_3" d="M13.4273 16.4778C13.4273 18.8948 15.3869 20.8521 17.8016 20.8521C20.2164 20.8521 22.1759 18.8948 22.1759 16.4778C22.1759 14.0608 20.2186 12.1035 17.8016 12.1035C15.3847 12.1035 13.4273 14.0608 13.4273 16.4778ZM21.1976 16.48C21.1976 18.3551 19.6767 19.876 17.8016 19.876C15.9244 19.876 14.4057 18.353 14.4057 16.4778C14.4057 14.6027 15.9265 13.0819 17.8016 13.0819C19.6767 13.0819 21.1976 14.6048 21.1976 16.48Z" fill="currentColor" stroke="currentColor" stroke-width="0.2"/>
				<path id="Vector_4" d="M18.2654 15.7116L19.1531 16.5993C19.3344 16.7806 19.6299 16.7806 19.8112 16.5993C19.9925 16.418 19.9925 16.1225 19.8112 15.9412L18.1315 14.2615C17.9502 14.0802 17.6547 14.0802 17.4734 14.2615L15.7938 15.9412C15.6125 16.1225 15.6125 16.418 15.7938 16.5993C15.9751 16.7806 16.2706 16.7806 16.4519 16.5993L17.3352 15.7159L17.3333 18.0094V18.0095C17.3333 18.268 17.5437 18.4756 17.7994 18.4756C18.0578 18.4756 18.2654 18.2652 18.2654 18.0095V15.7116Z" fill="currentColor" stroke="currentColor" stroke-width="0.2"/>
				<path id="Vector 21" d="M12.4529 19.6527H5.86328C4.20643 19.6527 2.86328 18.3096 2.86328 16.6527V7.2392C2.86328 5.58234 4.20643 4.2392 5.86328 4.2392H18.5716C20.2284 4.2392 21.5716 5.58234 21.5716 7.2392V11.2989" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				</g>
				</svg>
				
			</template>
            <img :src="item.img" class="ope-icon" alt="" v-else />
            {{ item.name }}
        </div>
    <!-- 存款 -->
    <my-dialog v-model="depositVisible" :title="t('recharge.title')" width="553px" :showFooter="false"
        @close="depositVisible = false">
        <div class="from-label">
            {{ t("withdrawal.label1") }}
            <span class="money-tip">{{ $t("withdrawal.tip.tip1") }}：{{ coinValue }}
                {{ fromData.coin_label }}</span>
        </div>
        <el-select v-model="fromRechargeData.coin_id" :placeholder="t('withdrawal.pla1')">
            <el-option v-for="item in currencyRechargeList" :key="item.id" :label="item.name" :value="item.id"
                @click.stop="selectRechargeChange(item)" />
        </el-select>
        <div class="from-label">
            {{ t("recharge.pla2") }}
        </div>
        <el-select v-model="fromRechargeData.child_address" :placeholder="t('recharge.pla2')">
            <el-option v-for="item in childRechargeList" :key="item.id" :label="item.name" :value="item.id"
                @click.stop="selectRechargeChildChange(item)" />
        </el-select>
        <div class="flex flex-col items-center" v-if="fromRechargeData.child_address">
            <div class="title-tip">
                {{ $t("recharge.tip1") }}{{ fromData.child_name
                }}{{ $t("recharge.tip2") }}
            </div>
            <img v-if="codeUrl" class="code-img" :src="codeUrl" />
            <div class="address">{{ $t("recharge.address") }}</div>
            <div class="address-value">
                {{ fromRechargeData.child_address }}
            </div>
        </div>
        <MyButton @click="copy(fromRechargeData.child_address)" :disabled="isRechargeDisabled" size="medium"
            class="mt-6">{{ t("recharge.copy") }}</MyButton>
    </my-dialog>

    <!-- 取款 -->
    <my-dialog v-model="WithdrawalVisible" :title="t('withdrawal.title')" width="553px" :showFooter="false"
        @close="WithdrawalVisible = false">
        <div class="my-dialog-body">
            <div class="from-label">
                {{ t("withdrawal.label1") }}
                <span class="money-tip">{{ $t("withdrawal.tip.tip1") }}：{{ coinValue }}
                    {{ fromData.coin_label }}</span>
            </div>
            <el-select v-model="fromData.coin_id_p" :placeholder="t('withdrawal.pla1')">
                <el-option v-for="item in currencyList" :key="item.id" :label="item.name" :value="item.id"
                    @click.stop="selectChange(item)" />
            </el-select>
            <div class="from-label">
                {{ t("withdrawal.label6") }}
            </div>
            <el-select v-model="fromData.coin_id" :placeholder="t('withdrawal.pla6')">
                <el-option v-for="item in childList" :key="item.id" :label="item.name" :value="item.id"
                    @click.stop="selectChildChange(item)" />
            </el-select>
            <MyInput :fromLabel="$t('withdrawal.label4')" v-model="fromData.wallet_address"
                :placeholder="$t('withdrawal.pla4')" propName="wallet_address" :errorObj="errorObj" />
            <MyInput  v-model="fromData.amount" :placeholder="$t('withdrawal.pla2')"
                :fromLabel="$t('withdrawal.label2')" :errorObj="errorObj" propName="amount" />
            <MyInput  v-model="fromData.trade_pwd" :placeholder="$t('withdrawal.pla7')"
                :fromLabel="$t('withdrawal.payPwd')" :errorObj="errorObj" propName="trade_pwd" />
            <MyButton :clickFn="submitForm" :disabled="isDisabled" size="medium">{{ t("common.text1") }}</MyButton>
        </div>
    </my-dialog>
    <!-- 划转 -->
    <my-dialog v-model="transferVisible" :title="t('withdrawal.title')" width="553px" :showFooter="false"
        @close="transferVisible = false">
        <div class="my-dialog-body">
            <div class="from-label">
                {{ t("transform.title2") }}
            </div>
            <el-select v-model="transferData.amountKey" disabled :placeholder="t('withdrawal.pla1')">
                <el-option v-for="item in transferList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
            <div class="from-label">
                {{ t("transform.title1") }}
            </div>
            <div class="flex items-center">
                <el-select v-model="transferData.account" :placeholder="t('transform.pla1')">
                    <el-option v-for="item in accountList1" :key="item.id" :label="item.name" :value="item.id"
                        @click.stop="accountChange" />
                </el-select>
                <img src="../img/btn3.svg" class="w-6 h-6 ml-3 mr-3 mb-4 flex-shrink-0 cursor-pointer" @click="change"
                    alt="" />
                <el-select v-model="transferData.account1" :placeholder="t('transform.pla2')">
                    <el-option v-for="item in accountList2" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </div>
            <MyInput  v-model="transferData.amount" :placeholder="$t('transform.pla4')"
                :fromLabel="$t('transform.label4')" :errorObj="errorObj" propName="amount" hasSuffix>
                <template #suffix>
                    <span class="all-btn" @click="transferData.amount = total">{{ $t("contractOpe.bond.all")
                        }}</span>
                </template>
            </MyInput>
            <div class="from-label">
                {{ $t("withdrawal.tip.tip1") }}：{{ total }}USD
            </div>
            <MyButton :clickFn="sureHandle" :disabled="isTransferDisabled" size="medium">{{ $t("transform.btn1") }}
            </MyButton>
        </div>
    </my-dialog>
    <my-dialog v-model="dialogVisible" :title="t('common.text3')" width="343px" :closeIcon="true"
        @confirm="handleConfirm" @close="dialogVisible = false">
        <div class="my-dialog-body">
            {{ t("withdrawal.payError") }}
        </div>
    </my-dialog>
</div>
</template>

<style lang="scss" scoped>
	.lang-icon {
			color: var(--text-primary);
			/* 黑夜白、日间黑 */
		}
.ope-box {
  margin-right: 10px;
  min-width: 145px;
  height: 60px;

  background: var(--bg-card);
  border-radius: 20px;
  padding: 18px;

  font-weight: 500;
  font-size: 14px;
  color: var(--text-primary);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .ope-icon {
    width: 24px;
    height: 24px;
    margin-right: 6px;
  }
}

.money-tip {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-secondary);
  margin-left: auto;
  font-family: DIN;
}

.title-tip {
  font-weight: 400;
  font-size: 16px;
  color: var(--text-primary);
  line-height: 18px;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin-bottom: 12px;
  margin-top: 8px;
}

.address {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 20px;
  font-style: normal;
  text-transform: none;
  margin-top: 16px;
  width: 100%;
  text-align: center;
}

.address-value {
  font-weight: 400;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 20px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-top: 10px;
  word-break: break-all;
}

.code-img {
  min-width: 100px;
  min-height: 100px;
  border-radius: 8px;

  /* 可选：让浅色主题也更融入 */
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
}

.all-btn {
  font-weight: 400;
  font-size: 15px;
  color: var(--color-success);
  line-height: 18px;
  margin-left: 12px;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
}
</style>