<script setup>
import { getOTCOrderApi } from '@/api/data'
import useList from '@/hooks/useList'
import dayjs from 'dayjs'
import { friendlyNumber } from '@/utils/utils'
import { useI18n } from 'vue-i18n'
const { showList, loading, finished, onLoad } = useList(getOTCOrderApi,)
const { t } = useI18n()
const showInfoList = computed(() => [
    {
        key: "amount",
        name: t("otcHis.label1"),
        cb: (data) => {
            return data.trade_type === 'buy' ? t('otc.tab1') : t('otc.tab2')
        },
    },
    {
        key: "amount",
        name: t("otcHis.label2"),
        cssCb: () => 'green-color',
        cb: (data) => {
            return friendlyNumber(data.amount)
        },
    },
    {
        key: "price",
        name: t("otcHis.label3"),
        cb: (data) => {
            return friendlyNumber(data.price)
        },
    },
    {
        key: "quantity",
        name: t("otcHis.label4"),
        cb: (data) => {
            return friendlyNumber(data.quantity)
        },
    },
    {
        key: "quantity",
        name: t("otcHis.label5"),
        cb: (data) => {
            return data.payment_method
        },
    },
])
onMounted(onLoad)

const getStatus = (row) => {
    if (row.status === 'pending') {
        return {
            text: t('otcHis.status1'),
            css: 'status-yellow'
        }
    } else if (row.status === 'rejected') {
        return {
            text: t('otcHis.status3'),
            css: 'status-red'
        }
    } else if (row.status === 'accepted') {
        return {
            text: t('otcHis.status2'),
            css: 'status-grey'
        }
    }
}

</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top :title="t('otcHis.title')" left-arrow @click-left="$router.back()" fixed
        placeholder>
    </van-nav-bar>
    <div class="wallet-page overflow-auto flex-auto">
        <NoData v-if="!showList.length"></NoData>
        <van-list v-model:loading="loading" :finished="finished" :finished-text="t('common.noMore')" @load="onLoad"
            v-if="showList.length">
            <MyShowInfo v-for="item in showList" :key="item.id" :title="item.product && item.product.title" :infoList="showInfoList" :dataInfo="item"
                isLarge>
                <template #right>
                    <div class="c-status-box ml-auto is-small" :class="[
                        getStatus(item).css
                    ]">
                        {{
                            getStatus(item).text
                        }}
                    </div>
                </template>
            </MyShowInfo>
        </van-list>
    </div>
</template>

<style scoped lang="scss">
.wallet-page {
    padding: 24px 16px;
}
</style>
