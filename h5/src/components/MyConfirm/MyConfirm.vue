<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
const props = defineProps<{
    modelValue: boolean
    title?: string
    content?: string
    cancelText?: string
    confirmText?: string
    hideCancel?: boolean
    isLeft?: boolean
    btnType?: 'danger' | 'primary' | 'info' | 'warning' | 'success' | 'grey'
    titleColor?: string
}>()

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const sure = () => {
    emit('confirm')
}
const data = useVModel(props, 'modelValue', emit)
const cancel = () => {
    data.value = false
}
</script>
<!--  -->
<template>
    <van-popup v-model:show="data" round >
        <div class="com-popup-content">
            <div class="com-popup-title" :style="{ textAlign: isLeft ? 'left' : 'center', color: titleColor }">
                {{ title }}
            </div>
            <div class="com-popup-desc">
                <div v-html="content"></div>
                <slot></slot>
            </div>
            <div class="flex">
                <MyButton
                    v-if="!hideCancel"
                    class="flex-auto w-24 mr-3"
                    type="grey"
                    @click="cancel"
                    >{{ cancelText || $t('common.cancel') }}</MyButton
                >
                <MyButton class="flex-auto w-24" :type="btnType || 'danger'" @click="sure">{{
                    confirmText || $t('common.confirm')
                }}</MyButton>
            </div>
        </div>
    </van-popup>
</template>

<style scoped lang="scss">
.van-popup {
    background-color: #0E0E0E;
}
.com-popup-content {
    border-radius: 5px;
    background: var(--Neutral-10, #0E0E0E);
    padding: 25px;
    min-width: 320px;
    max-height: 60vh;
    overflow-y: auto;
    .com-popup-title {
        color: #8c8c8c;
        text-align: center;
        font-family: 'PingFang SC';
        font-size: 18px;
        font-style: normal;
        font-weight: 500;
        line-height: 18px; /* 100% */
        text-transform: capitalize;
    }
    .com-popup-desc {
        color: #fff;
        text-align: center;
        font-family: 'PingFang SC';
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 174%; /* 27.84px */
        margin-bottom: 24px;
        word-break: break-all;
    }
}
</style>
