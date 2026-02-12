<script lang="ts" setup>
// 设置属性 size默认是medium，type默认是primary，disabled默认是false
// size: small, medium, large
import { ref } from 'vue'

// type: primary, secondary, danger, white
const props = withDefaults(
    defineProps<{
        size?: 'small' | 'medium' | 'large' | 'mini'
        type?: 'primary' | 'secondary' | 'danger' | 'white' | 'green' | 'blue' | 'grey' | 'black' | 'yellow'
        disabled?: boolean
        isInline?: boolean
        isBlock?: boolean
        clickFn?: () => Promise<void>
    }>(),
    {
        size: 'large',
        type: 'primary',
        disabled: false,
        isInline: false,
        isBlock: false,
        clickFn: undefined,
    },
)
const emit = defineEmits<{
    (e: 'click'): void
}>()
const loading = ref(false)
const btnClick = () => {
    if (props.disabled) return
    if (loading.value) return
    if (props.clickFn) {
        loading.value = true
        Promise.resolve(props.clickFn())
            .then(() => {
                loading.value = false
            })
            .catch(() => {
                loading.value = false
            })
            .finally(() => {
                
            })
    }
    emit('click')
}
</script>
<!--  -->
<template>
    <div
        class="my-button"
        :class="{
            disabled: disabled,
            [type]: true,
            [size]: true,
            inline: isInline,
            isBlock: isBlock,
        }"
        @click="btnClick"
    >
        <van-loading v-if="loading" type="spinner" class="mr-2" />
        <slot></slot>
    </div>
</template>

<style scoped lang="scss">
.my-button {
    border-radius: 100px;
    background: #1EB576;

    display: flex;
    justify-content: center;
    align-items: center;
    &.disabled {
        opacity: 0.6;
    }
    &.inline {
        display: inline-block;
        flex-grow: 0;
    }
}

.small {
    color: #fff;
    text-align: center;

    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; /* 16.8px */
    padding: 6px 20px;
    border-radius: 100px;
    background: #1EB576;
}
.medium {
    color: #000;
    text-align: center;

    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; /* 18px */
    padding: 8px 16px;
    border-radius: 100px;
    background: #1EB576;
}
.large {
    font-size: 16px;
    font-weight: 400;
    padding: 10px 16px;
}
.mini {
    font-size: 12px;
    font-weight: 400;
    padding: 6px 8px;
}
.primary {
    background-color: #1EB576;
}
.danger {
    background-color: #e34646;
}
.yellow {
    background-color: #FFC300;
}
.green {
    background-color: #00b481;
}
.blue {
    background-color: #00a8dc;
}
.white {
    border: 1px solid #ddd;
    background-color: #fff;
}
.grey {
    background: rgba(139, 147, 154, 0.3);
    color: #ffffff;
}
.secondary {
    color: var(--Neutral-10, #fff);
    background: var(--SECONDARY-Main, #fdb715);
    &:active,
    &:hover {
        color: #fff;
    }
}
.isBlock {
    border-radius: 4px;
}
.black {
    background-color:#303030;
    color: #fff;
}
</style>
