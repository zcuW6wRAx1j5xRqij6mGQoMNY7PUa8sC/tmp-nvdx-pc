<script setup>
import { transferApi, getTransferBalanceApi, getOptionsWalletApi } from '@/api/my'
import { useRouter } from 'vue-router'
import { useDisabled } from '@/hooks/useDisabled'
import { friendlyNumber } from '@/utils/utils'
// import { useBalance } from '@/hooks/useBalance'
import { useI18n } from 'vue-i18n'
import { showSuccessToast, showLoadingToast } from 'vant'
import { onMounted } from 'vue'
import { useBalance } from '@/hooks/useBalance'
import Exchange from './Exchange.vue'
const { walletInfo, getWalletData } = useBalance([1])

const { t } = useI18n()
const router = useRouter()
const sureHandle = () => {
    if (fromData.account === fromData.account1) {
        errorObj.value = {
            account: t('transform.errorAccount'),
            account1: t('transform.errorAccount'),
        }
        return
    }

    showLoadingToast({})
    return transferApi({ amount: fromData.amount, to: fromData.account1, from: fromData.account }).then(() => {
        showSuccessToast(t('common.opeSuccess'))
        fromData.amount = ''
        fromData.amountKeyLabel = 'USDC'
        getData()
        getWalletData(1)
        // router.push('/My')
    })
}
const fromData = reactive({
    amountKey: 'USDC',
    amountKeyLabel: 'USDC',
    accountLabel: '',
    account: '',
    accountLabel1: '',
    account1: '',
    amount: '',
})
const isDisabled = useDisabled(fromData)
// const { currencyList } = useCurrency()
// const selectChange = (_, item) => {
//     console.log(item)
//     fromData.amount = item.id
//     fromData.amountLabel = item.name
// }
const errorObj = ref({})
const accountList = computed(() => {
    return [
        { name: t('transform.select1'), id: 'spot' },
        { name: t('transform.select3'), id: 'derivative' },
        { name: t('transform.select4'), id: 'options' },
    ]
})
const accountChange = (_, item) => {
    fromData.amount = ''
    fromData.account = item.id
    fromData.accountLabel = item.name
}
const accountChange1 = (_, item) => {
    fromData.account1 = item.id
    fromData.accountLabel1 = item.name
}
const contactTotal = ref(0)
const getData = () => {
    getTransferBalanceApi().then(data => {
        contactTotal.value = data
    })
}
const optionsWallet = ref(0)
const getOptionsWallet = () => {
    getOptionsWalletApi().then(data => {
        optionsWallet.value = friendlyNumber(data.balance || 0)
    })
}


onMounted(() => {
    getData()
    getOptionsWallet()
})
const total = computed(() => {
    return friendlyNumber(
        fromData.account === 'options' ? optionsWallet.value :
        fromData.account === 'spot' ? walletInfo.value.usdt : contactTotal.value,
        // fromData.account === 0
        //     ? walletInfo.value.total
        //     : fromData.account === 1
        //       ? contactTotal.value
        //       : 0,
    )
})

const isOptions = ((val, value) => {
    switch (val) {
        case 'options':
            if (value === 'derivative') {
                return false
            }
        case 'derivative':
            if (value === 'options') {
                return false
            }
        default:
            return true
    }

})

const noChanTotal = computed(() => {
    return friendlyNumber(fromData.account === 0 ? walletInfo.value.usdt : contactTotal.value)
})
const accountList1 = computed(() => {
    return accountList.value.filter(item => item.id !== fromData.account1 && isOptions(item.id, fromData.account1))
})
const accountList2 = computed(() => {
    return accountList.value.filter(item => item.id !== fromData.account && isOptions(item.id, fromData.account))
})


const change = () => {
    fromData.amount = ''
    const temp = fromData.account
    fromData.account = fromData.account1
    fromData.account1 = temp
    const temp1 = fromData.accountLabel
    fromData.accountLabel = fromData.accountLabel1
    fromData.accountLabel1 = temp1
}
const tabList = computed(() => {
    return [
        {
            name: t('transform.title'),
            id: 1,
        },
        {
            name: t('exchange.title'),
            id: 2,
        },
    ]
})
const tabActive = ref(1)
const tabChange = id => {
    tabActive.value = id
}
const toPage = (path) => {
    router.push(path)
}
</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top left-arrow @click-left="$router.back()" fixed placeholder>
        <template #title>
            <MyTab :tabList="tabList" :tabActive="tabActive" @tabChange="tabChange"></MyTab>
        </template>
        <template #right>
			<svg class="lang-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" @click="toPage('/TransformHis')" >
			<g id="&#231;&#148;&#179;&#232;&#180;&#173;&#232;&#174;&#176;&#229;&#189;&#149;">
			<path id="Vector" d="M4.48096 20.6255L4.47344 4.4668H6.9873V5.29389C6.9873 6.21957 7.73503 6.97314 8.65486 6.97314H15.3451C15.7888 6.97115 16.2136 6.79322 16.5262 6.4784C16.8388 6.16357 17.0138 5.73757 17.0127 5.29389V4.4668L19.519 4.46011L19.5257 20.6188L4.48096 20.6255ZM15.3418 3.6397L15.3451 5.30225L8.6582 5.29389V3.6397L8.65486 3.63135L15.3418 3.6397ZM19.5149 2.7959H16.7788C16.4897 2.29881 15.9584 1.96045 15.3451 1.96045H8.65486C8.04164 1.96045 7.51113 2.29797 7.22123 2.7959H4.47344C4.03227 2.79634 3.60932 2.97185 3.29744 3.28388C2.98557 3.5959 2.81028 4.01895 2.81006 4.46011V20.6255C2.81006 21.5428 3.55695 22.2897 4.47427 22.2897H19.5257C19.9669 22.289 20.3898 22.1135 20.7018 21.8015C21.0137 21.4896 21.1893 21.0667 21.1899 20.6255V4.46011C21.1882 4.0174 21.0108 3.59348 20.6967 3.28145C20.3826 2.96942 19.9576 2.79479 19.5149 2.7959Z" fill="currentColor"/>
			<path id="Vector_2" d="M14.7955 10.5734L10.8338 14.9044L9.21214 13.0873C9.06458 12.922 8.85739 12.8221 8.63616 12.8095C8.41493 12.797 8.19778 12.8729 8.03249 13.0204C7.8672 13.168 7.76729 13.3752 7.75476 13.5964C7.74222 13.8176 7.81808 14.0348 7.96565 14.2001L10.203 16.7064C10.2808 16.7936 10.376 16.8634 10.4825 16.9115C10.589 16.9596 10.7044 16.9848 10.8212 16.9855H10.8262C11.0602 16.9855 11.2841 16.8869 11.4428 16.7139L16.0286 11.7012C16.1781 11.5377 16.2566 11.3215 16.2467 11.1001C16.2369 10.8787 16.1395 10.6703 15.9759 10.5208C15.8124 10.3712 15.5962 10.2927 15.3748 10.3026C15.1534 10.3125 14.945 10.4099 14.7955 10.5734Z" fill="currentColor"/>
			</g>
			</svg>
            <!-- <img src="@/assets/img/more.svg" class="w-6 h-6" alt="" @click="toPage('/TransformHis')" /> -->
        </template>
    </van-nav-bar>
    <div class="recharge-page overflow-auto flex-auto" v-if="tabActive === 1">
        <MyInput isBlock v-model="fromData.accountLabel" :placeholder="$t('transform.pla1')" :errorObj="errorObj"
            propName="account" readonly isSelect :dataList="accountList1" @selectChange="accountChange"
            :title="$t('transform.title1')"></MyInput>
		
		
		<div class="w-8 h-8 mt-7 mb-7 ml-auto mr-auto" alt="" @click="change" >
			<svg class="lang-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g id="Frame">
			<path id="Vector" d="M4.93572 17.1941C5.48451 17.1941 5.8988 17.6283 5.9503 18.201L5.95491 18.3255C5.97834 18.3435 5.99717 18.3669 6.00986 18.3936C6.02255 18.4203 6.02874 18.4496 6.02793 18.4792C6.78732 22.8642 11.243 26.3268 15.9992 26.3268C20.7416 26.3268 25.1404 22.878 25.9014 18.4846C25.9194 18.3783 25.97 18.2803 26.0461 18.204C26.1223 18.1277 26.2202 18.077 26.3264 18.0588L26.4079 18.0511H27.5631C27.8813 18.0511 28.0889 18.3355 28.0397 18.6452C27.1881 24.1754 21.8116 28.5028 15.9301 28.5028C12.1338 28.5028 8.35685 26.6742 5.95491 23.7496V25.2046C5.95491 25.7565 5.56368 26.1639 5.00259 26.2146L4.93572 26.2161L4.90113 26.2192L4.82196 26.2138C4.29546 26.1677 3.8535 25.8149 3.7874 25.3115L3.78125 25.2046V18.3047C3.78125 17.7513 4.23012 17.2648 4.79429 17.2002L4.90113 17.1956L4.93572 17.1941ZM16.0561 3.49725C19.8677 3.49725 23.6447 5.33887 26.0428 8.27654V6.64245C26.0428 6.07828 26.4425 5.5756 26.9705 5.50412L27.0712 5.4949H27.1004L27.1942 5.50258C27.7422 5.57099 28.2157 6.08289 28.218 6.64014V13.54C28.218 14.1257 27.6984 14.517 27.0735 14.517H27.0143C26.4486 14.517 25.9921 14.135 25.9352 13.5985C25.9221 13.5827 25.9124 13.5644 25.9068 13.5447L25.8622 13.2987C24.9944 9.00672 20.6632 5.67091 16.0008 5.67091C11.2569 5.67091 6.85573 9.12125 6.09633 13.5124C6.07731 13.6331 6.01585 13.7431 5.92301 13.8225C5.83016 13.902 5.71202 13.9457 5.58981 13.9459H4.43535C4.11637 13.9459 3.90269 13.6623 3.95112 13.3517C4.80582 7.82305 10.1792 3.49725 16.0561 3.49725Z" fill="currentColor"/>
			<g id="Vector_2">
			<path d="M14.2322 17.48V15.6492C14.2325 15.5805 14.2141 15.5138 14.1789 15.4548C14.1437 15.3959 14.0931 15.3476 14.0326 15.3153C13.972 15.283 13.9038 15.2677 13.8352 15.2713C13.7666 15.2749 13.7003 15.2971 13.6434 15.3356L10.4498 18.0934C10.4118 18.1335 10.3831 18.1815 10.3656 18.234C10.3481 18.2864 10.3423 18.3421 10.3486 18.397C10.3549 18.4519 10.3731 18.5048 10.402 18.552C10.4309 18.5991 10.4698 18.6393 10.5159 18.6698L13.6219 21.3562C13.8955 21.5429 14.2322 21.3615 14.2322 21.0587V19.656H21.136C21.4195 19.6484 21.6889 19.5305 21.8868 19.3273C22.0847 19.1241 22.1954 18.8516 22.1954 18.568C22.1954 18.2843 22.0847 18.0119 21.8868 17.8087C21.6889 17.6055 21.4195 17.4875 21.136 17.48H14.2322Z" fill="#0CAF60"/>
			<path d="M18.8608 10.1612L18.8301 10.1489C18.5887 10.0713 18.3382 10.2519 18.3382 10.5102V12.0559H11.4321L11.3268 12.0612C10.7665 12.1212 10.3438 12.5877 10.3438 13.1435C10.344 13.432 10.4587 13.7086 10.6628 13.9125C10.8669 14.1165 11.1436 14.231 11.4321 14.231H18.3359V15.9197L18.3436 15.9935C18.4204 16.2687 18.7094 16.3801 18.9246 16.2348L22.1083 13.4832C22.2758 13.2895 22.2428 13.0289 22.0568 12.9013L18.9485 10.2127L18.8608 10.1612Z" fill="#0CAF60"/>
			</g>
			</g>
			</svg>
		</div>
			
			
        <!-- <img src="./img/btn3.svg" class="w-8 h-8 mt-7 mb-7 ml-auto mr-auto" alt="" @click="change" /> -->
        <MyInput isBlock v-model="fromData.accountLabel1" :placeholder="$t('transform.pla2')" :errorObj="errorObj"
            propName="account1" readonly isSelect :dataList="accountList2" @selectChange="accountChange1"
            :title="$t('transform.title1')"></MyInput>
        <MyInput isBlock v-model="fromData.amountKeyLabel" :placeholder="$t('transform.pla3')" :errorObj="errorObj"
            propName="password" readonly :label="$t('transform.label3')"></MyInput>
        <MyInput isBlock v-model="fromData.amount" :placeholder="$t('transform.pla4')" :errorObj="errorObj"
            propName="amount" isLast :label="$t('transform.label4')">
            <template #right>
                <span class="all-btn" @click="fromData.amount = noChanTotal">{{
                    $t('contractOpe.bond.all')
                    }}</span></template>
        </MyInput>
        <div class="tip">
            <div class="c-label">{{ $t('transform.tip1') }}</div>
            <span class="is-num">{{ total }} USD</span>
        </div>
    </div>
    <Exchange v-if="tabActive === 2" />
    <div class="c-footer" v-if="tabActive === 1">
        <MyButton :disabled="isDisabled" :clickFn="sureHandle">{{
            $t('transform.btn1')
            }}</MyButton>
    </div>
</template>

<style scoped lang="scss">
	.lang-icon {
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.recharge-page {
    padding: 24px 16px;
}

.tip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    // color: #fff;
	color: var(--text-color);
    font-family: 'PingFang SC';
    font-size: 14px;
    font-style: normal;
    line-height: normal;
    margin-top: 16px;

    .is-num {
        font-family: DIN;
        font-weight: 500;
    }
}

.all-btn {
    font-weight: 400;
    font-size: 15px;
    color: #00b481;
    line-height: 18px;
    margin-left: 12px;
}
</style>
