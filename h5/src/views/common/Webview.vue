<template>
     <van-nav-bar
        safe-area-inset-top
        :title="$t('ieo.tab1.label10')"
        placeholder
        fixed
        left-arrow
        @click-left="$router.back()"
    >
    </van-nav-bar>
   <iframe :src="url" style="width: 100%; height: 100%;"  class="flex-auto"/>
</template>
<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const url = ref(`https://mozilla.github.io/pdf.js/web/viewer.html?file=${route.query.url}`)
</script>
