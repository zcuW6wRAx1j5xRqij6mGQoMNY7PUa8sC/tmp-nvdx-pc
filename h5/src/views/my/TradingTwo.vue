<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
const router = useRouter()
const { t } = useI18n()
const tabList = computed(() => {
    return [
        { id: 0, name: t('tradingTwo.tab1') },
        { id: 1, name: t('tradingTwo.tab2') },
    ]
})
const searchInfo = reactive({
    status: 0,
})
const tabChange = id => {
    searchInfo.status = id
}
const dataList = ref([
    {
        title: `丽致环网(74896)<span class="green-color ml-2 ">${t('tradingTwo.tip1')} * 100</span>`,
        tip: '07.29-08.24',
        value: '123123',
        aa: '2024.08.12 15:38:19'
    },
    {
        title: '丽致环网(74896)',
        value: '123123',
        tip: 'xxx',
        aa: '2024.08.12 15:38:19'
    },
])
const showList = computed(() => {
    if (searchInfo.status === 0) {
        return [
            {
                key: 'value',
                name: t('tradingTwo.label1'),
                ecial: true,isSp
            },
            {
                key: 'value',
                name: t('tradingTwo.label2'),
                
            },
            {
                key: 'value',
                name: t('tradingTwo.label3'),
            },
            {
                key: 'value',
                name: t('tradingTwo.label4'),
            },
            {
                key: 'value',
                name: t('tradingTwo.label5'),
            },
            {
                key: 'value',
                name: t('tradingTwo.label6'),
                
            },
        ]
    } else {
        return [
            {
                key: 'value',
                name: t('tradingTwo.label11'),
            },
            {
                key: 'value',
                name: t('tradingTwo.label12'),
            },
            {
                key: 'value',
                name: t('tradingTwo.label13'),
            },
            {
                key: 'value',
                name: t('tradingTwo.label14'),
            },
            {
                key: 'value',
                name: t('tradingTwo.label15'),
            },
            {
                key: 'value',
                name: t('tradingTwo.label16'),
            },
            {
                key: 'value',
                name: t('tradingTwo.label17'),
            },
            {
                key: 'value',
                name: t('tradingTwo.label18'),
            },
            {
                key: 'value',
                name: t('tradingTwo.label19'),
            },
            {
                key: 'value',
                name: t('tradingTwo.label20'),
            },
            {
                key: 'aa',
                name: t('tradingTwo.label21'),
            },
        ]
    }
})
</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top placeholder fixed left-arrow @click-left="$router.back()">
        <template #title>
            <MyTab
                :tabList="tabList"
                :tabActive="+searchInfo.status"
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
            :status="searchInfo.status === 0 ? $t('tradingTwo.status1') : ''"
        >
            <template #right v-if="searchInfo.status === 1">
                <span class="green-color c-is-num">{{ item.value }}</span>
            </template>
        </MyShowItem>
    </div>
</template>

<style scoped></style>
