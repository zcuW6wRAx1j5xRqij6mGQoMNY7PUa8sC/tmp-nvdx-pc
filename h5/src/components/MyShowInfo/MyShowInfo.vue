<script setup>
import { isEmpty } from '@/utils/is'
import { friendlyNumber } from '@/utils/utils'
import dayjs from 'dayjs'
const props = defineProps({
    infoList: {
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
    dataInfo: {
        type: Object,
        default: () => { },
    },
    isInline: {
        type: Boolean,
        default: false,
    },
    isFlex: {
        // label value 平行
        type: Boolean,
        default: false,
    },
    titleLarge: {
        type: Boolean,
        default: false,
    },
    isLarge: {
        type: Boolean,
        default: false,
    },
})
const showList = computed(() => {
    // 不整除2的倍数，补空白
    let list = props.infoList
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
const emit = defineEmits(['liClick'])
const liClick = (item, dataInfo) => {
    emit('liClick', item, dataInfo)
}
</script>
<!--  -->
<template>
    <div class="c-card-box">
        <div class="my-show-title">
            <slot name="left"></slot>
            <span class="font-bold" :class="{ 'font-15': titleLarge || isLarge }" v-html="title"></span>
            <div class="my-show-tip" v-if="tip">{{ tip }}</div>
            <slot name="right"></slot>
        </div>
        <slot></slot>
        <div class="show-ul" :class="{ 'is-line': isInline, 'is-few': isFlex }">
            <div class="show-li" :class="{ 'w-100': item.isFull, 'is-large': isLarge, 'is-warp': item.isWarp }" v-for="item in showList" :key="item.key"
                @click="liClick(item, dataInfo)">
                <span class="show-label" v-if="item.nameCb" v-html="item.nameCb(dataInfo)"></span>
                <span class="show-label" v-else v-html="item.name"></span>
                <span class="show-value show-slot" v-if="item.slot">
                    <slot name="li" :dataInfo="dataInfo" :item="item"></slot>
                </span>
                <span v-else class="show-value" :class="[item.cssCb ? item.cssCb(dataInfo) : '']">{{
                    friendlyNumber(
                        item.cb
                            ? item.cb(dataInfo)
                            : item.parent
                                ? dataInfo[item.parent][item.key]
                                : setValue(dataInfo[item.key]),false,true
                    )
                }}</span>
            </div>
            <slot name="li-footer"></slot>
        </div>
        <slot name="ope"></slot>
    </div>
</template>

<style scoped lang="scss">
.my-show-title {
    font-weight: 500;
    font-size: 14px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 14px;
    display: flex;
    align-items: center;
}

.my-show-tip {
    font-weight: 400;
    font-size: 10px;
    color: #868686;
    line-height: 12px;
    margin-left: 4px;
    margin-right: auto;
}

.show-ul {
    &.is-line {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;

        .show-li {
            flex-direction: column;
            align-items: flex-end;
            width: 40%;
            flex: auto;
            text-align: right;
            align-items: flex-start;
            text-align: left;
           
            &:nth-of-type(even) {
                align-items: flex-end;
                text-align: right;
            }
        }

        .show-value {
            margin-top: 8px;
        }
    }

    .show-li {
        margin-top: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .show-label {
        font-weight: 400;
        font-size: 12px;
        color: #868686;
        line-height: 14px;
        display: flex;
        align-items: center;
        min-width: 100px;
    }

    .show-value {
        font-family: DIN;
        font-weight: 500;
        font-size: 12px;
        // color: #ffffff;
		color: var(--text-color);
        line-height: 14px;
        text-align: right;
        display: flex;
        align-items: center;
        word-break: break-all;
    }
}

.is-few {
    display: flex;
    flex-wrap: wrap;
    margin-left: -20px;

    .show-li {
        margin-left: 20px;
        width: 40%;
        flex: auto;

        .show-label {
            flex-shrink: 0;
        }
    }
}

.w-100 {
    width: 100% !important;
    max-width: 100% !important;
}

.font-15 {
    font-weight: 500;
    font-size: 15px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 18px;
}

.is-large {
    .show-label {
        font-size: 14px;
        color: #8B939A;
    }
    .show-value {
        font-size: 15px;
        // color: #fff;
		color: var(--text-color);
        line-height: 18px;
    }
}
.is-warp{
               display: block !important;
            }
</style>
