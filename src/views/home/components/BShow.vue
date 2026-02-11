<script setup lang="ts">
import { recommendListApi } from '@/api/data'
import { ref, onMounted } from 'vue'
import { serChartData } from '@/utils/serChartData'
import { setBaseUrl } from '@/utils/utils'
import { useRouter } from 'vue-router'
const router = useRouter()
const cardList = ref([])
const getRecommendList =  () => {
    recommendListApi({ page: 1, page_size: 20 }).then(data => {
        cardList.value = data.items.filter(item => item.base_asset !== 'eth').slice(1, 5)
        serChartData(cardList.value,)
    })
}
onMounted(() => {
    getRecommendList()
})
const handleClick = (item) => {
    router.push({
        path: '/SpotTrading',
        query: {
            id: item.id,
        },
    })
}
</script>
<template>
    <div class="my-10 text-xl font-bold">{{ $t('spe.title1') }}</div>
    <div class="b-show mb-6">
        <div v-for="item in cardList" :key="item.id" @click="handleClick(item)">
            <div class="b-box mb-4">
                <img
                                :src="setBaseUrl(item.logo)"
                                v-if="item.logo"
                                class="b-img"
                                alt=""
                            />
                            {{ item.name }}
            </div>
            <div class="flex-auto flex justify-center chart" :id="`chart${item.id}`"></div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.b-show {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 35px;

    .chart {
        width: 100%;
        height: 72px;
    }
}
</style>