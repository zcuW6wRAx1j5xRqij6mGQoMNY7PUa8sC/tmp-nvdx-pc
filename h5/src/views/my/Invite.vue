<script setup>
import { useRoute } from 'vue-router'
import VueQr from 'vue-qrcode'
const route = useRoute()
import copy from '@/utils/copy.js'
const code = ref(route.query.inviteCode)
const inviteLink = ref(
    `https://app.nvdx.io?invite_code=${route.query.inviteCode}` || '',
)
// const sureHandle = () => {
//     console.log(route.inviteCode)
//     copy(code.value)
// }
</script>
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('invite.title')"
        left-arrow
        @click-left="$router.back()"
        fixed
        placeholder
    />
    <div class="flex-auto overflow-auto invite-page">
        <div class="c-card-box flex items-center">
            <span class="code">{{ $t('invite.code') }}{{ code }}</span>
            <MyButton @click="copy(code)" isBlock class="ml-auto" size="small" isInline>{{
                $t('invite.copy')
            }}</MyButton>
        </div>
        <div class="c-card-box">
            <VueQr class="code-img" :value="inviteLink" :size="300"></VueQr>
        </div>
        <!-- <div class="c-card-box flex items-center">
            <span class="code">{{ $t('invite.code') }}523Fbge548</span>
            <MyButton @click="copy(code)" class="ml-auto" size="small" isInline>{{
                $t('invite.copy')
            }}</MyButton>
        </div> -->
    </div>
</template>
<style lang="scss" scoped>
.invite-page {
    padding: 20px;
    .code-img {
        max-width: 300px;
        max-height: 300px;
        border-radius: 8px;
        margin: auto;
    }
}
</style>
