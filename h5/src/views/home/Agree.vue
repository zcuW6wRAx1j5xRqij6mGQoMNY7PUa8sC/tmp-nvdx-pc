<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { aboutUsApi, userAgreementApi, privacyPolicyApi } from '@/api/home'
const route = useRoute()
// type 1.关于我们 2.用户协议 3.隐私政策
const { t } = useI18n()
const type = ref(+(route.query.type as string))
const title = computed(() => {
    switch (type.value) {
        case 1:
            return t('userPopup.menu6')
        case 2:
            return t('userPopup.menu7')
        case 3:
            return t('userPopup.menu8')
        default:
            return ''
    }
})
const content = ref('')
const getData = () => {
    switch (type.value) {
        case 1:
            aboutUsApi().then(data => {
                content.value = data.content
            })
            break
        case 2:
            userAgreementApi().then(data => {
                content.value = data.content
            })
            break
        case 3:
            privacyPolicyApi().then(data => {
                content.value = data.content
            })
            break
    }
}
getData()
</script>
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="title"
        left-arrow
        @click-left="$router.back()"
        fixed
        placeholder
    >
    </van-nav-bar>
    <div class="flex-auto overflow-auto p-4">
        <div v-html="content"></div>
    </div>
</template>
<style lang="scss" scoped>
:deep(strong, p) {
    color: #fff !important;
}
</style>
