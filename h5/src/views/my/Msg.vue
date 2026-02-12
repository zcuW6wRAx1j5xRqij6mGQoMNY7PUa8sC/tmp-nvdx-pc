<script setup>
import { getMsgListApi } from '@/api/my'
import useList from '@/hooks/useList'
import { useRouter } from 'vue-router'
const router = useRouter()
const { showList, loading, finished, onLoad } = useList(getMsgListApi)
const toPage = (path, query) => {
    router.push({ path, query })
}
onMounted(onLoad)
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('msg.title')"
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
            <div class="c-card-box" v-for="item in showList" :key="item.id">
                <div
                    class="flex justify-between items-center"
                    @click="toPage('/MsgDetail', { id: item.id })"
                >
                <span class="title" :class="{ read: item.is_read === 0 }">{{
                        item.subject
                    }}</span>
                    <!-- <div class="time">
                        {{ dayjs(item.created_at).format('YYYY-MM-DD') }}
                    </div> -->
                </div>
                <!-- <div class="content">
                    {{ item.subject }}
                </div> -->
            </div>
        </van-list>
    </div>
</template>

<style scoped lang="scss">
.wallet-page {
    padding: 24px 16px;
    .title {
        color: #fff;
        font-family: 'PingFang SC';
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 21px */
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        // width: 200px;
        &.read::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #e34646;
            border-radius: 50%;
            margin-right: 8px;
        }
    }
    .time {
        color: #909090;
        font-family: 'PingFang SC';
        font-size: 13px;
        font-style: normal;
      
        line-height: 150%; /* 19.5px */
        flex-shrink: 0;
        margin-left: 10px;
    }
    .content {
        color: #b8b8b8;
        font-family: 'PingFang SC';
        font-size: 13px;
        font-style: normal;
      
        line-height: 140%; /* 18.2px */
        margin-top: 10px;
        // 超过2行省略号
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
}
.search {
    display: flex;
    align-items: center;
    .msg-icon {
        width: 24px;
        margin-left: 24px;
        height: 24px;
    }
}
</style>
