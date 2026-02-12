<script setup>
import { getNewsDetailApi } from '@/api/home'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { setBaseUrl } from '@/utils/utils'
const route = useRoute()
const newsDetail = ref({})
getNewsDetailApi({ news_id: route.query.id }).then(res => {
    newsDetail.value = res || {}
})
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="newsDetail.title"
        left-arrow
        @click-left="$router.back()"
        fixed
        placeholder
    >
    </van-nav-bar>
    <div class="flex-auto overflow-auto p-4">
        <img :src="setBaseUrl(newsDetail.cover)" v-if="newsDetail.cover" class="cover" alt="" />
        <div v-html="newsDetail.content" class="mt-4"></div>
    </div>
</template>

<style scoped>
.cover {
    width: 100%;
    max-height: 300px;
    min-height: 100px;
    object-fit: fill;
}
:deep(span),
:deep(strong),
:deep(em) {
    background-color: transparent !important;
    color: #fff !important;
}
</style>
