<script lang="ts" setup>
import { ref } from 'vue'
import { useVModel } from '@vueuse/core'
const props = defineProps({
    dataList: {
        type: Array,
        default: () => [],
    },
    modelValue: {
        type: [Boolean, String, Number],
        default: '',
    },
    title: {
        type: String,
        default: '',
    },
    selectHeight: {
        type: String,
        default: '50%',
    },
})
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])
const showBottom = useVModel(props, 'modelValue', emit)
const setHandle = () => {
    emit('confirm', tabActive.value, tabItem.value ? tabItem.value : {})
}
const tabActive = ref('')
const tabItem = ref()
const dataChange = (val, item) => {
    tabActive.value = val
    tabItem.value = item
}
</script>
<!--  -->
<template>
    <van-popup
        v-model:show="showBottom"
        closeable
        position="bottom"
        round
        :style="{ minHeight: selectHeight, maxHeight: '90vh' }"
        teleport="#app"
    >
        <div class="search-box">
            <div class="search-title">{{ title }}</div>
            <MyTab
                isSelect
                :tabActive="tabActive"
                :tabList="dataList"
                @tabChange="dataChange"
                class="mb-4"
            ></MyTab>
            <div class="flex mt-auto">
                <MyButton type="grey " class="w-full" @click="showBottom = false">{{
                    $t('common.cancel')
                }}</MyButton>
                <MyButton class="ml-3 w-full" @click="setHandle">{{
                    $t('common.confirm')
                }}</MyButton>
            </div>
        </div>
    </van-popup>
</template>

<style scoped lang="scss">
.search-box {
    height: 100%;
    padding: 72px 20px 32px;
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: #141316;
    overflow: auto;
    flex: auto;
   
    .search-title {
        position: absolute;
        top: 22px;
        color: #fff;
        font-size: 16px;
        font-style: normal;
        font-weight: 500;
        line-height: 120%; /* 28.8px */
    }
}
.van-popup {
    display: flex;
    flex-direction: column;
}
</style>
