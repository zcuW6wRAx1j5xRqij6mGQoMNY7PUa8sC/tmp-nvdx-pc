<script setup>
import { rechargeHistoryApi } from '@/api/my'
import useList from '@/hooks/useList'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
const { showList, loading, finished, onLoad } = useList(rechargeHistoryApi)
const { t } = useI18n()
const showInfoList = computed(() => [
    {
        key: 'amount',
        name: t('rechargeRecord.showItem.label1'),
    },
    {
        key: 'usdt_value',
        name: t('rechargeRecord.showItem.label2'),
    },
    {
        key: 'wallet_address',
        name: t('rechargeRecord.showItem.label4'),
        cb: data => {
            return "[" + data.wallet_address + "]" //data.receive_wallet_address ? data.receive_wallet_address : '-'
        },
    },
    {
        key: 'created_at',
        name: t('withdrawal.showItem.label6'),
        cb: function (data) {
            return dayjs(data.created_at).format('YYYY-MM-DD HH:mm:ss')
        },
    },
])
onMounted(onLoad)
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('rechargeRecord.history')"
        left-arrow
        @click-left="$router.back()"
        fixed
        placeholder
    >
        <template #right>
            <!-- <div class="search">
                <img src="./img/msg1.svg" @click="clearHandle" class="msg-icon" alt="" />
                <img src="./img/msg2.svg" @click="delHandle" class="msg-icon" alt="" />
            </div> -->
        </template>
    </van-nav-bar>
    <div class="wallet-page overflow-auto flex-auto">
        <NoData v-if="!showList.length"></NoData>
        <van-list
            v-model:loading="loading"
            :finished="finished"
            :finished-text="$t('common.noMore')"
            @load="onLoad"
            v-if="showList.length"
        >
            <MyShowInfo
                v-for="item in showList"
                :key="item.id"
                :title="item.coin_name"
                :infoList="showInfoList"
                :dataInfo="item"
            >
                <template #left>
                    <img v-if="item.coin_logo" :src="item.coin_logo" class="b-img" alt="" />
                </template>
                <template #right>
                    <div
                        class="c-status-box ml-auto"
                        :class="
                            item.status === 0
                                ? 'status-grey '
                                : item.status === 1
                                  ? 'status-green'
                                  : 'status-red'
                        "
                    >
                        {{
                            item.status === 0
                                ? $t('rechargeRecord.status1')
                                : item.status === 1
                                  ? $t('rechargeRecord.status2')
                                  : $t('rechargeRecord.status3')
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
