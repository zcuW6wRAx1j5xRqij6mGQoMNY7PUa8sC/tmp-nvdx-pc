<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { defineProps, defineEmits, ref } from 'vue'
import { closeContractOrderApi } from '@/api/data'
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])
const props = defineProps<{
    modelValue: boolean
    positionId: number
}>()
const sure = () => {
    data.value = false
    emit('confirm', props.positionId)
    return closeContractOrderApi({
        position_id: props.positionId,
        password: value.value,
    }).then(() => {
        data.value = false
        emit('confirm', props.positionId)
    })
}
const data = useVModel(props, 'modelValue', emit)
// 认缴操作
const value = ref('')
const showKeyboard = ref(true)
function open() {
    value.value = ''
    showKeyboard.value = true
}
</script>
<!--  -->
<template>
    <van-popup v-model:show="data" round position="bottom" closeable @open="open">
        <div class="popup-box">
            <div class="mb-4">{{ $t('order.title') }}</div>
            <!-- 密码输入框 -->
            <van-password-input
                :value="value"
                :focused="showKeyboard"
                @focus="showKeyboard = true"
                :gutter="10"
            />
            <MyButton class="mt-4" :disabled="value && value.length < 6" :clickFn="sure">{{
                $t('common.confirm')
            }}</MyButton>
            <!-- 数字键盘 -->
            <van-number-keyboard
                v-model="value"
                :show="showKeyboard"
                @blur="showKeyboard = false"
                maxlength="6"
            />
        </div>
    </van-popup>
</template>

<style scoped lang="scss">
.popup-box {
    padding: 16px;
    height: 420px;
    background-color: #1c1b1b;
    :deep(.van-password-input__security li) {
        border-radius: 8px;
        background: #2f2f2f;
        color: #fff;
    }
    :deep(.van-number-keyboard) {
        background-color: #2f2f2f;
        .van-key {
            background-color: #2f2f2f;
            color: #fff;
            &.van-key--delete {
                color: #fff;
            }
        }
    }
}
.ope-show {
    display: flex;
    justify-content: space-between;
    color: var(--, #909090);
    font-family: 'PingFang SC';
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 174%; /* 27.84px */
    .value {
        color: #fff;
    }
}
.ope-box {
    padding: 16px;
    background-color: #0e0e0e;
    border-radius: 8px;
    margin-top: 12px;
    margin-bottom: 16px;
}
:deep(.van-password-input__security i) {
    background-color: #000;
}
</style>
