<script setup>
import { friendlyNumber, setBaseUrl } from '@/utils/utils'
defineProps({
    dataList: {
        type: Array,
        default: () => [],
    },
    columns: {
        // width, align, label, prop
        type: Array,
        default: () => [],
    },
    hasBg: {
        type: Boolean,
        default: false,
    },
    isSmall: {
        type: Boolean,
        default: false,
    },
})
let arrow = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
}
const emit = defineEmits(['tdClick'])
const tdClick = (item, prop) => {
    emit('tdClick', item, prop)
}
</script>
<!--  -->
<template>
    <div class="flex flex-col overflow-auto flex-grow-1 flex-shrink-0">
        <div class="flex justify-between th-box">
            <div
                class="th"
                v-for="th in columns"
                :key="th"
                :style="{
                    width: th.width ? `${th.width}%` : 'auto',
                    'justify-content': th.align ? arrow[th.align] : 'flex-start',
                    'text-align': th.align ? th.align : 'left',
                }"
            >
                {{ th.label }}
            </div>
        </div>
        <div class="table-body" :class="{ 'body-bg': hasBg, 'is-small': isSmall }">
            <div class="td-box" v-for="(data, index) in dataList" :key="index">
                <div
                    class="td"
                    v-for="th in columns"
                    :style="{
                        width: th.width ? `${th.width}%` : 'auto',
                        'justify-content': th.align ? arrow[th.align] : 'flex-start',
                        'text-align': th.align ? th.align : 'left',
                    }"
                    :class="{ 'red-color': th.isSpecial, 'num-txt': th.isNum }"
                    :key="th.prop"
                    @click="tdClick(data, th.prop)"
                >
                    <img
                        v-if="th.img && data[th.img]"
                        :src="setBaseUrl(data[th.img])"
                        class="td-img"
                        alt=""
                    />
                    <slot name="num" :data="data" :index="index" v-if="th.prop === 'num'"></slot>
                    <template v-else-if="th.cb"> {{ friendlyNumber(th.cb(data)) }}</template>
                    <template v-else-if="th.prop">
                        {{ friendlyNumber(th.parent ? data[th.parent][th.prop] : data[th.prop]) }}
                    </template>
                    <slot :data="data" :th="th" v-else></slot>
                    <div v-if="th.tip" class="td-tip">
                        {{ friendlyNumber(th.parent ? data[th.parent][th.tip] : data[th.tip]) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.th {
    color: #868686;
    font-size: 13px;
    font-style: normal;
    padding-right: 8px;
    line-height: normal;
    flex: 1 0 auto;
    display: flex;
    align-items: center;
    &:last-child {
        padding-right: 0;
    }
}
.td {
    color: #fff;
    font-size: 12px;
    font-style: normal;
    line-height: normal;
    padding-right: 8px;
    flex: 1 0 auto;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    font-weight: bold;
    &.red-color {
        color: #e34646;
        font-family: DIN;
        font-weight: 500;
    }
    &:last-child {
        padding-right: 0;
    }
    .td-tip {
        font-weight: 400;
        font-size: 10px;
        color: #8b939a;
        line-height: 12px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        width: 100%;
        font-weight: 400;
    }
    .td-img {
        width: 34px;
        height: 34px;
        margin-right: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }
}
.th-box {
    margin-bottom: 4px;
    flex-shrink: 0;
}
.td-box {
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    &:last-child {
        margin-bottom: 0;
    }
}
.table-body {
    padding: 16px 0;
    border-radius: 8px;
    flex: auto;
    overflow: auto;
    &.body-bg {
        background-color: #2f2f2f;
    }
}
.is-small {
    .td-box {
        margin-bottom: 10px;
    }
}
.num-txt {
    color: #fff;
    font-family: DIN;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
}
</style>
