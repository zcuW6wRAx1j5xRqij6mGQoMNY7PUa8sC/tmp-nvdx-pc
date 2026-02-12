<script setup>
// 传入属性tabList 选项卡列表， tabActive 选中的选项卡
import { ref, watchEffect, computed } from 'vue'
const props = defineProps({
    tabList: {
        type: Array,
        default: () => [],
    },
    tabActive: {
        type: [Number, String],
        default: '',
    },
    isBlock: {
        type: Boolean,
        default: false,
    },
    isMultiple: {
        type: Boolean,
        default: false,
    },
    isSelect: {
        type: Boolean,
        default: false,
    },
    isSmall: {
        type: Boolean,
        default: false,
    },
    isScroll: {
        type: Boolean,
        default: false,
    },
    isFlex: {
        type: Boolean,
        default: false,
    },
    isLarge: {
        type: Boolean,
        default: false,
    },
    isShrink: {
        type: Boolean,
        default: false,
    },
    isFew: {
        type: Boolean,
        default: false,
    },
})
const activeList = ref([])
const tabActive = ref()
let init = true
const activeName = ref('')
watchEffect(() => {
    if (init) {
        if (props.isMultiple) {
            activeList.value = props.tabActive || []
        } else {
            tabActive.value = props.tabActive
            activeName.value = props.tabActive
        }
        init = false
    }
})
const tabListShow = computed(() => {
    let list = props.tabList
	console.log(list);
    return list
})
const emit = defineEmits(['tabChange'])
const tabClick = item => {
    if (props.isMultiple) {
        if (activeList.value.includes(item.id)) {
            activeList.value = activeList.value.filter(id => id !== item.id)
        } else {
            activeList.value.push(item.id)
        }
    } else {
        tabActive.value = item.id
    }
    let checkItems = []
    if (props.isMultiple) {
        props.tabList.forEach(item => {
            if (activeList.value.includes(item.id)) {
                checkItems.push(item)
            }
        })
    } else {
        checkItems = props.tabList.find(item => item.id === tabActive.value)
    }
    emit('tabChange', props.isMultiple ? activeList.value : tabActive.value, checkItems)
}
const change = (id, name) => {
    tabActive.value = id
    emit('tabChange', id, { id, name })
}
</script>
<!--  -->
<template>
    <div
        v-if="isBlock || isSelect"
        class="tab-box"
        :style="{
            'justify-content': isBlock ? 'space-between ' : 'flex-start',
        }"
        :class="{ 'is-small': isSmall, 'is-Scroll': isScroll, 'is-large': isLarge }"
    >
        <div
            v-for="item in tabListShow"
            :key="item.id"
            :class="[
                isFlex ? 'item-flex-auto' : '',
                isBlock ? 'tab-block' : isSelect ? 'tab-select' : 'tab-item',
                isMultiple
                    ? activeList.includes(item.id)
                        ? 'active'
                        : ''
                    : tabActive === item.id && 'active',
                !!item.name ? '' : 'is-empty',
            ]"
            @click="tabClick(item)"
        >
            {{ item.name }}
        </div>
    </div>
    <van-tabs
        v-else
        v-model:active="activeName"
        @change="change"
        background="transparent"
        color="#0CAF60"
        title-active-color="#0CAF60"
        title-inactive-color="var(--muted-text)"
        line-width="30"
        :shrink="isShrink"
        :class="{ 'is-small': isSmall, 'is-few': isFew }"
    >
        <van-tab
            v-for="item in tabListShow"
            :key="item.id"
            :title="item.name"
            :name="item.id"
        ></van-tab>
    </van-tabs>
</template>

<style scoped lang="scss">
.tab-box {
    display: flex;
    flex-wrap: wrap;
    margin-left: -24px;
    overflow: auto;
    flex-shrink: 0;
    max-height: 65vh;
    &.is-Scroll {
        flex-wrap: nowrap;
        overflow-x: auto;
    }
}
.tab-item {
    position: relative;
    color: var(--muted-text);
    font-size: 15px;
    margin-left: 24px;
    font-weight: 500;
    line-height: 18px;
    word-break: keep-all;
    padding-bottom: 5px;
    &.active {
        color: #0CAF60;
        &::after {
            content: '';
            position: absolute;
            z-index: 9;
            display: block;
            width: 30px;
            height: 3px;
            flex-shrink: 0;
            bottom: -1px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #0CAF60;
            border-radius: 8px;
        }
    }
}
.is-large {
    display: flex;
    justify-content: space-between;
    padding: 16px;
    .tab-item {
        text-align: center;
        flex: auto;
        padding-bottom: 8px;
    }
}
.item-flex-auto {
    flex: auto;
    text-align: center;
}
.tab-block {
    color: var(--muted-text);
    text-align: center;
    font-family: 'PingFang SC';
    font-size: 13px;
    font-style: normal;

    line-height: normal;
    padding: 4px 10px;
    min-width: 58px;
    border-radius: 8px;
    background: #0CAF60;
    text-align: center;
    margin-left: 24px;
    margin-top: 10px;
    flex: auto;
    &.active {
        color: var(--text-color);
    }
}
.tab-select {
    font-weight: 500;
    font-size: 15px;
    color: var(--muted-text);
    line-height: 18px;
    text-align: center;
    font-style: normal;
    text-transform: none;
    word-break: break-all;
    margin-left: 24px;
    &.active {
        color: var(--text-color);
    }
}
.is-empty {
    visibility: hidden;
}
.is-small {
    margin-left: -12px;
    flex-wrap: wrap;
    .tab-select {
        color: var(--muted-text);
        text-align: center;
        font-family: 'PingFang SC';
        font-size: 12px;
        font-style: normal;
        line-height: normal;
        padding: 4px;
        border-radius: 4px;
        text-align: center;
        margin-left: 12px;
        margin-top: 10px;
        flex: none;
        width: auto;
        &.active {
            color: var(--text-color);
            font-weight: bold;
        background: #0CAF60;

        }
    }
}
:deep(.van-tab__text) {
    font-family: PingFang SC;
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
}
:deep(.van-tabs__nav--line.van-tabs__nav--complete) {
    padding-left: 0;
    padding-right: 0;
    margin-left: -12px;
}
:deep(.van-tabs__wrap) {
    height: 40px;
}
:deep(.van-tab) {
    padding-left: 12px !important;
    padding-right: 12px !important;
}
.is-few {
    width: 100%;
    display: flex;
    justify-content: space-between;
    :deep(.van-tab) {
        margin-right: 24px;
        flex: auto;
        &:last-child {
            margin-right: 0;
        }
    }
}
</style>