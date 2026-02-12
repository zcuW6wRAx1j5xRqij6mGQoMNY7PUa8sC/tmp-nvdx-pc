<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { financialProductDetailApi, financialProductBuyApi } from '@/api/data'
import { setBaseUrl, friendlyNumber, multiply, divide, } from '@/utils/utils'
import { showLoadingToast, showSuccessToast, closeToast, showToast } from 'vant'
import dayjs from 'dayjs'
import { useBalance } from '@/hooks/useBalance'
const { walletInfo } = useBalance([1])

const router = useRouter()
const { t } = useI18n()
const route = useRoute()
const id = ref(route.query.id)
const time = ref(route.query.time)

const detail = ref({})
const amount = ref('')

const infoList = computed(() => {
    return [
        {
            key: 'unit_price',
            name: t('aiBuy.label1'),
            cb: data => {
                return dayjs().format('YYYY-MM-DD')
            },
        },
        {
            key: 'amount',
            name: t('aiBuy.label2'),
            cb: () => {
                return `${amount.value} USD`
            },
        },
        {
            key: 'income',
            name: t('aiBuy.label3'),
            cb: data => {
                return `${income.value} USD`
            },
        },
        {
            key: 'endTime',
            name: t('aiBuy.label4'),
            cb: data => {
                // 今天的时间加上传入的time
                return dayjs().add(time.value, 'day').format('YYYY-MM-DD')
            },
        },
        {
            key: 'penaltyFee',
            name: t('aiBuy.label5'),
            cb: data => {
                return `${penaltyFee.value} USD`
            },
        },
    ]
})
const balance = computed(() => {
    return friendlyNumber(walletInfo.value.total)
})
onMounted(() => {
    financialProductDetailApi({ id: id.value }).then(data => {
        detail.value = data || {}
    })
})

// 计算预估总收益 = 天数 * 日利率 * 投入本金
const income = computed(() => {
    if (!amount.value || !detail.value.min_daily_rate) return '0.00'
    const rate = divide(detail.value.min_daily_rate, 100)
    return friendlyNumber(multiply(multiply(amount.value, rate), time.value))
})

// 计算提前赎回违约金 = 本金 * 违约金比例
const penaltyFee = computed(() => {
    if (!amount.value || !detail.value.penalty_rate) return '0.00'
    const penalty_rate = divide(detail.value.penalty_rate, 100)
    return friendlyNumber(multiply(amount.value, penalty_rate))
})

const errorObj = ref({})
const onSubmit = () => {
    // 判断金额是否在最小和最大之间
    if (+amount.value < +detail.value.min_amount || +amount.value > +detail.value.max_amount) {
        errorObj.value.amount = t('aiBuy.tip4')
        return
    }
    if (!detail.value.duration.includes(+time.value)) {
        showToast(t('aiBuy.tip5'))
        return
    }
    showLoadingToast({
        forbidClick: true,
        loadingType: 'spinner',
        duration: 0,
    })
    return financialProductBuyApi({
        financial_id: id.value,
        amount: amount.value,
        duration: time.value,
    }).then(() => {
        showSuccessToast(t('aiBuy.tip6'))
        setTimeout(() => {
            router.push('/')
        }, 1000)
    }).finally(() => {
        setTimeout(() => {
            closeToast()
        }, 1000)

    })
}
</script>

<template>
    <van-nav-bar safe-area-inset-top :title="$t('aiBuy.title')" placeholder fixed left-arrow
        @click-left="$router.back()">
    </van-nav-bar>

    <div class="p-4 flex-auto overflow-auto">
        <div class="info ">
            <div class="flex items-center">
                <img v-if="detail.logo" :src="setBaseUrl(detail.logo)" class="w-7 h-7 rounded-full" alt="" />
                <div class="title ml-2">{{ detail.name }}</div>
            </div>
            <div class="flex items-center mt-3">
                <div class="mt-1 flex items-center">
                    <span class="text-sm text-[#8B939A]">{{ $t('aiBuy.tip1') }}</span>
                    <span class="text-[#1EB576] text-sm ml-2 c-is-num">{{ detail.min_daily_rate }}% ~ {{
                        detail.max_daily_rate }}%</span>
                </div>
                <div class="text-sm ml-4"><span class="c-is-num">{{ time }} {{ $t('aiHis.days') }}</span></div>
            </div>
            <div class="mt-5">
                <MyInput :placeholder="`${detail.min_amount || 0} - ${detail.max_amount || 0}`"
                    :label="$t('aiBuy.label2')" v-model="amount"  :errorObj="errorObj" propName="amount">
                    <template #right>
                        <div class="flex items-center font-15">
                            <span class=" mr-4">USD</span>
                            <span class="text-[#1EB576] cursor-pointer" @click="amount = balance">
                                {{ $t('aiBuy.btn2') }}
                            </span>
                        </div>
                    </template>
                </MyInput>

                <div class="flex justify-between items-center font-15">
                    <span class="text-sm text-[#8B939A]">{{ $t('aiBuy.tip2') }} : <span
                            class=" ml-2 c-is-num">{{
                                balance }} USD</span></span>
                    <div class="flex items-center">
                        <span class="text-[#1EB576]  ml-2 cursor-pointer" @click="$router.push('/Transform')">
                            {{ $t('aiBuy.btn3') }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="title mt-4">
            {{ $t('aiBuy.tip3') }}
        </div>
        <MyShowInfo class="mt-3" :dataInfo="detail" isLarge :infoList="infoList"></MyShowInfo>
    </div>

    <div class="c-footer">
        <MyButton block :disabled="!amount" :clickFn="onSubmit">{{ $t('aiBuy.btn1') }}</MyButton>
    </div>
</template>

<style scoped lang="scss">
.title {
    font-weight: 500;
    font-size: 15px;
    // color: #FFFFFF;
	color: var(--text-color);
    line-height: 18px;
}

.font-15 {
    font-size: 15px;
}

:deep(.show-li) {
    margin-top: 20px !important
}

:deep(.show-li:first-child) {
    margin-top: 0 !important
}
</style>