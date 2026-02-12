<script setup>
import { useI18n } from 'vue-i18n'
import { getSpotOrderApi, cancelSpotOrderApi } from '@/api/data'
import useList from '@/hooks/useList'
import { friendlyNumber, setBaseUrl, usdcToUsd } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { watch } from 'vue'
import { useBalance } from '@/hooks/useBalance'
import dayjs from 'dayjs'
import { showSuccessToast, showLoadingToast } from 'vant'
const { walletInfo, getWalletData } = useBalance()

// isRefresh 监听属性isRefresh刷新
const props = defineProps({
    isRefresh: {
        type: Boolean,
        default: false,
    },
    spotId: {
        type: Number,
        default: '',
    },
    setSub: {
        type: Function,
        default: () => { },
    },
})
watch(
    () => props.isRefresh,
    () => {
        resetData()
    },
)
watch(
    () => props.spotId,
    () => {
        checked.value = false
        resetData()
    },
)
function socketHandle (data) {
    let eventName = data.data?.event
    if (eventName === 'refresh') {
        resetData()
    }
    // if (eventName === 'order_margin_ratio') {
    //     let socketData = data.data.payload || {}
    //     orderMap.value[socketData.order_id] = socketData
    // }
}
onMounted(() => {
    props.setSub(
        `person:${localStorage.getItem('uid')}`,
        socketHandle,
        localStorage.getItem('ws_channel_token'),
    )
})
const { t } = useI18n()
const router = useRouter()
// 类型
const searchList = computed(() => {
    return [
        {
            name: t('spotOpe.tab.tab1'),
            id: 0,
        },
        {
            name: t('spotOpe.tab.tab2'),
            id: 1,
        },
    ]
})
const activeTab = ref(0)
const searchChange = id => {
    activeTab.value = id
}
const checked = ref(false)
const { showList, loading, finished, onLoad, initData } = useList(getSpotOrderApi, {
    status: 'pending',
    isNoPage: true,
})
const showInfoList = computed(() => {
    return [
        {
            key: 'quantity',
            nameCb: data => {
                return `${t('spotOpe.info.amount')}(${data.name.split('/')[0]})`
            },
            cb: data => {
                return friendlyNumber(data.volume)
            },
        },
        {
            key: 'volume',
            nameCb: data => {
                return `${t('spotOpe.info.exchangeAmount')}(${usdcToUsd(data.name.split('/')[1])})`
            },
            cb: data => {
                return friendlyNumber(data.trade_volume)
            },
        },
        {
            key: 'price',
            name: t('spotOpe.info.price'),
            cb: data => {
                return friendlyNumber(data.price)
            },
        },
    ]
})
const toPage = (path, query) => {
    router.push({ path, query })
}
const emit = defineEmits(['cancel'])
// 取消

const cancelHandle = data => {
    showLoadingToast({})
    cancelSpotOrderApi({ order_id: data.id }).then(() => {
        resetData()
        showSuccessToast(t('common.opeSuccess'))
        emit('cancel')
    })
}
const changeCheck = val => {
    checked.value = val
    resetData()
}
function resetData() {
    initData({
        spot_id: checked.value ? props.spotId : undefined,
    })
    getWalletData(1)
}
</script>
<!--  -->
<template>
    <div class="flex-shrink-0 p-4 pt-1">
        <div class="mb-4 flex items-center justify-between">
            <MyTab
                :tabList="searchList"
                :tabActive="activeTab"
                @tabChange="searchChange"
                class="flex-auto"
                isFew
                isShrink
            ></MyTab>
            <!-- <img src="../img/right.svg" class="w-6 h-6" alt="" @click="toPage('/SpotOrder')" /> -->
			<svg class="lang-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" @click="toPage('/SpotOrder')">
			<g id="&#231;&#148;&#179;&#232;&#180;&#173;&#232;&#174;&#176;&#229;&#189;&#149;">
			<path id="Vector" d="M4.48096 20.6255L4.47344 4.4668H6.9873V5.29389C6.9873 6.21957 7.73503 6.97314 8.65486 6.97314H15.3451C15.7888 6.97115 16.2136 6.79322 16.5262 6.4784C16.8388 6.16357 17.0138 5.73757 17.0127 5.29389V4.4668L19.519 4.46011L19.5257 20.6188L4.48096 20.6255ZM15.3418 3.6397L15.3451 5.30225L8.6582 5.29389V3.6397L8.65486 3.63135L15.3418 3.6397ZM19.5149 2.7959H16.7788C16.4897 2.29881 15.9584 1.96045 15.3451 1.96045H8.65486C8.04164 1.96045 7.51113 2.29797 7.22123 2.7959H4.47344C4.03227 2.79634 3.60932 2.97185 3.29744 3.28388C2.98557 3.5959 2.81028 4.01895 2.81006 4.46011V20.6255C2.81006 21.5428 3.55695 22.2897 4.47427 22.2897H19.5257C19.9669 22.289 20.3898 22.1135 20.7018 21.8015C21.0137 21.4896 21.1893 21.0667 21.1899 20.6255V4.46011C21.1882 4.0174 21.0108 3.59348 20.6967 3.28145C20.3826 2.96942 19.9576 2.79479 19.5149 2.7959Z" fill="currentColor"/>
			<path id="Vector_2" d="M14.7955 10.5734L10.8338 14.9044L9.21214 13.0873C9.06458 12.922 8.85739 12.8221 8.63616 12.8095C8.41493 12.797 8.19778 12.8729 8.03249 13.0204C7.8672 13.168 7.76729 13.3752 7.75476 13.5964C7.74222 13.8176 7.81808 14.0348 7.96565 14.2001L10.203 16.7064C10.2808 16.7936 10.376 16.8634 10.4825 16.9115C10.589 16.9596 10.7044 16.9848 10.8212 16.9855H10.8262C11.0602 16.9855 11.2841 16.8869 11.4428 16.7139L16.0286 11.7012C16.1781 11.5377 16.2566 11.3215 16.2467 11.1001C16.2369 10.8787 16.1395 10.6703 15.9759 10.5208C15.8124 10.3712 15.5962 10.2927 15.3748 10.3026C15.1534 10.3125 14.945 10.4099 14.7955 10.5734Z" fill="currentColor"/>
			</g>
			</svg>
        </div>
        <div class="flex justify-between items-center mb-4 mt-6" v-show="activeTab === 0">
            <van-checkbox v-model="checked" checked-color="#1EB576" @change="changeCheck">
                <template #icon="props">
                    <img class="w-4 h-4" v-if="props.checked" src="../img/check.svg" />
                    <img class="w-4 h-4" v-if="!props.checked" src="../img/check-no.svg" />
                </template>
                {{ $t('spotOpe.hidden') }}
            </van-checkbox>
            <!-- <div class="all-cancel">{{ $t('spotOpe.allCancel') }}</div> -->
        </div>
        <NoData
            v-if="
                (!showList.length && activeTab === 0) ||
                (activeTab === 1 && walletInfo.coins.items.length === 0)
            "
            style="padding: 0"
        ></NoData>
        <van-list
            v-else-if="activeTab === 0"
            v-model:loading="loading"
            :finished="finished"
            :finished-text="$t('common.noMore')"
            @load="onLoad"
            class="overflow-auto"
        >
            <MyShowInfo
                v-for="item in showList"
                :key="item.id"
                :title="usdcToUsd(item.name)"
                :infoList="showInfoList"
                :dataInfo="item"
                isInline
            >
                <div class="flex mt-3">
                    <div
                        class="c-order-tip-box"
                        :class="[item.trade_type === 'limit' ? 'green' : 'red']"
                    >
                        {{
                            item.trade_type === 'limit'
                                ? $t('spotOpe.order.order1')
                                : $t('spotOpe.order.order2')
                        }}
                    </div>
                    <div class="c-order-tip-box" :class="[item.side === 'buy' ? 'green' : 'red']">
                        {{
                            item.side === 'buy'
                                ? $t('spotOpe.type.type1')
                                : $t('spotOpe.type.type2')
                        }}
                    </div>
                    <div class="c-order-tip-box">
                        {{ dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss') }}
                    </div>
                </div>
                <template #right>
                    <div class="cancel" @click="cancelHandle(item)">{{ $t('spotOpe.cancel') }}</div>
                </template>
            </MyShowInfo>
        </van-list>
        <template v-else>
            <div v-for="item in walletInfo.coins.items" :key="item.id" class="b-title mb-7">
                <div class="b-title">
                    <img :src="setBaseUrl(item.logo)" v-if="item.logo" class="b-img" alt="" />
                    <span> {{ item.coin_name }}</span>
                    <span class="b-value">{{ friendlyNumber(item.amount,false,true) }}</span>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">
	.lang-icon {
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.all-cancel {
    font-weight: 400;
    font-size: 15px;
    color: #1EB576;
    line-height: 18px;
    text-align: right;
}
.cancel {
    margin-left: auto;
    background: #ffe63c;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 4px 13px;
    font-weight: 500;
    font-size: 12px;
    color: #2D2D2D;
    line-height: 14px;
    text-align: center;
    font-style: normal;
    text-transform: none;
}

.b-title {
    width: 100%;
    display: flex;
    align-items: center;
    // color: #fff;
	color: var(--text-color);
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
}
.b-value {
    font-family: DIN;
    font-weight: 500;
    font-size: 15px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 18px;
    margin-left: auto;
}
:deep(.van-tab) {
    margin-right: 30px !important;
}
</style>
