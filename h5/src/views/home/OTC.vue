<script setup>
import { useI18n } from 'vue-i18n'
import { getOTCListApi, otcTradeApi } from '@/api/data'
import useList from '@/hooks/useList'
import { friendlyNumber, setBaseUrl, subtract, multiply, percentage } from '@/utils/utils'
import dayjs from 'dayjs'
import { computed, nextTick } from 'vue'
import { useBalance } from '@/hooks/useBalance'
import { showLoadingToast, closeToast } from 'vant'
const { walletInfo } = useBalance([1], 1)
const balance = computed(() => {
    return friendlyNumber(walletInfo.value.total)
})
const { t } = useI18n()
const tabList = computed(() => {
    return [
        { id: 1, name: t('otc.tab1') },
        { id: 2, name: t('otc.tab2') },
    ]
})
const activeTab = ref(1)
const tabChange = id => {
    activeTab.value = id
}
const { showList, loading, finished, onLoad, initData } = useList(getOTCListApi, { isNoPage: true })
const showInfoList = computed(() => {
    return [
        {
            key: 'total_count',
            name: t('otc.label1'),
            cb: data => {
                return friendlyNumber(data.total_count)
            },
        },
        {
            key: 'success_rate',
            name: t('otc.label2'),
            cb: data => {
                return `${percentage(data.success_rate, false)}%`
            },
        },
        {
            key: 'total_amount',
            name: t('otc.label3'),
            cb: data => {
                return friendlyNumber(data.total_amount)
            },
        },
        {
            key: 'result_total_amount',
            name: t('otc.label4'),
            cb: data => {
                return activeTab.value === 1 ? `${friendlyNumber(data.min_limit)} - ${friendlyNumber(data.max_limit)}` : `${friendlyNumber(data.sell_min_limit)} - ${friendlyNumber(data.sell_max_limit)}`
            },
        },
        {
            key: 'buy_price',
            name: t('otc.label5'),
            cb: data => {
                return activeTab.value === 1 ? friendlyNumber(data.buy_price) : friendlyNumber(data.sell_price)
            },
        },
    ]
})

const opeShow = ref(false)
const opeItem = ref({})
const liClick = item => {
    step.value = 1
    errorObj.value = {}
    form.value.quantity = ''
    form.value.comments = ''
    opeItem.value = item
    opeShow.value = true
}
const form = ref({
    quantity: '',
    comments: '',
})
const step = ref(1)
const payPrice = computed(() => {
    const price = activeTab.value === 1 ? opeItem.value.buy_price : opeItem.value.sell_price
    return friendlyNumber(multiply(price, form.value.quantity))
})
const errorObj = ref({})
const opeHandle = () => {
    errorObj.value = {}
    if (activeTab.value === 1 && (+form.value.quantity < +opeItem.value.min_limit || +form.value.quantity > +opeItem.value.max_limit)) {
        errorObj.value.quantity = t('otc.form.error1')
        return
    }
    if (activeTab.value === 2 && (+form.value.quantity < +opeItem.value.sell_min_limit || +form.value.quantity > +opeItem.value.sell_max_limit)) {
        errorObj.value.quantity = t('otc.form.error1')
        return
    }
    showLoadingToast({
        forbidClick: true,
        loadingType: 'spinner',
        duration: 0,
    })

    otcTradeApi({
        quantity: form.value.quantity,
        product_id: opeItem.value.id,
        comments: form.value.comments,
        payment_method: opeItem.value.payment_method[0],
        trade_type: activeTab.value === 1 ? 'buy' : 'sell',
    }).then(() => {
        step.value = 2
    }).catch(err => {
        errorObj.value = err
    }).finally(() => {
        setTimeout(() => {
            closeToast()
        }, 1000)
    })
}
const toCustomer = () => {
    opeShow.value = false
    let dom = document.querySelector('.gQHKDl')
    if (dom) {
        dom.click()
    }
}
</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top placeholder fixed left-arrow @click-left="$router.back()">
        <template #title>
            <MyTab :tabList="tabList" :tabActive="activeTab" @tabChange="tabChange" class="pl-4"></MyTab>
        </template>
        <template #right>
			<svg class="lang-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" @click="$router.push('/OTCHis')">
			<g id="&#231;&#148;&#179;&#232;&#180;&#173;&#232;&#174;&#176;&#229;&#189;&#149;">
			<path id="Vector" d="M4.48096 20.6255L4.47344 4.4668H6.9873V5.29389C6.9873 6.21957 7.73503 6.97314 8.65486 6.97314H15.3451C15.7888 6.97115 16.2136 6.79322 16.5262 6.4784C16.8388 6.16357 17.0138 5.73757 17.0127 5.29389V4.4668L19.519 4.46011L19.5257 20.6188L4.48096 20.6255ZM15.3418 3.6397L15.3451 5.30225L8.6582 5.29389V3.6397L8.65486 3.63135L15.3418 3.6397ZM19.5149 2.7959H16.7788C16.4897 2.29881 15.9584 1.96045 15.3451 1.96045H8.65486C8.04164 1.96045 7.51113 2.29797 7.22123 2.7959H4.47344C4.03227 2.79634 3.60932 2.97185 3.29744 3.28388C2.98557 3.5959 2.81028 4.01895 2.81006 4.46011V20.6255C2.81006 21.5428 3.55695 22.2897 4.47427 22.2897H19.5257C19.9669 22.289 20.3898 22.1135 20.7018 21.8015C21.0137 21.4896 21.1893 21.0667 21.1899 20.6255V4.46011C21.1882 4.0174 21.0108 3.59348 20.6967 3.28145C20.3826 2.96942 19.9576 2.79479 19.5149 2.7959Z" fill="currentColor"/>
			<path id="Vector_2" d="M14.7955 10.5734L10.8338 14.9044L9.21214 13.0873C9.06458 12.922 8.85739 12.8221 8.63616 12.8095C8.41493 12.797 8.19778 12.8729 8.03249 13.0204C7.8672 13.168 7.76729 13.3752 7.75476 13.5964C7.74222 13.8176 7.81808 14.0348 7.96565 14.2001L10.203 16.7064C10.2808 16.7936 10.376 16.8634 10.4825 16.9115C10.589 16.9596 10.7044 16.9848 10.8212 16.9855H10.8262C11.0602 16.9855 11.2841 16.8869 11.4428 16.7139L16.0286 11.7012C16.1781 11.5377 16.2566 11.3215 16.2467 11.1001C16.2369 10.8787 16.1395 10.6703 15.9759 10.5208C15.8124 10.3712 15.5962 10.2927 15.3748 10.3026C15.1534 10.3125 14.945 10.4099 14.7955 10.5734Z" fill="currentColor"/>
			</g>
			</svg>
            <!-- <img src="./img/subscribe.svg" class="w-6 h-6" @click="$router.push('/OTCHis')" /> -->
        </template>
    </van-nav-bar>

    <van-list v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')" @load="onLoad"
        class="flex-auto overflow-auto p-4">
        <MyShowInfo v-for="item in showList" :key="item.id" :title="item.title" :infoList="showInfoList"
            :dataInfo="item">
            <template #right>
                <div class="text-tip">1{{ $t('otc.tip') }}</div>
            </template>
            <div class="flex items-center mt-1">
                <img src="./img/star.svg" v-for="i in 5" :key="i" class="star" alt="">
            </div>
            <template #ope>
                <MyButton size="large" class="mt-4" @click="liClick(item)">{{ activeTab === 1 ? $t('otc.tab1') :
                    $t('otc.tab2') }} USD</MyButton>
            </template>
        </MyShowInfo>
    </van-list>
    <van-popup position="bottom" v-model:show="opeShow" closeable round>
        <div class="pl-4 pt-5 pb-5 pr-4 h-full flex flex-col overflow-auto" ref="popup" @click.stop>
            <div class="c-normal-title font-medium">{{ $t('otc.tip1') }}</div>
            <template v-if="step === 1">
                <div class="flex items-center">
                    <div class="form-label">{{ activeTab === 1 ? `${t('otc.form.label1')}: ${friendlyNumber(opeItem.min_limit)} - ${friendlyNumber(opeItem.max_limit)}` : `${t('otc.form.label4')}: ${friendlyNumber(opeItem.sell_min_limit)} - ${friendlyNumber(opeItem.sell_max_limit)}` }}</div>
                    
                </div>
                <template v-if="activeTab === 1">
                    <MyInput isSmall :errorObj="errorObj" propName="quantity" v-model="form.quantity"
                        :placeholder="$t('otc.form.plaQuantity')" />
                </template>
                <template v-else>
                    <MyInput isSmall :errorObj="errorObj" propName="quantity" v-model="form.quantity"
                        :placeholder="$t('otc.form.plaQuantity')" />
                </template>
                <div class="form-label">USD{{ $t('otc.tip2') }} <span class="c-value">{{ balance }}</span>
                </div>
                <div class="flex items-center">
                    <div class="form-label">{{ activeTab === 1 ? $t('otc.form.label2') : $t('otc.form.label5') }}
                        <span class="c-value">{{
                            activeTab === 1 ? opeItem.buy_price : opeItem.sell_price }}</span>
                    </div>
                    <div class="form-label ml-auto">{{ activeTab === 1 ? $t('otc.form.label3') : $t('otc.form.label6')
                    }}(USD):<span class="c-is-num c-value green-color">{{ payPrice }}</span></div>
                </div>
                <div class="form-label">{{ $t('otc.form.label7') }}</div>
                <MyInput isSmall :errorObj="errorObj" propName="payment_method" :model-value="opeItem.payment_method[0]"
                    disabled :placeholder="opeItem.payment_method[0]" />
                <div class="form-label">{{ $t('otc.form.label8') }}</div>
                <MyInput isSmall :errorObj="errorObj" propName="comments" v-model="form.comments"
                    :placeholder="$t('otc.form.pla8')" />
                <MyButton size="large" class="mt-4" :disabled="!form.quantity" :clickFn="opeHandle">{{
                    $t('otc.form.btn1') }}</MyButton>
            </template>
            <template v-else>
                <div class="c-card-box">
                    <div class="flex justify-between mb-4">
                        <div class="">
                            <div class="form-label">{{ $t('otcHis.label1') }}</div>
                            <div>{{ activeTab == 1 ? $t('otc.tab1') : $t('otc.tab2') }}
                                USD</div>
                        </div>
                        <div class="">
                            <div class="form-label text-right">{{ $t('otcHis.label2')
                            }}(USD)</div>
                            <div class="form-value green-color text-right">{{ payPrice }} </div>
                        </div>
                    </div>
                    <div class="flex justify-between mb-4">
                        <div class="flex-auto">
                            <div class="form-label">{{ $t('otcHis.label3') }}
                            </div>
                            <div class="form-value">{{ opeItem.buy_price }}</div>
                        </div>
                        <div class="text-center flex-auto">
                            <div class="form-label">{{ $t('otcHis.label4') }}
                            </div>
                            <div class="form-value">{{ form.quantity }} USD</div>
                        </div>

                        <div class="text-right flex-auto">
                            <div class="form-label">{{ $t('otc.form.label7') }}</div>
                            <div class="form-value">{{ opeItem.payment_method[0] }}</div>
                        </div>
                    </div>

                </div>
                <MyButton size="large" class="mt-4" @click="toCustomer">{{ $t('otc.form.btn2') }}</MyButton>
            </template>
        </div>
    </van-popup>
</template>
<style scoped lang="scss">
	.lang-icon {
		width: 24px;
		height: 24px;
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.status {
    font-weight: 500;
    border-radius: 6px;
    color: #fff !important;
}

.star {
    width: 10px;
    height: 10px;
    margin-right: 2px;
}

.form-label {
    font-weight: 400;
    font-size: 14px;
    color: #8B939A;
    line-height: 24px;
    margin-bottom: 10px;
}

.text-tip {
    font-weight: 500;
    font-size: 12px;
    color: #8B939A;
    line-height: 14px;
    text-align: right;
    margin-left: auto;
}

.form-value {
    font-weight: 400;
    font-size: 14px;
    color: #FFFFFF;
    line-height: 24px;
}
</style>
