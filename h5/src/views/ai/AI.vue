<script setup>
import { useI18n } from 'vue-i18n'
import { financialProductListApi } from '@/api/data'
import useList from '@/hooks/useList'
import { setBaseUrl } from '@/utils/utils'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t } = useI18n()


const timeClick = (time, item) => {
    item.time = time
}

const tabList = computed(() => {
    return [
        { id: 1, name: t('ai.tab1') },
        { id: 2, name: t('ai.tab2') },
    ]
})
const activeTab = ref(1)
const tabChange = id => {
    activeTab.value = id
    initData({
        api: financialProductListApi,
        category: id === 1 ? 'flexible' : 'fixed',
    })
}
const toPage = url => {
    router.push(url)
}
const { showList, loading, finished, onLoad, initData } = useList(financialProductListApi, {
    category: 'flexible',
})
onLoad()
const showListSet = computed(() => {
    return showList.value.map(item => {
        item.time = item.duration[0]
        return item
    })
})
const liClick = item => {
    router.push({ path: '/AIBuy', query: { id: item.id, time: item.time } })
}
</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top title="IEO" placeholder fixed left-arrow @click-left="$router.back()">
        <template #title>
            <MyTab :tabList="tabList" :tabActive="activeTab" @tabChange="tabChange"></MyTab>
        </template>
        <template #right>
			<svg class="lang-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" @click="toPage('/AIHis')">
			<g id="&#231;&#148;&#179;&#232;&#180;&#173;&#232;&#174;&#176;&#229;&#189;&#149;">
			<path id="Vector" d="M4.48096 20.6255L4.47344 4.4668H6.9873V5.29389C6.9873 6.21957 7.73503 6.97314 8.65486 6.97314H15.3451C15.7888 6.97115 16.2136 6.79322 16.5262 6.4784C16.8388 6.16357 17.0138 5.73757 17.0127 5.29389V4.4668L19.519 4.46011L19.5257 20.6188L4.48096 20.6255ZM15.3418 3.6397L15.3451 5.30225L8.6582 5.29389V3.6397L8.65486 3.63135L15.3418 3.6397ZM19.5149 2.7959H16.7788C16.4897 2.29881 15.9584 1.96045 15.3451 1.96045H8.65486C8.04164 1.96045 7.51113 2.29797 7.22123 2.7959H4.47344C4.03227 2.79634 3.60932 2.97185 3.29744 3.28388C2.98557 3.5959 2.81028 4.01895 2.81006 4.46011V20.6255C2.81006 21.5428 3.55695 22.2897 4.47427 22.2897H19.5257C19.9669 22.289 20.3898 22.1135 20.7018 21.8015C21.0137 21.4896 21.1893 21.0667 21.1899 20.6255V4.46011C21.1882 4.0174 21.0108 3.59348 20.6967 3.28145C20.3826 2.96942 19.9576 2.79479 19.5149 2.7959Z" fill="currentColor"/>
			<path id="Vector_2" d="M14.7955 10.5734L10.8338 14.9044L9.21214 13.0873C9.06458 12.922 8.85739 12.8221 8.63616 12.8095C8.41493 12.797 8.19778 12.8729 8.03249 13.0204C7.8672 13.168 7.76729 13.3752 7.75476 13.5964C7.74222 13.8176 7.81808 14.0348 7.96565 14.2001L10.203 16.7064C10.2808 16.7936 10.376 16.8634 10.4825 16.9115C10.589 16.9596 10.7044 16.9848 10.8212 16.9855H10.8262C11.0602 16.9855 11.2841 16.8869 11.4428 16.7139L16.0286 11.7012C16.1781 11.5377 16.2566 11.3215 16.2467 11.1001C16.2369 10.8787 16.1395 10.6703 15.9759 10.5208C15.8124 10.3712 15.5962 10.2927 15.3748 10.3026C15.1534 10.3125 14.945 10.4099 14.7955 10.5734Z" fill="currentColor"/>
			</g>
			</svg>
            <!-- <img src="./img/subscribe.svg" class="w-6 h-6" @click="toPage('/AIHis')" /> -->
        </template>
    </van-nav-bar>
    <NoData v-if="showListSet.length === 0" />
    <van-list v-model:loading="loading" :finished="finished" v-else :finished-text="$t('common.noMore')" @load="onLoad"
        class="flex-auto overflow-auto p-4">
        <MyShowInfo v-for="item in showListSet" titleLarge :key="item.id" :title="item.name" :dataInfo="item">
            <template #left>
                <img v-if="item.logo" :src="setBaseUrl(item.logo)" class="b-img" alt="" />
            </template>
            <div class="mt-3 tip-box">
                <span class="tip-label">{{ $t('ai.tip1') }}</span> <span class="rate">{{ item.min_daily_rate }}% ~ {{
                    item.max_daily_rate }}%</span>
            </div>
            <div class="time-list">
                <div v-for="time in item.duration" :key="time" :class="['time-item', { active: time === item.time }]"
                    @click="timeClick(time, item)">
                    <span class="c-is-num">{{ time }}{{ $t('ai.days') }}</span>
                </div>
            </div>
            <template #ope>
                <MyButton size="large" class="mt-4" @click="liClick(item)">{{
                    $t('ai.btn1') }}</MyButton>
            </template>
        </MyShowInfo>
    </van-list>
</template>
<style scoped lang="scss">
	.lang-icon {
		width: 24px;
		height: 24px;
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.time-list {
    display: flex;
    overflow: auto;
    gap: 12px;
    margin-bottom: 14px;
    flex-shrink: 0;
    flex-wrap: wrap;
    margin-top: 16px;

    .time-item {
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        padding: 5px 8px;
        border-radius: 8px;
        flex-shrink: 0;
        cursor: pointer;
        width: calc(25% - 9px);
        border: 1px solid rgba(236,236,236,0.15);

        &.active {
            color: #fff;
            font-weight: 500;
            background: #1EB576;
            border-color: #1EB576;
        }
    }
}

.tip-box {
    padding-top: 12px;
    border-top: 1px solid rgba(236, 236, 236, 0.15);
}

.tip-label {
    font-size: 14px;
    color: #8B939A;
    line-height: 16px;
}

.rate {
    font-family: DIN, DIN;
    font-weight: 500;
    font-size: 15px;
    color: #1EB576;
    line-height: 18px;
    margin-left: 8px;
}
</style>
