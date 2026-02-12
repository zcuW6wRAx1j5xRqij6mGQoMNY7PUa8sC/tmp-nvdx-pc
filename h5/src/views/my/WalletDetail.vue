<script setup>
import { getWalletApi,getOptionsWalletApi } from '@/api/my'
import { useI18n } from 'vue-i18n'
import { setDataToNumber, setBaseUrl, friendlyNumber } from '@/utils/utils'
import { useBalance } from '@/hooks/useBalance'
import { useRouter } from 'vue-router'
import { closeToast, showLoadingToast } from 'vant'
const { t } = useI18n()
const router = useRouter()
const { getWalletData, walletInfo, contractWallet } = useBalance([1])
const wallet = ref({})
const optionsWallet = ref({})
function getImageUrl(imageName) {
    return new URL(`./img/${imageName}.svg`, import.meta.url).href
}
const tabList = computed(() => {
    return [
        // { id: 0, name: t('my.tab.tab1') },
        { id: 1, name: t('my.wallet2') },
        { id: 2, name: t('my.wallet3') },
        { id: 3, name: t('my.wallet6') },
    ]
})
const activeTab = ref(1)
const tabChange = id => {
    activeTab.value = id
    getWalletData(id)
}
onMounted(() => {
    showLoadingToast()
    // 钱包信息
    getWalletApi().then(data => {
        wallet.value = setDataToNumber(data || {})
    }).finally(() => {
        closeToast()
    })
    getOptionsWallet()
})

const getOptionsWallet = async () => {
    const res = await getOptionsWalletApi()
    optionsWallet.value = setDataToNumber(res || {})
}
const showName = ref(false)
const toPage = (path, query) => {
    // if (userInfo.value?.is_verified_identity === 0) {
    //     showName.value = true
    //     return
    // }
    router.push({
        path,
        query,
    })
}
const total = computed(() => {
    return activeTab.value === 0
        ? wallet.value.total
        : activeTab.value === 1
          ? walletInfo.value.total
          : activeTab.value === 3 
          ? (optionsWallet.value.balance || 0)
          : contractWallet.value.balance
})
// 币种信息
const infoList = computed(() => {
    return [
        {
            name: t('my.spotWallet.wallet1'),
            key: 'amount',
        },
        {
            name: t('my.spotWallet.wallet2'),
            key: 'lock_amount',
        },
        {
            name: t('my.spotWallet.wallet3'),
            key: 'usdt_value',
        },
    ]
})
</script>
<template>
            <MyTab
                isShrink
                :tabList="tabList"
                :tabActive="activeTab"
                @tabChange="tabChange"
                class="mt-4"
            ></MyTab>
    <div class="my-info">
        <div class="my-4">
            <div class="card-title">{{ t('my.wallet') }}(USD)</div>
            <div class="card-value" >{{ friendlyNumber(total || 0) }}</div>
        </div>
        <div class="my-4" v-if="activeTab === 0">
            <div class="card-title">{{ t('my.wallet5') }}(USD)</div>
            <div class="card-value">
                <span :class="[+wallet.total_profit >= 0 ? 'green-color' : 'red-color']">{{
                    wallet.total_profit || 0
                }}</span>
                USD
            </div>
        </div>
        <div class="my-4" v-if="activeTab === 2">
            <div class="card-title">{{ t('my.contractWallet.wallet2') }}(USD)</div>
            <div class="card-value">{{ friendlyNumber(contractWallet.lock_balance) }} </div>
        </div>
        <div class="my-4" v-if="activeTab === 3">
            <div class="card-title">{{ t('my.contractWallet.wallet2') }}(USD)</div>
            <div class="card-value">{{ friendlyNumber(optionsWallet.lock_balance) || 0 }} </div>
        </div>
        <template v-if="activeTab === 1">
            <MyShowInfo
                v-for="item in walletInfo.coins.items"
                :key="item.coin_id"
                :dataInfo="item"
                :infoList="infoList"
                :title="item.coin_name"
            >
                <template #left>
                    <img v-if="item.logo" :src="setBaseUrl(item.logo)" class="b-img" alt="" />
                </template>
            </MyShowInfo>
        </template>
    </div>
    <MyConfirm
        hideCancel
        v-model="showName"
        @confirm="$router.push('/RealName')"
        :content="$t('tipAll.tip')"
        :close-on-click-overlay="false"
    ></MyConfirm>
</template>
<style lang="scss" scoped>
.my-info {
    flex: auto;
    .card-title {
        font-weight: 400;
        font-size: 12px;
        color: #8b939a;
        line-height: 14px;
    }
    .card-value {
        font-family: DIN;
        font-weight: 500;
        font-size: 20px;
        // color: #ffffff;
		color: var(--text-color);
        line-height: 23px;
        margin-top: 12px;
    }
    :deep(.show-value) {
        font-size: 15px !important;
        line-height: 18px !important;
    }
}
.code {
    font-weight: 400;
    font-size: 12px;
    color: #8b939a;
    line-height: 14px;
    text-align: right;
    font-style: normal;
    text-transform: none;
    margin: 16px;
}
.btn-box {
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    padding-right: 0;
    .svg-icon {
        width: 32px;
        height: 32px;
        margin-bottom: 8px;
    }
    .btn-css {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 48px;
        flex: auto;
        // color: #fff;
		color: var(--text-color);
        text-align: center;
        font-family: 'PingFang SC';
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 15.6px */
        word-break: break-all;
    }
}
.is-few {
    justify-content: center !important;
}
</style>
