<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import useList from '@/hooks/useList'
import { getSpotWalletLogApi, getContractWalletLogApi } from '@/api/my'
import { onMounted } from 'vue'
import dayjs from 'dayjs'
const { t } = useI18n()
const route = useRoute()
const { showList, loading, finished, onLoad } = useList(
    +route.query.type === 0 ? getSpotWalletLogApi : getContractWalletLogApi,
)
onMounted(onLoad)
const columns = computed(() => {
    return [
        { width: 20, align: 'left', label: t('financialDetail.th1'), prop: 'amount' },
        {
            width: 35,
            align: 'center',
            label: t('financialDetail.th2'),
            prop: 'flow_type',
            cb: function (data) {
                const type = {
                    system: t('wallet.type.system'),
                    transfer_in: t('wallet.type.transferIn'),
                    transfer_out: t('wallet.type.transferOut'),
                    postion_margin: t('wallet.type.positionMargin'),
                    position_close: t('wallet.type.positionClose'),
                    position_fee: t('wallet.type.positionFee'),
                    withdraw: t('wallet.type.withdraw'),
                    deposit: t('wallet.type.deposit'),
                    transferIn: t('wallet.type.transferIn'),
                    transferOut: t('wallet.type.transferOut'),
                    postingOrder: t('wallet.type.postingOrder'),
                    execution: t('wallet.type.execution'),
                    withdraw_refund: t('wallet.type.withdrawRefund'),
                    system_withdraw: t('wallet.type.withdraw'),
                    system_deposit: t('wallet.type.deposit'),
                    posting_order: t('wallet.type.postingOrder'),
                    refund_posting_order: t('wallet.type.refundPostingOrder'),
                    buy_ieo: t('wallet.type.ieo'),
                }
                return type[data.flow_type]
            },
        },
        {
            width: 40,
            align: 'right',
            label: t('financialDetail.th3'),
            prop: 'created_at',
            cb: function (data) {
                return dayjs(data.created_at).format('YYYY-MM-DD HH:mm:ss')
            },
        },
    ]
})
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        placeholder
        fixed
        left-arrow
        @click-left="$router.back()"
        :title="$t('financialDetail.title')"
    />
    <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="$t('common.noMore')"
        @load="onLoad"
        v-if="showList.length"
        class="overflow-auto flex-auto"
    >
        <MyTable :dataList="showList" class="mt-4" :columns="columns"> </MyTable>
    </van-list>
    <NoData v-if="!showList.length"></NoData>
</template>

<style scoped></style>
