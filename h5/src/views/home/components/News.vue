<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNewsApi } from '@/api/home'
import useList from '@/hooks/useList'
import dayjs from 'dayjs'
const router = useRouter()
const toDetail = news => {
    router.push({
        path: '/NewsDetail',
        query: {
            id: news.id,
        },
    })
}
const { showList, loading, finished, onLoad } = useList(getNewsApi)
onMounted(onLoad)
</script>
<!--  -->
<template>
    <NoData v-if="!showList.length" style="padding: 0"></NoData>
    <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="$t('common.noMore')"
        @load="onLoad"
        class="flex-auto overflow-auto news-box flex-shrink-0"
        v-else
    >
        <div class="news-card" v-for="item in showList" :key="item.id" @click="toDetail(item)">
            <img :src="item.cover" class="img-right" alt="" />
            <div class="right-box">
                <div class="news-title">
                    {{ item.title }}
                </div>
                <div class="news-time">
                    {{ dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss') }}
                </div>
            </div>
        </div>
    </van-list>
</template>

<style scoped lang="scss">
.news-box {
    .news-card {
        background-color: #1c1e27;
        border-radius: 8px;
        padding: 10px 16px;
        margin-bottom: 10px;
        height: 109px;
        flex-shrink: 0;
        display: flex;
        justify-content: space-between;
        .right-box {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            margin-left: 16px;
        }
        .news-title {
            font-weight: 400;
            font-size: 15px;
            color: #ffffff;
            line-height: 18px;
            text-align: left;
            text-transform: none;
            display: -webkit-box;
            -webkit-line-clamp: 2; /* 限制显示两行 */
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .news-time {
            color: #5c656c;
            font-size: 12px;
            font-style: normal;
            line-height: 120%; /* 14.4px */
        }
        .img-right {
            flex-shrink: 0;
            width: 91px;
            height: 100%;
            flex-shrink: 0;
        }
    }
}
</style>
