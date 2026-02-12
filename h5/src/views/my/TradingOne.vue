<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
const router = useRouter()
const { t } = useI18n()
const tabList = computed(() => {
    return [
        { id: 0, name: t('tradingOne.tab1') },
        { id: 1, name: t('tradingOne.tab2') },
    ]
})
const searchInfo = reactive({
    draw_status: 0,
})
const tabChange = id => {
    searchInfo.draw_status = id
}
const dataList = ref([
    {
        title: '丽致环网(74896)',
        tip: '07.29-08.24',
        value: '123123',
    },
    {
        title: '丽致环网(74896)',
        value: '123123',
        tip: 'xxx'
    },
])
const showList = computed(() => {
    return [
        {
            key: 'value',
            name: t('tradingOne.label1'),
        },
        {
            key: 'value',
            name: t('tradingOne.label2'),
        },
        {
            key: 'value',
            name: t('tradingOne.label3'),
        },
        {
            key: 'value',
            name: t('tradingOne.label4'),
        },
        {
            key: 'value',
            name: t('tradingOne.label5'),
        },
        {
            key: 'value',
            name: t('tradingOne.label6'),
        },
    ]
})
</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top placeholder fixed left-arrow @click-left="$router.back()">
        <template #title>
            <MyTab
                :tabList="tabList"
                :tabActive="+searchInfo.draw_status"
                @tabChange="tabChange"
            ></MyTab>
        </template>
    </van-nav-bar>
    <div class="p-4 flex-auto overflow-auto">
        <MyShowItem
            v-for="item in dataList"
            :key="item.id"
            :title="item.title"
            :tip="item.tip"
            :showList="showList"
            :dataInfo="item"
            :status="searchInfo.status === 0 ? $t('tradingOne.status1') : $t('tradingOne.status1')"
            :statusColor="searchInfo.status === 0 ? '' : 'status-grey'"
        ></MyShowItem>
    </div>
</template>

<style scoped></style>
