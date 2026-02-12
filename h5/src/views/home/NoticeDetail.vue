<script setup>
import { noticeDetailApi } from '@/api/home'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
const route = useRoute()
const noticeDetail = ref({})
noticeDetailApi({
    id: route.query.id,
}).then(res => {
    noticeDetail.value = res
})
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="noticeDetail.subject"
        left-arrow
        @click-left="$router.back()"
        fixed
        placeholder
    >
    </van-nav-bar>
    <div class="flex-auto overflow-auto p-4">
        <div v-html="noticeDetail.content"></div>
    </div>
</template>

<style scoped>
.cover {
    width: 100%;
    max-height: 300px;
    min-height: 100px;
    object-fit: fill;
}
</style>
