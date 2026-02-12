<script setup>
import { isEmpty } from '@/utils/is'
import { friendlyNumber } from '@/utils/utils'
import dayjs from 'dayjs'
const props = defineProps({
    showList: {
        type: Array,
        default: () => [],
    },
    title: {
        type: String,
        default: '',
    },
    tip: {
        type: String,
        default: '',
    },
    statusColor: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        default: '',
    },
    dataInfo: {
        type: Object,
        default: () => {},
    },
    showColor: {
        type: Boolean,
        default: false,
    },
})
const showList = computed(() => {
    // 不整除2的倍数，补空白
    let list = props.showList
    if (list.length % 2 !== 0) {
        list.push({})
    }
    return list
})
const setValue = val => {
    if (isEmpty(val)) {
        return
    }
    if (typeof val === 'number') {
        return val
    }
    // 如果值符合日期格式 YYYY-MM-DD HH:mm:ss，则转换为 MM-DD HH:mm:ss
    // 根据是否有2个- 和2个： 判断是否是日期格式
    if (val.includes('-') && val.includes(':')) {
        val = dayjs(val).format('YYYY-MM-DD HH:mm:ss')
        let arr = val.split(' ')
        let date = arr[0].split('-')
        let time = arr[1].split(':')
        return `${date[1]}-${date[2]} ${time[0]}:${time[1]}`
    }
    return val
}
</script>
<!--  -->
<template>
    <div class="c-card-box">
        <div class="c-card-title">
            <div>
                <span v-html="title"></span>
                <div class="c-tip">{{ tip }}</div>
            </div>
            <div class="c-status-box" v-if="status" :class="[statusColor]">{{ status }}</div>
            <slot name="right"></slot>
        </div>
        <div class="show-ul">
            <div class="show-li" v-for="item in showList" :key="item.key">
                <span class="show-label">{{ item.name }}</span>
                <span
                    class="show-value"
                    :class="[
                        showColor ? (dataInfo[item.key] > 0 ? 'green-color' : 'red-color') : '',
                    ]"
                    >{{
                        friendlyNumber(
                            item.cb
                                ? item.cb(dataInfo)
                                : item.parent
                                  ? dataInfo[item.parent][item.key]
                                  : setValue(dataInfo[item.key]),
                        )
                    }}</span
                >
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.show-ul {
    display: flex;
    flex-wrap: wrap;
    margin-left: -16px;
    justify-content: space-between;
    .show-li {
        margin-left: 16px;
        flex: 1 0 40%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8px;
        flex-wrap: wrap;
        &:last-child {
            margin-bottom: 0;
        }
    }
    .show-label {
        color: #868686;
        font-size: 12px;
        margin-right: 10px;
        flex-shrink: 0;
        margin-right: auto;
        margin-top: 8px;
    }
    .show-value {
        color: #fff;
        font-size: 12px;
        font-weight: 400;
        text-align: right;
        margin-top: 8px;
        font-family: DIN;
    }
    .red-color {
        color: #e34646;
    }
}
</style>
