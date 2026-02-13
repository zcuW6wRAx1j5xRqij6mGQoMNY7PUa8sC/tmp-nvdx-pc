<script setup>
import { getRechargeCoinListApi, requestWalletAddress, rechargeApi } from '@/api/my'
import { useDisabled } from '@/hooks/useDisabled'
import useUpload from '@/hooks/useUpload'
import { setBaseUrl, baseUrl } from '@/utils/utils'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import VueQr from 'vue-qrcode'
import copy from '@/utils/copy.js'

const uploadFile = useUpload()
const isGet = ref(false)
const codeUrl = ref({})
const fromData = reactive({
    coin_id: '',
    wallet_id: '',
    coin_label: '',
    child_name: '',
    child_address: '',
    amount: '',
    voucher: '',
})
const isDisabled = useDisabled(fromData)
const currencyList = ref([])
const childList = ref([])

onMounted(() => {
    initDepositData()
})

const initDepositData = () => {
    const block = coinSelect.value.block
    getRechargeCoinListApi().then(data => {
        // coin_id相等的时候 coin_block字段添加到对象的children
        let currency = {}
        data.forEach(el => {
            if (block?.wallet_id && el.platform_wallet_id === block.wallet_id) {
                coinSelect.value.block = getChildData(el)
            }
            if (currency[el.coin_id]) {
                currency[el.coin_id].children.push(getChildData(el))
            } else {
                currency[el.coin_id] = {
                    id: el.coin_id,
                    name: el.coin_name,
                    address: el.address,
                    wallet_id: el.platform_wallet_id,
                    children: [getChildData(el)],
                }
            }
        })
        currencyList.value = Object.values(currency)
        if (coinSelect.value.coin) {
            selectChange('', coinSelect.value.coin, false)
            selectChildChange('', coinSelect.value.block)
        } else {
            selectChange('', currencyList.value[0], false)
            selectChildChange('', currencyList.value[0].children[0])
        }
    }).finally(() => {
        isLoading.value = false
    })
}

const getChildData = (res) => {
    const item = {
        id: res.coin_id,
        name: res.coin_block,
        address: res.address,
        wallet_id: res.platform_wallet_id
    }
    return item
}

const errorObj = ref({})
const coinSelect = ref({})
// 1级选择
const selectChange = (_, item, status = true) => {
    fromData.coin_id = item.id
    fromData.coin_label = item.name
    childList.value = item.children
    fromData.child_name = ''
    fromData.wallet_id = ''

    codeUrl.value = ''
    isGet.value = !status
    coinSelect.value.coin = item

    if (status) {
        selectChildChange('', item.children[0])
    }
}

// 2级选择
const selectChildChange = (_, item) => {
    fromData.child_name = item.name
    fromData.child_address = item.address
    codeUrl.value = item.address
    fromData.wallet_id = item.wallet_id
    isGet.value = item.address ? true : false

    coinSelect.value.block = item
}

const isDeposit = computed(() => {
    return !(fromData.coin_id && fromData.wallet_id)
})

const isLoading = ref(true)

const callWalletAddress = () => {
    if (isLoading.value) {
        return
    }
    isLoading.value = true
    requestWalletAddress({
        wallet_id: fromData.wallet_id,
    }).then(data => {
        initDepositData()
        selectChange('', coinSelect.value.coin, false)
        selectChildChange('', coinSelect.value.block)
        isGet.value = true
    }).catch(() => {
        isLoading.value = false
    })
}

// 凭证上传（参考 RealName.vue）
const beforeRead = file => {
    uploadFile(file).then(data => {
        if (data) fromData.voucher = data
    })
    return false
}

const isDepositSubmitDisabled = computed(() => {
    return !(Number(fromData.amount) > 0 && fromData.coin_id && fromData.voucher)
})

const submitDeposit = () => {
    if (isDepositSubmitDisabled.value) return
    const voucherUrl = fromData.voucher 
    rechargeApi({
        amount: Number(fromData.amount),
        coin_id: fromData.coin_id,
        voucher: voucherUrl,
    })
        .then(() => {
            router.push('/RechargeHistory')
        })
        .catch(err => {
            errorObj.value = err
        })
}

const toPage = path => {
    router.push(path)
}
</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top :title="$t('recharge.title')" left-arrow @click-left="$router.back()" fixed
        placeholder>
        <template #right>
            <!-- <img src="../transaction/img/right.svg" class="h-6 w-6" @click="toPage('/RechargeHistory')" /> -->
			<svg class="lang-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" @click="toPage('/RechargeHistory')">
			<g id="&#231;&#148;&#179;&#232;&#180;&#173;&#232;&#174;&#176;&#229;&#189;&#149;">
			<path id="Vector" d="M4.48096 20.6255L4.47344 4.4668H6.9873V5.29389C6.9873 6.21957 7.73503 6.97314 8.65486 6.97314H15.3451C15.7888 6.97115 16.2136 6.79322 16.5262 6.4784C16.8388 6.16357 17.0138 5.73757 17.0127 5.29389V4.4668L19.519 4.46011L19.5257 20.6188L4.48096 20.6255ZM15.3418 3.6397L15.3451 5.30225L8.6582 5.29389V3.6397L8.65486 3.63135L15.3418 3.6397ZM19.5149 2.7959H16.7788C16.4897 2.29881 15.9584 1.96045 15.3451 1.96045H8.65486C8.04164 1.96045 7.51113 2.29797 7.22123 2.7959H4.47344C4.03227 2.79634 3.60932 2.97185 3.29744 3.28388C2.98557 3.5959 2.81028 4.01895 2.81006 4.46011V20.6255C2.81006 21.5428 3.55695 22.2897 4.47427 22.2897H19.5257C19.9669 22.289 20.3898 22.1135 20.7018 21.8015C21.0137 21.4896 21.1893 21.0667 21.1899 20.6255V4.46011C21.1882 4.0174 21.0108 3.59348 20.6967 3.28145C20.3826 2.96942 19.9576 2.79479 19.5149 2.7959Z" fill="currentColor"/>
			<path id="Vector_2" d="M14.7955 10.5734L10.8338 14.9044L9.21214 13.0873C9.06458 12.922 8.85739 12.8221 8.63616 12.8095C8.41493 12.797 8.19778 12.8729 8.03249 13.0204C7.8672 13.168 7.76729 13.3752 7.75476 13.5964C7.74222 13.8176 7.81808 14.0348 7.96565 14.2001L10.203 16.7064C10.2808 16.7936 10.376 16.8634 10.4825 16.9115C10.589 16.9596 10.7044 16.9848 10.8212 16.9855H10.8262C11.0602 16.9855 11.2841 16.8869 11.4428 16.7139L16.0286 11.7012C16.1781 11.5377 16.2566 11.3215 16.2467 11.1001C16.2369 10.8787 16.1395 10.6703 15.9759 10.5208C15.8124 10.3712 15.5962 10.2927 15.3748 10.3026C15.1534 10.3125 14.945 10.4099 14.7955 10.5734Z" fill="currentColor"/>
			</g>
			</svg>
        </template>
    </van-nav-bar>
    <div class="withdrawal overflow-auto flex-auto">
        <MyInput isBlock :modelValue="fromData.coin_label" :placeholder="$t('withdrawal.pla1')"
            :label="$t('withdrawal.label1')" :errorObj="errorObj" propName="coin_id" readonly isSelect
            :dataList="currencyList" @selectChange="selectChange" :disabled="isLoading"></MyInput>
        <MyInput isBlock :modelValue="fromData.child_name" :placeholder="$t('recharge.pla2')"
            :label="$t('recharge.pla2')" :errorObj="errorObj" propName="coin_id" readonly isSelect :dataList="childList"
            @selectChange="selectChildChange" :disabled="isLoading"></MyInput>
          <!-- 已有地址时：填写金额、上传凭证并提交 -->
        <div v-if="isGet" class="recharge-form">
            <MyInput
                v-model="fromData.amount"
                type="number"
                :placeholder="$t('recharge.amountPlaceholder')"
                :label="$t('recharge.amountLabel')"
                :errorObj="errorObj"
                propName="amount"
            />
            <div class="recharge-voucher">
                <van-uploader :before-read="beforeRead" reupload max-count="1">
                    <div class="c-card-title recharge-voucher-title">
                        {{ $t('recharge.voucherLabel') }}
                        <span class="c-tip" v-if="fromData.voucher">{{ $t('my.reUpload') }}</span>
                    </div>
                    <img
                        v-if="fromData.voucher"
                        :src="setBaseUrl(fromData.voucher)"
                        alt=""
                        class="upload-img"
                    />
                    <div v-else class="upload">
                        <img src="./img/upload.svg" class="upload-icon" alt="" />
                    </div>
                </van-uploader>
            </div>
        </div>   
        <div class="flex flex-col items-center justify-center">
            <div class="has-addres flex flex-col items-center justify-center" v-if="isGet">
                <div class="title-tip">{{ $t('tipAll.tip1') }} <b>{{ fromData.child_name }}</b> {{ $t('tipAll.tip2') }}
                </div>
                <VueQr v-if="codeUrl" :quality="1" class="code-img" :value="codeUrl"></VueQr>
                <div class="address">{{ $t('recharge.address') }}</div>
                <div class="address-value">{{ codeUrl }}</div>
            </div>
            <div v-else>
                <img src="./img/no-address.svg" class="no-address-icon" alt="" />
                <div class="no-address-title">{{ $t('recharge.noAddressTitle') }}</div>
                <div class="no-address-tip">{{ $t('recharge.noAddressTip') }}</div>
            </div>

        </div>
        <div v-html="$t('recharge.imTip', { coinValue: fromData.child_name })" class="recharge-im-tip"></div>

       
    </div>
    <div class="recharge-footer">
        <MyButton v-if="!isGet" type="yellow" :disabled="isDeposit" @click="callWalletAddress">
            {{ $t('recharge.getAddress') }}
        </MyButton>
        <div v-if="isGet" class="flex gap-2">
            <MyButton type="green" class="flex-auto" :disabled="isDisabled" @click="copy(codeUrl, $t('common.copySuccess'))" >
                {{ $t('recharge.copy') }}
            </MyButton>
            <MyButton type="yellow" class="flex-auto" :disabled="isDepositSubmitDisabled" @click="submitDeposit">
                {{ $t('recharge.submit') }}
            </MyButton>
        </div>
    </div>
</template>

<style scoped lang="scss">
	.lang-icon {
		
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.withdrawal {
    padding: 24px 16px;
}

.recharge-im-tip {
    color: #969799;
    font-size: 14px;
    line-height: 1.5;
    margin-top: 16px;
}

.recharge-form {
}

.recharge-voucher {
    margin-top: 20px;
}

.recharge-voucher-title {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.recharge-footer {
    padding: 16px 20px 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.recharge-btn-copy {
    margin-bottom: 0;
}

.code-img {
    min-width: 200px;
    min-height: 200px;
    border-radius: 8px;
}

.van-popup {
    background-color: transparent;
}

.title-tip {
    font-weight: 400;
    font-size: 16px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 18px;
    text-align: center;
    font-style: normal;
    text-transform: none;
    margin-bottom: 12px;
    margin-top: 16px;
}

.address {
    font-weight: 500;
    font-size: 14px;
    color: #8b939a;
    line-height: 20px;
    text-align: center;
    font-style: normal;
    text-transform: none;
    margin-top: 16px;
    width: 100%;
    text-align: center;
}

.address-value {
    font-weight: 400;
    font-size: 14px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 20px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    text-align: center;
    width: 100%;
    padding: 0 18px;
    margin-top: 10px;
}

.no-address-icon {
    // 居中显示 , 白色
    // display: block;
    // color: #ffffff;
	color: var(--text-color);
    margin: 0 auto;
    width: 50px;
    height: 50px;
    margin-top: 50px;
}

.no-address-title {
    font-weight: 600;
    font-size: 16px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 22px;
    text-align: center;
    font-style: normal;
    text-transform: none;
    margin-top: 20px;
}

.no-address-tip {
    font-weight: 400;
    font-size: 14px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 20px;
    text-align: center;
    font-style: normal;
    text-transform: none;
    margin-top: 10px;
    width: 280px;
}

/* 凭证上传（与 RealName 一致） */
.upload {
    width: 100%;
    height: 130px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #4a575e;
}
.upload-img {
    max-width: 100%;
    max-height: 80px;
    border-radius: 8px;
    margin: 0 auto;
}
.upload-icon {
    width: 30px;
    height: 30px;
}
.van-uploader {
    display: flex;
    :deep(.van-uploader__wrapper),
    :deep(.van-uploader__input-wrapper) {
        width: 100%;
    }
}
</style>
