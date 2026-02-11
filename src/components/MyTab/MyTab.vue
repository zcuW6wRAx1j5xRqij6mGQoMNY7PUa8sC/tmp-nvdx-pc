<script setup>
// 传入属性tabList 选项卡列表， tabActive 选中的选项卡
import { ref, watchEffect } from 'vue'
const props = defineProps({
    tabList: {
        type: Array,
        default: () => [],
    },
    tabActive: {
        type: [Number, String, Array],
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
    isSmall: {
        type: Boolean,
        default: false,
    },
    isFlex: {
        type: Boolean,
        default: false,
    },
})
const activeList = ref([])
const tabActive = ref()
let init = true
watchEffect(() => {
    if (init) {
        if (props.isMultiple) {
            activeList.value = props.tabActive || []
        } else {
            tabActive.value = props.tabActive
        }
        init = false
    }
})
const tabListShow = computed(() => {
    let list = props.tabList
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
    emit('tabChange', props.isMultiple ? activeList.value : tabActive.value, item)
}
</script>
<!--  -->
<template>
    <div class="tab-box" :style="{ 'justify-content': 'flex-start' }"
        :class="{ 'is-small': isSmall, 'is-flex': isFlex, 'is-block': isBlock }">
        <div v-for="item in tabListShow" :key="item.id" :class="[
            isBlock ? 'tab-block' : 'tab-item',
            isMultiple
                ? activeList.includes(item.id)
                    ? 'active'
                    : ''
                : tabActive === item.id && 'active',
            !!item.name ? '' : 'is-empty',
        ]" @click="tabClick(item)">
            {{ item.name }}
        </div>
    </div>
</template>

<style scoped lang="scss">
.tab-box {
  flex-shrink: 0;
  display: inline-flex;
  flex-wrap: wrap;
  margin-left: -10px;
}

.tab-item {
  position: relative;
  flex: auto;
  text-align: center;
  color: var(--text-primary);
  font-family: 'PingFang SC';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  margin-left: 10px;
  cursor: pointer;
  padding: 8px;
  min-width: 80px;

  &.active {
    background: var(--color-primary); /* ✅ 不用 --el-primary-color 了 */
    border-radius: 14px;
    color: var(--text-primary);
  }
}

.is-empty {
  visibility: hidden;
}

.is-small {
  flex-wrap: wrap;
  justify-content: flex-start !important;

  .tab-block {
    color: var(--text-secondary);
    font-family: 'PingFang SC';
    font-size: 12px;
    font-style: normal;
    line-height: normal;
    padding: 4px;
    border-radius: 4px;
    background: var(--bg-hover);
    text-align: center;
    margin-left: 8px;
    margin-top: 10px;
    flex: none;
    width: auto;

    &.active {
      color: var(--text-primary);
      font-weight: bold;
      background: var(--bg-card);
    }
  }
}

.is-flex {
  padding: 16px;
  margin-left: 0;

  .tab-item {
    flex: none;
    margin-right: 60px;
    margin-left: 24px;
  }
}

.is-block {
  padding: 6px;
  background: var(--bg-page);
  border-radius: 25px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 0;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-self: flex-start;
}

.tab-block {
  flex: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 13px 16px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  color: var(--text-secondary);
  background: transparent;

  &.active {
    background: var(--bg-hover);
    color: var(--text-primary);
    font-weight: bold;
  }
}
</style>
