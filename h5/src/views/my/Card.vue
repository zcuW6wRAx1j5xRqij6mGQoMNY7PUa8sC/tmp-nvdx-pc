<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getBankInfoApi } from '@/api/my'
const router = useRouter()
const data = ref({})
const toAdd = () => {
    router.push('/AddCard')
}
onMounted(() => {
    getBankInfoApi().then(res => {
        data.value = res.data || {}
    })
})
</script>
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('card.title')"
        left-arrow
        @click-left="$router.back()"
        fixed
        placeholder
    />
    <div class="flex-auto overflow-auto card-page">
        <NoData v-if="!data.id"></NoData>
        <div v-else>
            <div class="card">
                <div class="card-name">{{ data.bank_name }}</div>
                <div class="card-number">{{ data.card_number }}</div>
            </div>
        </div>
    </div>
    <div class="pb-8 pt-4 pl-5 pr-5" v-if="!data.id">
        <MyButton @click="toAdd">{{ $t('card.add') }}</MyButton>
    </div>
</template>
<style lang="scss" scoped>
.card-page {
    padding: 20px;

    .card {
        background-color: #2f2f2f;
        border-radius: 8px;
        padding: 16px;
        .card-name {
            color: #fff;

            font-size: 15px;
            font-style: normal;
            font-weight: 500;
            line-height: normal;
        }
        .card-number {
            color: #fff;

            font-size: 15px;
            font-style: normal;
            font-weight: 500;
            line-height: normal;
            margin-top: 20px;
            margin-bottom: 16px;
        }
    }
}
</style>
