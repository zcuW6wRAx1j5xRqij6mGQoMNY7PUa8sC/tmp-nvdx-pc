<script setup>
import { withdrawalLogApi } from '@/api/my'
import useList from '@/hooks/useList'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import { setBaseUrl } from '@/utils/utils'
const { showList, loading, finished, onLoad } = useList(withdrawalLogApi)
const { t } = useI18n()
const showItem = ref({})
const showInfoList = computed(() => [
    {
        key: 'amount',
        name: t('withdrawal.showItem.label1'),
    },
    {
        key: 'fee',
        name: t('withdrawal.showItem.label2'),
    },
    {
        key: 'status',
        name: t('withdrawal.showItem.label5'),
        cb: data => {
            return data.audit_status !== 1
                ? '-'
                : data.status === 0
                  ? t('withdrawal.status4')
                  : data.status === 1
                    ? t('withdrawal.status5')
                    : t('withdrawal.status6')
        },
    },
    {
        key: 'reason',
        name: t('withdrawal.showItem.label3'),
        cb: data => {
            return data.reason ? t('withdrawal.see') : '-'
        },
    },
    {
        key: 'receive_wallet_address',
        name: t('withdrawal.showItem.label4'),
        cb: data => {
            return "[" + data.receive_wallet_address + "]" //data.receive_wallet_address ? data.receive_wallet_address : '-'
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
const showReason = ref(false)
const liClick = (item, dataInfo) => {
    if (item.key === 'reason') {
        showItem.value = dataInfo
        showReason.value = true
        return
    }
}
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('withdrawal.history')"
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
                @liClick="liClick"
            >
                <template #left>
                    <img
                        v-if="item.coin_logo"
                        :src="setBaseUrl(item.coin_logo)"
                        class="b-img"
                        alt=""
                    />
                </template>
                <template #right>
                    <div
                        class="c-status-box ml-auto"
                        :class="
                            item.audit_status === 0
                                ? 'status-grey '
                                : item.audit_status === 1
                                  ? 'status-green'
                                  : 'status-red'
                        "
                    >
                        {{
                            item.audit_status === 0
                                ? $t('withdrawal.status1')
                                : item.audit_status === 1
                                  ? $t('withdrawal.status2')
                                  : $t('withdrawal.status3')
                        }}
                    </div>
                </template>
            </MyShowInfo>
        </van-list>
    </div>
    <MyConfirm
        v-model="showReason"
        @confirm="showReason = false"
        :content="showItem.reason"
        hideCancel
    ></MyConfirm>
</template>

<style scoped lang="scss">
.wallet-page {
    padding: 24px 16px;
}
</style>
