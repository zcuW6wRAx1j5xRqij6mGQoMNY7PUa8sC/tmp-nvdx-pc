<script setup>
import { ref, onMounted } from 'vue'
import { getSpotWalletApi, getContractWalletApi } from '@/api/my'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { friendlyNumber } from '@/utils/utils'
const router = useRouter()
const { t } = useI18n()
const tabList = computed(() => {
    return [
        { id: 0, name: t('wallet.tab1') },
        { id: 1, name: t('wallet.tab2') },
    ]
})

const activeTab = ref(0)
const walletInfo = ref({
    wallet: {},
    coins: [],
})
// 合约账户信息
const contractWallet = ref({})
const getData = () => {
    if (activeTab.value === 0) {
        getSpotWalletApi().then(data => {
            walletInfo.value = data || {
                wallet: {},
                coins: [],
            }
        })
    } else {
        getContractWalletApi().then(data => {
            contractWallet.value = data || {}
        })
    }
}
onMounted(getData)
const tabChange = item => {
    activeTab.value = item
    getData()
}

const walletList = computed(() => {
    return [
        {
            name: t('walletInfo.label1'),
            key: 'amount',
        },
        {
            name: t('walletInfo.label2'),
            key: 'usdt_value',
        },
    ]
})
const toPage = (path, query = {}) => {
    if (path === '/Trading') {
        if (activeTab.value === 0) {
            router.push('/TradingOne')
        } else {
            router.push('/TradingTwo')
        }
        return
    }
    router.push({
        path,
        query,
    })
}
const contractWalletList = computed(() => {
    return [
        {
            name: t('my.contractWallet.wallet1'),
            key: 'balance',
        },
        {
            name: t('my.contractWallet.wallet2'),
            key: 'lock_balance',
        },
        {
            name: t('my.contractWallet.wallet3'),
            key: 'trade_balance',
        },
        {
            name: t('my.contractWallet.wallet4'),
            key: 'floating_profit',
        },
    ]
})
</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top left-arrow @click-left="$router.back()" fixed placeholder>
        <template #title>
            <MyTab :tabList="tabList" :tabActive="+activeTab" @tabChange="tabChange"></MyTab>
        </template>
    </van-nav-bar>
    <div class="wallet-page overflow-auto flex-auto">
        <template v-if="activeTab === 0">
            <div class="c-card-box">
                <div class="price-box no-top-margin">
                    <div class="card-box">
                        <span class="price-tip flex items-center justify-between"
                            >{{ $t('walletInfo.tip1') }}
                            <!-- <span class="flex items-center" @click="toPage('/Trading')"
                            >{{ $t('walletInfo.detail') }}
                            <img src="./img/arrow.svg" class="w-2 h-2 ml-1" alt="" />
                        </span> -->
                        </span>
                        <div class="card-price big-txt">{{ friendlyNumber(walletInfo.total) }}</div>
                        <!-- <span class="price-tip"><span>≈61291.2000美元</span> </span> -->
                        <MyButton
                            size="mini"
                            isBlock
                            class="absolute right-2 bottom-2"
                            @click="toPage('/FinancialDetail', { type: activeTab })"
                            >{{ $t('walletInfo.detail1') }}</MyButton
                        >
                    </div>
                </div>
                <div class="btn-box">
                    <div class="btn-css" @click="toPage('/Recharge')">
                        <img src="./img/btn1.svg" class="svg-icon" alt="" />
                        {{ $t('my.btn1') }}
                    </div>
                    <div class="btn-css" @click="toPage('/Withdrawal')">
                        <img src="./img/btn2.svg" class="svg-icon" alt="" />
                        {{ $t('my.btn2') }}
                    </div>
                    <div class="btn-css" @click="toPage('/Transform')">
                        <img src="./img/wallet-btn.svg" class="svg-icon" alt="" />
                        {{ $t('walletInfo.btn') }}
                    </div>
                </div>
            </div>
            <div class="c-card-box" v-for="coin in walletInfo.coins" :key="coin.id">
                <div class="title">{{ coin.coin && coin.coin.name }}</div>
                <div class="price-box">
                    <div
                        class="card-box"
                        v-for="item in walletList"
                        :key="item.id"
                        :style="{ visibility: item.name ? 'visible' : 'hidden' }"
                    >
                        <span class="price-tip">{{ item.name }}</span>
                        <div class="card-price">
                            {{ friendlyNumber(coin[item.key]) || 0 }}
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="c-card-box">
                <div class="flex justify-end">
                    <MyButton
                        size="mini"
                        isInline
                        isBlock
                        @click="toPage('/FinancialDetail', { type: activeTab })"
                        >{{ $t('walletInfo.detail1') }}</MyButton
                    >
                </div>
                <div class="price-box">
                    <div class="card-box" v-for="item in contractWalletList" :key="item.id">
                        <span class="price-tip">{{ item.name }}</span>
                        <div
                            class="card-price"
                            :class="[
                                item.key === 'floating_profit' && contractWallet.floating_profit > 0
                                    ? 'status-green'
                                    : 'status-red',
                            ]"
                        >
                            {{ friendlyNumber(contractWallet[item.key] || 0) }}
                        </div>
                        <!-- <span class="price-tip">≈61291.2000美元</span> -->
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">
.wallet-page {
    padding: 24px 16px;
}
:deep(.van-nav-bar__title) {
    max-width: 100%;
}
.price-box {
    display: flex;
    margin-top: 6px;
    margin-left: -12px;
    flex-wrap: wrap;
    justify-content: space-between;
    &.no-top-margin {
        margin-top: -10px;
    }
    .card-box {
        position: relative;
        background-color: #1d262c;
        border-radius: 8px;
        margin-left: 12px;
        width: 40%;
        flex: auto;
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        padding: 8px 10px;
    }
    .title {
        color: #fff;
        font-family: 'PingFang SC';
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
    }
    .price-tip {
        color: #a1a1a1;
        font-family: 'PingFang SC';
        font-size: 10px;
        font-style: normal;
        line-height: normal;
        &.is-num {
            font-family: DIN;
            font-weight: 500;
        }
    }
    .card-price {
        color: #fff;
        font-family: DIN;
        font-size: 15px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        margin: 4px 0;
        &.big-txt {
            font-size: 20px;
        }
    }
}
.btn-box {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    margin-left: -8px;
    .svg-icon {
        width: 20px;
        height: 20px;
        margin-bottom: 8px;
    }
    .btn-css {
        width: 30%;
        flex: auto;
        position: relative;
        color: #fff;
        text-align: center;
        font-family: 'PingFang SC';
        font-size: 13px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 15.6px */
        background-color: #1d262c;
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-left: 8px;
    }
}
</style>
