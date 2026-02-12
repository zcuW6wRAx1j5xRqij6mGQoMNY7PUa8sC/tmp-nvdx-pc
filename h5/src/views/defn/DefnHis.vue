<script setup>
import { pledgeRecordApi } from '@/api/defn'
import useList from '@/hooks/useList'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import { friendlyNumber } from '@/utils/utils'
const { showList, loading, finished, onLoad } = useList(pledgeRecordApi, {isNoPage: true})
const { t } = useI18n()
const showInfoList = computed(() => [
        {
            key: "amount",
            name: t("defn.label2"),
            nameCb: (data) => {
                return `${t("defn.label2")}(${data.name})`
            },
            cb: (data) => {
                return friendlyNumber(data.amount)
            },
        },
        {
            key: "quota",
            name: `${t("defn.label4")}(USD)`,
            cb: (data) => {
                return friendlyNumber(data.quota)
            },
        },
        {
            key: "duration",
            name: t("defn.label3"),
            cb: (data) => {
                return `${data.duration} ${t("ai.days")}`
            },
        },
])
onMounted(onLoad)

</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('defn.hisTitle')"
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
                title=""
                :infoList="showInfoList"
                :dataInfo="item"
                isLarge
            >
                <template #left>
                    <div class="c-order-tip-box">{{dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')}}</div>
                </template>
                <template #right>
                    <div
                        class="c-status-box ml-auto is-small"
                        :class="[
                        item.status === 'pending' ? 'status-green' : item.status === 'hold' ?'status-yellow': item.status === 'closed' ? 'status-grey' : 'status-red'
                    ]"
                    >
                    {{
                        item.status === 'pending' ? $t('defn.status1') : item.status === 'hold' ? $t('defn.status2') : item.status === 'closed' ? $t('defn.status3') : item.status === 'closing' ? $t('defn.status4') : $t('defn.status5')
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
