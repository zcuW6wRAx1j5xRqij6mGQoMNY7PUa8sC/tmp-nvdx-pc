<script setup>
import { withdrawalApi, getMyInfoApi } from '@/api/my'
import { getWithdrawApi } from '@/api/common'
import { useRouter } from 'vue-router'
import { useDisabled } from '@/hooks/useDisabled'
import { useBalance } from '@/hooks/useBalance'
import { closeToast, showLoadingToast, showSuccessToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
const { t } = useI18n()
const { getSpotBalance } = useBalance([1])
const router = useRouter()
const currencyList = ref([])
const childList = ref([])
let showOut = ref(false)
const toSetPwd = () => {
    router.push({
        path: '/ChangePwd',
        query: { pay: 2, has: 0 },
    })
}
onMounted(async () => {
    showLoadingToast()
    // 获取用户信息
    await getMyInfoApi().then(data => {
        showOut.value = !data.has_trade_password
    })
    getWithdrawApi().then(data => {
        // coin_id相等的时候 coin_block字段添加到对象的children
        let currency = {}
        data.forEach(el => {
            // 暂时只支持usdt
            // if (el.coin_name !== 'USDC') {
            //     return
            // }
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
    closeToast()
})
const selectChange = (_, item) => {
    fromData.coin_label = item.name
    childList.value = item.children
    fromData.child_name = ''
}

const selectChildChange = (_, item) => {
    fromData.child_name = item.name
    fromData.coin_id = item.id
}
const sureHandle = () => {
    showLoadingToast({})
    return withdrawalApi(fromData)
        .then(() => {
            showSuccessToast(t('common.opeSuccess'))
            router.push('/My')
        })
        .catch(error => {
            errorObj.value = error
        })
}
const fromData = reactive({
    wallet_address: '',
    amount: '',
    coin_id: '',
    coin_label: '',
    child_name: '',
    trade_pwd: '',
})
const isDisabled = useDisabled(fromData)
const errorObj = ref({})
const toPage = path => {
    router.push(path)
}
const coinValue = computed(() => {
    return getSpotBalance(fromData.coin_label) || 0
})
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('withdrawal.title')"
        left-arrow
        @click-left="$router.back()"
        fixed
        placeholder
    >
        <template #right>
			<svg class="lang-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" @click="toPage('/WithdrawalHistory')">
			<g id="&#231;&#148;&#179;&#232;&#180;&#173;&#232;&#174;&#176;&#229;&#189;&#149;">
			<path id="Vector" d="M4.48096 20.6255L4.47344 4.4668H6.9873V5.29389C6.9873 6.21957 7.73503 6.97314 8.65486 6.97314H15.3451C15.7888 6.97115 16.2136 6.79322 16.5262 6.4784C16.8388 6.16357 17.0138 5.73757 17.0127 5.29389V4.4668L19.519 4.46011L19.5257 20.6188L4.48096 20.6255ZM15.3418 3.6397L15.3451 5.30225L8.6582 5.29389V3.6397L8.65486 3.63135L15.3418 3.6397ZM19.5149 2.7959H16.7788C16.4897 2.29881 15.9584 1.96045 15.3451 1.96045H8.65486C8.04164 1.96045 7.51113 2.29797 7.22123 2.7959H4.47344C4.03227 2.79634 3.60932 2.97185 3.29744 3.28388C2.98557 3.5959 2.81028 4.01895 2.81006 4.46011V20.6255C2.81006 21.5428 3.55695 22.2897 4.47427 22.2897H19.5257C19.9669 22.289 20.3898 22.1135 20.7018 21.8015C21.0137 21.4896 21.1893 21.0667 21.1899 20.6255V4.46011C21.1882 4.0174 21.0108 3.59348 20.6967 3.28145C20.3826 2.96942 19.9576 2.79479 19.5149 2.7959Z" fill="currentColor"/>
			<path id="Vector_2" d="M14.7955 10.5734L10.8338 14.9044L9.21214 13.0873C9.06458 12.922 8.85739 12.8221 8.63616 12.8095C8.41493 12.797 8.19778 12.8729 8.03249 13.0204C7.8672 13.168 7.76729 13.3752 7.75476 13.5964C7.74222 13.8176 7.81808 14.0348 7.96565 14.2001L10.203 16.7064C10.2808 16.7936 10.376 16.8634 10.4825 16.9115C10.589 16.9596 10.7044 16.9848 10.8212 16.9855H10.8262C11.0602 16.9855 11.2841 16.8869 11.4428 16.7139L16.0286 11.7012C16.1781 11.5377 16.2566 11.3215 16.2467 11.1001C16.2369 10.8787 16.1395 10.6703 15.9759 10.5208C15.8124 10.3712 15.5962 10.2927 15.3748 10.3026C15.1534 10.3125 14.945 10.4099 14.7955 10.5734Z" fill="currentColor"/>
			</g>
			</svg>
            <!-- <img
                src="../transaction/img/right.svg"
                class="h-6 w-6"
                @click="toPage('/WithdrawalHistory')"
            /> -->
        </template>
    </van-nav-bar>
    <div class="withdrawal overflow-auto flex-auto">
        <MyInput
            isBlock
            :modelValue="fromData.coin_label"
            :placeholder="$t('withdrawal.pla1')"
            :label="$t('withdrawal.label1')"
            :errorObj="errorObj"
            propName="coin_id"
            readonly
            isSelect
            :dataList="currencyList"
            @selectChange="selectChange"
        ></MyInput>
        <div class="flex justify-between mb-3" v-if="fromData.coin_label">
            <div class="c-label">{{ $t('withdrawal.tip.tip1') }}</div>
            <div class="c-value">{{ coinValue }} {{ fromData.coin_label }}</div>
        </div>
        <MyInput
            isBlock
            :modelValue="fromData.child_name"
            :placeholder="$t('recharge.pla2')"
            :label="$t('recharge.pla2')"
            :errorObj="errorObj"
            propName="coin_id"
            readonly
            isSelect
            :dataList="childList"
            @selectChange="selectChildChange"
        ></MyInput>
        <MyInput
            isBlock
            v-model="fromData.wallet_address"
            :placeholder="$t('withdrawal.pla4')"
            :label="$t('withdrawal.label4')"
            :errorObj="errorObj"
            propName="child_address"
        ></MyInput>
        <MyInput
            
            isBlock
            v-model="fromData.amount"
            :placeholder="$t('withdrawal.pla2')"
            :label="$t('withdrawal.label2')"
            :errorObj="errorObj"
            propName="amount"
        ></MyInput>
        <MyInput
            
            isBlock
            v-model="fromData.trade_pwd"
            :placeholder="$t('tipAll.pla7')"
            :label="$t('tipAll.payPwd')"
            :errorObj="errorObj"
            propName="trade_pwd"
        ></MyInput>

        <div v-html="$t('withdrawal.imTip')" class="text-[#969799]"></div>
        <!-- <MyInput
            isBlock
            v-model="fromData.money"
            :placeholder="$t('withdrawal.pla3')"
            :label="$t('withdrawal.label3')"
            :errorObj="errorObj"
            propName="password"
        ></MyInput>
        <MyInput
            isBlock
            v-model="fromData.money"
            :placeholder="$t('withdrawal.pla4')"
            :label="$t('withdrawal.label4')"
            :errorObj="errorObj"
            propName="password"
        ></MyInput>
        <MyInput
            class="mb-0"
            isBlock
            v-model="fromData.money"
            :placeholder="$t('withdrawal.pla5')"
            :label="$t('withdrawal.label5')"
            :errorObj="errorObj"
            propName="password"
        ></MyInput> -->
    </div>
    <div class="pb-8 pt-4 pl-5 pr-5">
        <MyButton :disabled="isDisabled || !coinValue" :clickFn="sureHandle">{{ $t('withdrawal.btn') }}</MyButton>
    </div>
    <MyConfirm
        hideCancel
        v-model="showOut"
        @confirm="toSetPwd"
        :content="$t('tipAll.payError')"
        :close-on-click-overlay="false"
    ></MyConfirm>
</template>

<style scoped lang="scss">
	.lang-icon {
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.withdrawal {
    padding: 24px 16px;
}
.tip {
    color: #6b6b6b;
    text-align: right;

    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}
.bank-info {
    margin-top: 10px;
    width: 100%;
    flex-shrink: 0;
    background-color: #272727;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    color: #fff;
    font-size: 16px;
    font-style: normal;
    line-height: normal;
    border-radius: 8px;
}
</style>
