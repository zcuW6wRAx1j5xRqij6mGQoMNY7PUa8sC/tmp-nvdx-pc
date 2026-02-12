<script lang="ts" setup>
import { useBalance } from '@/hooks/useBalance'
import { useI18n } from 'vue-i18n'
const { getSpotBalance, getWalletData } = useBalance([1])
import { getDividendApi, getDividendStatusApi } from '@/api/my'
import { closeToast, showLoadingToast,showSuccessToast } from 'vant'
import { computed, onMounted, ref } from 'vue'
const { t } = useI18n()
const isReceived = ref(false) // 是否已领取
const columns = computed(() => {
    return [
        { width: 20, align: 'left', label: '', prop: 'name' },
        {
            width: 60,
            label: '',
            prop: 'amount',
            align: 'right',
        },
        {
            width: 20,
            align: 'right',
            label: '',
            prop: 'aaa',
        },
    ]
})
// | 10000 ~ 50,000           | Level 1 | 3,777 |
// | 50,000 ~ 150,000     | Level 2 | 7,777 |
// | 150,000 ~ 300,000    | Level 3 | 17,777 |
// | 300,000 ~ 500,000    | Level 4 | 27,777 |
// | 500,000 ~ 800,000    | Level 5 | 57,777 |
// | 800,000 ~ 1,200,000   | Level 6 | 77,777 |
// | 1,200,000 ~ 1,500,000  | Level 7 | 117,777 |
// | 1,500,000 ~ 2,000,000  | Level 8 | 157,777 |
// | 2,000,000 ~ 3,000,000  | Level 9 | 377,777 |
// | 超过 3,000,000      | Level 10 | 777,777 |
const levelList = ref([
    { name: 'Level 1', amount: '10000 ~ 50,000', aaa: '3,777' },
    { name: 'Level 2', amount: '50,000 ~ 150,000', aaa: '7,777' },
    { name: 'Level 3', amount: '150,000 ~ 300,000', aaa: '17,777' },
    { name: 'Level 4', amount: '300,000 ~ 500,000', aaa: '27,777' },
    { name: 'Level 5', amount: '500,000 ~ 800,000', aaa: '57,777' },
    { name: 'Level 6', amount: '800,000 ~ 1,200,000', aaa: '77,777' },
    { name: 'Level 7', amount: '1,200,000 ~ 1,500,000', aaa: '117,777' },
    { name: 'Level 8', amount: '1,500,000 ~ 2,000,000', aaa: '157,777' },
    { name: 'Level 9', amount: '2,000,000 ~ 3,000,000', aaa: '377,777' },
    { name: 'Level 10', amount: '> 3,000,000', aaa: '777,777' },
])
const initData = () => {
    showLoadingToast({
        forbidClick: true,
        loadingType: 'spinner',
        duration: 0,
    })
    getDividendStatusApi()
        .then(data => {
            isReceived.value = data.exsits
        })
        .finally(() => {
            closeToast()
        })
}
onMounted(initData)
const canReceive = ref(0) 

const amount = computed(() => {
    let balance = getSpotBalance('USDC')
    if (balance >= 10000 && balance < 50000) {
        canReceive.value = 3777
    } else if (balance >= 50000 && balance < 150000) {
        canReceive.value = 7777
    } else if (balance >= 150000 && balance < 300000) {
        canReceive.value = 17777
    } else if (balance >= 300000 && balance < 500000) {
        canReceive.value = 27777
    } else if (balance >= 500000 && balance < 800000) {
        canReceive.value = 57777
    } else if (balance >= 800000 && balance < 1200000) {
        canReceive.value = 77777
    } else if (balance >= 1200000 && balance < 1500000) {
        canReceive.value = 117777
    } else if (balance >= 1500000 && balance < 2000000) {
        canReceive.value = 157777
    } else if (balance >= 2000000 && balance < 3000000) {
        canReceive.value = 377777
    } else if (balance >= 3000000) {
        canReceive.value = 777777
    }

    return balance
})
// 领取
const getDividend = () => {
    showLoadingToast({
        forbidClick: true,
        loadingType: 'spinner',
        duration: 0,
    })
    getDividendApi()
        .then(() => {
            isReceived.value = true
            // 更新余额
            getWalletData(1)
            showSuccessToast(t('common.opeSuccess'))
        })
        .finally(() => {
            // closeToast()
        })
}
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('plan.name')"
        placeholder
        fixed
        left-arrow
        @click-left="$router.back()"
    >
    </van-nav-bar>
    <div class="flex-auto overflow-auto p-4">
        <div class="mb-3">{{ $t('plan.tip') }}</div>
        <MyTable :dataList="levelList" class="mt-0" :columns="columns"> </MyTable>
        <div class="title mt-4">{{ $t('plan.title1') }}</div>
        <div class="c-card-box rule">
            <div class="flex justify-between items-center">
                {{ $t('plan.label1') }}
                <span class="value">{{ amount }} USD</span>
            </div>
            <div class="flex justify-between mt-4 items-center">
                {{ $t('plan.label2') }}
                <span class="value">{{ canReceive }} USD</span>
            </div>
        </div>
    </div>
    <div class="c-footer">
        <MyButton class="flex-auto" :clickFn="getDividend" :disabled="isReceived">{{
            isReceived ? $t('plan.btn2') : $t('plan.btn1')
        }}</MyButton>
    </div>
</template>

<style scoped>
.rule {
    font-weight: 400;
    font-size: 15px;
    color: #8b939a;
    line-height: 25px;
}
.title {
    font-weight: 500;
    font-size: 15px;
    color: #ffffff;
    line-height: 18px;
    margin-bottom: 10px;
}
.value {
    font-family: DIN;
    font-weight: 500;
    font-size: 14px;
    color: #ffffff;
    line-height: 16px;
    text-align: right;
}
</style>
