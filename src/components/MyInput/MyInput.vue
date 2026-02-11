<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { useVModel } from '@vueuse/core'
import { getAreaCodeApi } from '@/api/common'
const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: 'text',
    },
    label: {
        type: String,
        default: '',
    },
    propName: {
        type: String,
        default: '',
    },
    errorObj: {
        type: Object,
        default: () => ({}),
    },
    isSelect: {
        type: Boolean,
        default: false,
    },
    showCode: {
        type: Boolean,
        default: false,
    },
    codeValid: {
        type: [Function, String, Boolean, Number],
        default: () => true,
    },
    className: {
        type: String,
        default: '',
    },
    isPhone: {
        type: Boolean,
        default: false,
    },
    getCode: {
        type: Function,
    },
    max: {
        type: [Number, String],
    },
    min: {
        type: [Number, String],
    },
    hasSuffix: {
        type: Boolean,
        default: false,
    },
    noB: {
        type: Boolean,
        default: false,
    },
    fromLabel: {
        type: String,
    },
    title: {
        type: String,
        default: '',
    },
    classList: {
        type: String,
        default: '',
    },
    cfId: {
        type: String,
        default: 'cf-turnstile-id',
    },
    isLarge: {
        type: Boolean,
        default: false,
    },
    isIn: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['update:modelValue', 'getCodeError', 'changePhoneCode'])
const data = useVModel(props, 'modelValue', emit)

// 验证码倒计时
let timer = null
let time = ref(0)
const isFirst = ref(true)
const getCodeValue = () => {
    if (!props.codeValid) {
        emit('getCodeError', {})
    } else {
        // turnstile.ready(function () {
            if (isFirst.value) {
                turnstile.render(`#${props.cfId}`, {
                    sitekey: '0x4AAAAAACCtpxkVHVUG6kb_',
                    callback: function (token) {
                        codeHandle(token)
                    },
                    theme: 'dark',
                })
                isFirst.value = false
            } else {
                turnstile.reset(`#${props.cfId}`)
            }
        // })
    }
}
const codeHandle = async token => {
    if (time.value === 0 && props.codeValid) {
        if (props.getCode) {
            try {
                await props.getCode(token)
                emit('getCodeError', {})
            } catch (error) {
                emit('getCodeError', error)
                return
            }
        }
        // emit('getCode', token)
        time.value = 60
        timer = setInterval(() => {
            time.value--
            if (time.value === 0) {
                clearInterval(timer)
                time.value = 0
            }
        }, 1000)
    }
}
onUnmounted(() => {
    clearInterval(timer)
})
const phoneCode = ref('')
const prePhoneList = ref([])
onMounted(() => {
    if (props.isPhone) {
        // 获取国际区域号
        getAreaCodeApi().then(data => {
            prePhoneList.value = Object.entries(data).map(([key, value]) => ({
                value: value,
                name: key,
            }))
            if (prePhoneList.value.length > 0) {
                changePhoneCode(prePhoneList.value[0].value)
            }

        })
    }
})
const changePhoneCode = (value) => {
    phoneCode.value = value
    emit('changePhoneCode', value)
}
</script>
<!--  -->
<template>
    <div v-if="title" class="from-title">{{ title }}</div>
    <div :class="[showCode ? 'flex' : '', classList]">
        <div class="from-label" v-if="fromLabel">{{ fromLabel }}</div>
        <div class="my-input" :class="{ 'is-large': isLarge, 'no-b': noB, 'is-in': isIn }" >
            <el-input v-model="data" :placeholder="placeholder" autosize size="large" :type="type" v-bind="$attrs"
                :max="max" :min="min">
                <template #prepend v-if="label">
                    <span class="input-label">{{ label }}</span>
                </template>
                <template #prepend v-else-if="isPhone">
                    <div class="my-input-phone-pre">
                        <el-select popper-class="my-select-popper" v-model="phoneCode" @change="changePhoneCode" placeholder="">
                            <el-option v-for="item in prePhoneList" :key="item.value" :label="item.name" :value="item.value" />
                        </el-select>
                    </div>
                </template>
                <template #suffix v-if="hasSuffix">
                    <slot name="suffix" />
                </template>
            </el-input>
            <div class="my-input-error" v-if="errorObj[propName]">
                <img src="./img/error.svg" alt="" class="error-img" />
                {{ errorObj[propName] }}
            </div>
        </div>
        <div v-if="showCode" class="code-get" :class="{ 'is-large': isLarge }"
            :style="{ cursor: time === 0 && props.codeValid ? 'pointer' : 'not-allowed' }" @click="getCodeValue">
            {{ time === 0 ? $t('forgetPwd.button1') : `${time}S` }}
        </div>
    </div>
    <div :id="cfId" class="cf-turnstile" v-if="showCode"></div>
</template>

<style scoped lang="scss">
	:global(.el-input-group__prepend) {
	  border-radius: 20px !important;
	  overflow: hidden; /* 非常关键 */
	}
	
	
	
	:global(.my-select-popper.el-popper),
	:global(.my-select-popper.el-select__popper) {
	  background: var(--bg-popup) !important;
	  border: 1px solid var(--border-color) !important;
	  color: var(--text-primary) !important;
	  box-shadow: var(--shadow-popup) !important;
	}
	
	:global(.my-select-popper .el-select-dropdown),
	:global(.my-select-popper .el-select-dropdown__wrap),
	:global(.my-select-popper .el-scrollbar),
	:global(.my-select-popper .el-scrollbar__view),
	:global(.my-select-popper .el-scrollbar__wrap) {
	  background: var(--bg-popup) !important;
	}
	
	:global(.my-select-popper .el-select-dropdown__item) {
	  color: var(--text-primary) !important;
	}
	
	:global(.my-select-popper .el-select-dropdown__item:hover),
	:global(.my-select-popper .el-select-dropdown__item.hover) {
	  background: var(--bg-hover) !important;
	}
	
	:global(.my-select-popper .el-select-dropdown__item.is-selected) {
	  background: var(--bg-hover) !important;
	  color: var(--text-primary) !important;
	}
	
	:global(.my-select-popper .el-select-group__title) {
	  color: var(--text-secondary) !important;
	}
	
	:global(.my-select-popper .el-popper__arrow::before) {
	  background: var(--bg-popup) !important;
	  border: 1px solid var(--border-color) !important;
	}
	
	:global(.my-select-popper .el-scrollbar__bar.is-vertical > div),
	:global(.my-select-popper .el-scrollbar__bar.is-horizontal > div) {
	  background: var(--scrollbar-thumb) !important;
	}
	
	
 :deep(.el-input-group__prepend) {
    background-color: var(--bg-card);
    
  }
.my-input {
  margin-bottom: 16px;
  width: 100%;
  flex: auto;

  :deep(.el-input__wrapper) {
    background-color: var(--bg-card);
    border-color: var(--bg-card);
    box-shadow: none;
    border-radius: 20px;

    .el-input__inner {
      color: var(--text-primary);
    }
  }

  &.is-large {
    :deep(.el-input__wrapper) {
      height: 64px;
    }
  }

  &.no-b {
    margin-bottom: 0px;
  }
}

.my-input-error {
  color: var(--color-danger);
  font-family: Inter;
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  display: flex;
  align-items: center;
  margin-top: 10px;

  .error-img {
    width: 18px;
    height: 18px;
    margin-right: 8px;
  }
}

.code-get {
  min-width: 142px;
  height: 40px;
  padding: 0 16px;
  background-color: var(--bg-hover);
  color: var(--text-primary);
  font-family: 'PingFang SC';
  font-size: 14px;
  line-height: 120%;
  flex-shrink: 0;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 20px;
}

.is-large {
  &.code-get {
    height: 64px;
  }
}

.cf-turnstile {
  margin: 0 auto;
  width: 300px;
}

.my-input-phone-pre {
  position: relative;
  display: flex;
  font-size: 16px;
  align-items: center;
  z-index: 9;
  color: var(--text-primary);
  justify-content: center;
  min-width: 80px;
 
  :deep(.el-select__wrapper) {
    box-shadow: none !important;
    border-radius: 4px;
    border: none;
    padding: 0 !important;
    background-color: transparent;
  }

  &::after {
    position: absolute;
    right: -20px;
    content: '';
    width: 1px;
    height: 20px;
    background-color: var(--border-color);
  }
}

.from-title {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 22px;
  margin-bottom: 16px;
}

.input-label {
  font-weight: 400;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 17px;

  &::before {
    content: '*';
    display: inline-block;
    width: 8px;
    font-size: 14px;
    font-weight: 400;
    color: var(--color-danger);
    margin-right: 4px;
  }
}

.from-label {
  font-weight: 500;
  font-size: 15px;
  color: var(--text-primary);
  line-height: 18px;
  margin-bottom: 12px;
}

.is-in {
  :deep(.el-input__wrapper) {
    background-color: var(--bg-page) !important;
    border-color: var(--bg-page) !important;
  }
}
</style>
