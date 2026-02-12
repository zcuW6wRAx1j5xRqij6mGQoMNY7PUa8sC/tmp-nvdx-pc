<script setup>
import { useI18n } from 'vue-i18n'
import { getIEOListApi, buyIEOApi } from '@/api/data'
import useList from '@/hooks/useList'
import { friendlyNumber, setBaseUrl, divide, multiply, percentage } from '@/utils/utils'
import dayjs from 'dayjs'
import { showSuccessToast, showLoadingToast } from 'vant'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const { t } = useI18n()
const toPage = url => {
    router.push(url)
}
const { showList, loading, finished, onLoad, initData } = useList(getIEOListApi, {
    isNoPage: true,
})
const showInfoList = computed(() => {
    return [
      
        {
            key: 'min_order_price',
            name: t('ieo.tab1.label3'),
            isFull: true,
            cb: data => {
                return `${friendlyNumber(data.min_order_price)}-${friendlyNumber(data.max_order_price)}`
            },
        },
        {
            key: 'total_supply',
            name: t('ieo.tab1.label1'),
            cb: data => {
                return friendlyNumber(data.total_supply)
            },
        },
        {
            key: 'unit_price',
            name: t('ieo.tab1.label2'),
            cb: data => {
                return friendlyNumber(data.unit_price)
            },
        },

        {
            key: 'order_start_time',
            name: t('ieo.tab1.label5'),
            cb: data => {
                return dayjs(data.order_start_time).format('YYYY.MM.DD HH:mm:ss')
            },
        },
        {
            key: 'order_end_time',
            name: t('ieo.tab1.label6'),
            cb: data => {
                return dayjs(data.order_end_time).format('YYYY.MM.DD HH:mm:ss')
            },
        },
        {
            key: 'public_time',
            name: t('ieo.tab1.label7'),
            cb: data => {
                return dayjs(data.public_time).format('YYYY.MM.DD HH:mm:ss')
            },
        },
        {
            key: 'release_time',
            name: t('ieo.tab1.label8'),
            cb: data => {
                return dayjs(data.release_time).format('YYYY.MM.DD HH:mm:ss')
            },
        },
        {
            key: 'white_paper',
            name: t('ieo.tab1.label9'),
            slot: true,
        },
        {
            key: 'forecast_earnings',
            name: t('ieo.tab1.label11'),
            cb: data => {
                return `${percentage(data.forecast_earnings, false)}%`
            },
        },
        {
            key: 'processing',
            name: t('ieo.tab1.label4'),
            slot: true,
            isWarp: true,
        },
    ]
})
const showItem = ref({})
const profitHeight = ref(0)
const profitAnchors = [0, Math.round(0.7 * window.innerHeight)]
const checkFrom = ref({
    amount: '',
})
// 买
const liClick = dataInfo => {
    showItem.value = dataInfo
    checkFrom.value.amount = ''
    profitHeight.value = profitAnchors[1]
}
const errorObj = ref({})
const profitChangeHandle = () => {
    showLoadingToast({})
    return buyIEOApi({
        id: showItem.value.id,
        amount: checkFrom.value.amount,
    })
        .then(() => {
            profitHeight.value = 0
            initData()
            showSuccessToast(t('common.opeSuccess'))
        })
        .catch(err => {
            console.log(err)
            errorObj.value = err
        })
}
const count = computed(() => {
    if (!checkFrom.value.amount) return 0
    return divide(checkFrom.value.amount, showItem.value.unit_price)
})
const openPDF = (dataInfo) => {
    if (dataInfo.pdf) {
        toPage(`/WebView?url=${dataInfo.pdf}`)
    }
}
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('ieo.title')"
        placeholder
        fixed
        left-arrow
        @click-left="$router.back()"
    >
        <template #right>
			<svg class="lang-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" @click="toPage('/IEOHis')">
			<g id="&#231;&#148;&#179;&#232;&#180;&#173;&#232;&#174;&#176;&#229;&#189;&#149;">
			<path id="Vector" d="M4.48096 20.6255L4.47344 4.4668H6.9873V5.29389C6.9873 6.21957 7.73503 6.97314 8.65486 6.97314H15.3451C15.7888 6.97115 16.2136 6.79322 16.5262 6.4784C16.8388 6.16357 17.0138 5.73757 17.0127 5.29389V4.4668L19.519 4.46011L19.5257 20.6188L4.48096 20.6255ZM15.3418 3.6397L15.3451 5.30225L8.6582 5.29389V3.6397L8.65486 3.63135L15.3418 3.6397ZM19.5149 2.7959H16.7788C16.4897 2.29881 15.9584 1.96045 15.3451 1.96045H8.65486C8.04164 1.96045 7.51113 2.29797 7.22123 2.7959H4.47344C4.03227 2.79634 3.60932 2.97185 3.29744 3.28388C2.98557 3.5959 2.81028 4.01895 2.81006 4.46011V20.6255C2.81006 21.5428 3.55695 22.2897 4.47427 22.2897H19.5257C19.9669 22.289 20.3898 22.1135 20.7018 21.8015C21.0137 21.4896 21.1893 21.0667 21.1899 20.6255V4.46011C21.1882 4.0174 21.0108 3.59348 20.6967 3.28145C20.3826 2.96942 19.9576 2.79479 19.5149 2.7959Z" fill="currentColor"/>
			<path id="Vector_2" d="M14.7955 10.5734L10.8338 14.9044L9.21214 13.0873C9.06458 12.922 8.85739 12.8221 8.63616 12.8095C8.41493 12.797 8.19778 12.8729 8.03249 13.0204C7.8672 13.168 7.76729 13.3752 7.75476 13.5964C7.74222 13.8176 7.81808 14.0348 7.96565 14.2001L10.203 16.7064C10.2808 16.7936 10.376 16.8634 10.4825 16.9115C10.589 16.9596 10.7044 16.9848 10.8212 16.9855H10.8262C11.0602 16.9855 11.2841 16.8869 11.4428 16.7139L16.0286 11.7012C16.1781 11.5377 16.2566 11.3215 16.2467 11.1001C16.2369 10.8787 16.1395 10.6703 15.9759 10.5208C15.8124 10.3712 15.5962 10.2927 15.3748 10.3026C15.1534 10.3125 14.945 10.4099 14.7955 10.5734Z" fill="currentColor"/>
			</g>
			</svg>
			
            <!-- <img src="./img/subscribe.svg" class="w-6 h-6" @click="toPage('/IEOHis')" /> -->
        </template>
    </van-nav-bar>

    <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="$t('common.noMore')"
        @load="onLoad"
        class="flex-auto overflow-auto p-4"
    >
        <MyShowInfo
            v-for="item in showList"
            titleLarge
            :key="item.id"
            :title="item.coin && item.coin.name"
            :infoList="showInfoList"
            :dataInfo="item"
        >
            <template #li="{ dataInfo, item }">
                
                <template v-if="item.key === 'processing'">
                    <van-progress
                    class="progress"
                    :show-pivot="false"
                    :percentage="+ Math.ceil(dataInfo.processing * 100 / dataInfo.total_supply)"
                    color="#FFAC2F"
                    track-color="#33434D"
                />
                <div>( {{ dataInfo.processing }} / {{ friendlyNumber(dataInfo.total_supply) }} )</div>
                </template>
                <div class="ml-auto to-detail" v-else @click="openPDF(dataInfo)">
                    {{ dataInfo.pdf ? $t('ieo.tab1.label10') : '-' }}
                </div>
            </template>
            <template #left>
                <img
                    v-if="item.coin && item.coin.logo"
                    :src="setBaseUrl(item.coin.logo)"
                    class="b-img"
                    alt=""
                />
            </template>
           
            <template #right>
                <div
                    class="c-status-box status ml-auto"
                    :class="[
                        item.status === 0
                            ? 'status-yellow'
                            : item.status === 1
                              ? 'status-green'
                              : item.status === 2
                                ? 'status-green'
                                : 'status-grey',
                    ]"
                >
                    {{
                        item.status === 0
                            ? $t('ieo.status1')
                            : item.status === 1
                              ? $t('ieo.status2')
                              : item.status === 2
                                ? $t('ieo.status3')
                                : $t('ieo.status5')
                    }}
                </div>
            </template>
            <template #ope>
                <MyButton
                    size="large"
                    class="mt-4"
                    :disabled="item.status !== 1"
                    @click="liClick(item)"
                    >{{ $t('ieo.btn') }}</MyButton
                >
            </template>
        </MyShowInfo>
    </van-list>
    <!-- 止盈止损 -->
    <van-overlay :show="profitHeight > 0">
        <van-floating-panel v-model:height="profitHeight" :anchors="profitAnchors">
            <div class="p-4 pb-8 h-full flex flex-col">
                <div class="c-normal-title">{{ $t('ieo.label1') }}</div>
                <MyInput
                    v-model="checkFrom.amount"
                    :placeholder="`${friendlyNumber(showItem.min_order_price)}-${friendlyNumber(showItem.max_order_price)}`"
                    :errorObj="errorObj"
                    propName="amount"
                    isSmall
                    type="digit"
                >
                </MyInput>
                <p class="mt-4 text-gray-400 flex items-center">
                    {{ $t('ieo.label2') }}: {{ friendlyNumber(showItem.unit_price) }}
                </p>
                <p class="mt-4 text-gray-400 flex items-center">
                    {{ $t('ieo.label3') }}: {{ count }}
                </p>
                <MyButton
                    size="large"
                    class="mt-4"
                    :disabled="!checkFrom.amount"
                    :clickFn="profitChangeHandle"
                    >{{ $t('contractOpe.profit.btn1') }}</MyButton
                >
            </div>
        </van-floating-panel>
    </van-overlay>
</template>
<style scoped>
	.lang-icon {
		width: 24px;
		height: 24px;
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.status {
    font-weight: 500;
    border-radius: 6px;
    color: #fff ;
}

:deep(.is-few .van-tab) {
    margin-right: 12px !important;
}

:deep(.van-nav-bar__title) {
    min-width: 100%;
}
.progress {
    width: 100%;
    flex: auto;
    margin-bottom: 12px;
    margin-top: 12px;
    overflow: hidden;
}
:deep(.show-slot) {
    flex: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.to-detail{
    color: #FFAC2F;
    font-size: 12px;
    font-weight: 500;
}
</style>
