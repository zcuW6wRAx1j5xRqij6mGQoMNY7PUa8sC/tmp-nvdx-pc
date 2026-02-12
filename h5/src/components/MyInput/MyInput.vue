<script setup>
import { ref, defineProps, defineEmits, onUnmounted, onMounted, nextTick } from 'vue'
import { useVModel } from '@vueuse/core'
import { getAreaCodeApi } from '@/api/common'
import { onClickOutside } from '@vueuse/core'
import { showLoadingToast } from 'vant'
const target = ref(null)
onClickOutside(target, () => {
    showSelectOpacity.value = false
    showSelect.value = false
})
const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
    },
    isPhone: {
        type: Boolean,
        default: false,
    },
    isSearch: {
        type: Boolean,
        default: false,
    },
    showSee: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        default: 'text',
    },
    error: {
        type: String,
        default: '',
    },
    label: {
        type: String,
        default: '',
    },
    isBlock: {
        type: Boolean,
        default: false,
    },
    propName: {
        type: String,
        default: '',
    },
    errorObj: {
        type: Object,
        default: () => ({}),
    },
    showCode: {
        type: Boolean,
        default: false,
    },
    codeValid: {
        type: Boolean,
        default: () => true,
    },
    showForget: {
        type: Boolean,
        default: false,
    },
    isSelect: {
        type: Boolean,
        default: false,
    },
    dataList: {
        type: Array,
        default: () => [],
    },
    isLast: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: '',
    },
    selectAndInput: {
        type: Boolean,
        default: false,
    },
    isSmall: {
        type: Boolean,
        default: false,
    },
    hasLeft: {
        type: Boolean,
        default: false,
    },
    cfId: {
        type: String,
        default: 'cf-turnstile-id',
    },
    isInCard: {
        type: Boolean,
        default: false,
    },
    selectHeight: {
        type: String,
        default: '50%',
    },
    large: {
        type: Boolean,
        default: false,
    },
    noSelect: {
        type: Boolean,
        default: false,
    },
    getCode: {
        type: Function,
    },
    hasSearch: {
        type: Boolean,
        default: false,
    },
    isNoOpe: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['update:modelValue', 'getCode', 'selectChange', 'getCodeError'])
const data = useVModel(props, 'modelValue', emit)
const showPwd = ref(false)
// 验证码倒计时
const time = ref(0)
let timer = null
const isFirst = ref(true)
const getCodeValue = () => {
	
	
	if (!props.codeValid) {
	        emit('getCodeError', {})
	        return
	    }
	
	    // ❌ 关闭 Cloudflare Turnstile
	    // 直接走发验证码逻辑
	    codeHandle('')
		
	
    // if (!props.codeValid) {
    //     emit('getCodeError', {})
    // } else {
    //     // turnstile.ready(function () {
    //     if (isFirst.value) {
    //         turnstile.render(`#${props.cfId}`, {
    //             sitekey: '0x4AAAAAACCtpxkVHVUG6kb_',
    //             callback: function (token) {
    //                 codeHandle(token)
    //             },
    //             theme: 'dark',
    //         })
    //         isFirst.value = false
    //     } else {
    //         turnstile.reset(`#${props.cfId}`)
    //     }
    //     // })
    // }
}
const codeHandle = async token => {
    console.log(token)
    if (time.value === 0 && props.codeValid) {
        if (props.getCode) {
            try {
                showLoadingToast({})
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

const showSelectOpacity = ref(false)
const showSelect = ref(false)
const showPhonePre = ref('')
const changeSelect = (val, item) => {
    showSelect.value = false
    showSelectOpacity.value = false
    // 清空搜索关键词
    keyWord.value = ''
    if (props.isPhone) {
        showPhonePre.value = item.name
    }
    emit('selectChange', val, item)
}

const showHandle = () => {
    if (props.isNoOpe) {
        return
    }
    if (props.isSelect && !props.noSelect) {
        showSelect.value = !showSelect.value
        showSelectOpacity.value = true
        // 重置搜索关键词
        if (showSelect.value && props.hasSearch) {
            keyWord.value = ''
        }
    }
    if (props.isPhone) {
        showSelect.value = !showSelect.value
        showSelectOpacity.value = showSelect.value
    }
}
const showSelectAndInput = () => {
    if (props.isNoOpe) {
        return
    }
    showSelect.value = !showSelect.value
    showSelectOpacity.value = showSelect.value
    // 重置搜索关键词
    if (showSelect.value && props.hasSearch) {
        keyWord.value = ''
    }
}

// 处理输入框点击事件
const handleFieldClick = () => {
    if (props.isNoOpe) {
        return
    }

    // 只有 isSelect 模式：点击输入框展开下拉列表
    if (props.isSelect && !props.noSelect) {
        if (!showSelect.value) {
            showSelect.value = true
            showSelectOpacity.value = true
            // 重置搜索关键词
            if (props.hasSearch) {
                keyWord.value = ''
            }
        }
    }
}

const prePhoneList = ref([])
onMounted(() => {
    if (props.isPhone) {
        const mCode = '+1'
        let mIndex = 0
        // 获取国际区域号
        getAreaCodeApi().then(data => {
            prePhoneList.value = Object.entries(data).map(([key, value]) => ({
                value: value,
                name: key,
            }))
            mIndex = prePhoneList.value.findIndex(item => item.value === mCode)
            if (prePhoneList.value.length > 0) {
                changeSelect(prePhoneList.value[mIndex].value, prePhoneList.value[mIndex])
            }

        })
    }
})
const keyWord = ref('')
const selectList = computed(() => {
    const list = props.isPhone ? prePhoneList.value.filter(item => item.name.includes(keyWord.value)) : props.dataList
    if (props.hasSearch) {
        return list.filter(item => {
            return item.name.indexOf(keyWord.value) > -1
        })
    } else {
        return list
    }
})
</script>
<!--  -->
<template>
    <div class="my-input" :class="{
        'is-block': isBlock,
        'is-small': isSmall,
        'mb-0': isLast,
        isInCard: isInCard,
        large: large,
        'is-select': showSelect,
    }" ref="target">
        <div class="my-input-title flex justify-between" v-if="label">
            {{ label }}<slot name="top-label"></slot>
            <div class="forget-pwd" v-if="showForget" @click="$router.push('/ForgetPwd')">
                {{ $t('common.forgetPwd') }}
            </div>
        </div>

        <van-field v-model="data" :type="showSee ? (showPwd ? 'text' : 'password') : type" :placeholder="placeholder"
            autosize v-bind="$attrs" :class="{ isPhone: isPhone }" @click="handleFieldClick">
            <template #label v-if="isPhone">
                <div class="my-input-phone-pre" @click.stop="showHandle">
                    <span class="mr-3">{{ showPhonePre }}</span>
                </div>
            </template>
            <template #label v-else-if="hasLeft">
                <slot name="left"></slot>
            </template>
            <template #left-icon v-if="isSearch">
                <img src="./img/search.svg" alt="" />
            </template>
            <template #right-icon v-if="showSee">
                <div class="flex">
					<svg class="icon-eye" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" v-show="!showPwd" @click="showPwd = !showPwd">
					  <g id="Component 9">
					    <path
					      id="Vector (Stroke)"
					      fill-rule="evenodd"
					      clip-rule="evenodd"
					      d="M1.91075 1.91083C2.23619 1.58539 2.76382 1.58539 3.08926 1.91083L5.62342 4.44499C6.96313 3.71539 8.46787 3.33144 10.0006 3.33341C14.1064 3.33366 17.5791 6.0324 18.7475 9.75024C18.7987 9.91321 18.7986 10.088 18.7472 10.2509C18.2051 11.9684 17.1728 13.4813 15.7878 14.6093L18.0893 16.9108C18.4147 17.2363 18.4147 17.7639 18.0893 18.0893C17.7638 18.4148 17.2362 18.4148 16.9107 18.0893L13.9214 15.1C13.9212 15.0998 13.921 15.0996 13.9208 15.0994L11.1783 12.3578C11.1709 12.3504 11.1637 12.3428 11.1566 12.3352L7.64249 8.82191C7.63506 8.81448 7.62778 8.80693 7.62067 8.79925L1.91075 3.08934C1.58531 2.7639 1.58531 2.23626 1.91075 1.91083ZM9.56819 8.39041L11.6098 10.4315C11.6471 10.2921 11.6665 10.1473 11.6665 10.0005C11.6665 9.55841 11.4909 9.13444 11.1783 8.82184C10.8657 8.50924 10.4417 8.33362 9.99959 8.33362C9.85265 8.33362 9.7077 8.35302 9.56819 8.39041ZM12.8712 11.6935C13.1711 11.1848 13.3331 10.601 13.3331 10.0005C13.3331 9.11639 12.9819 8.26849 12.3568 7.64333C11.7316 7.01816 10.8837 6.66695 9.99959 6.66695C9.39924 6.66695 8.81558 6.8289 8.30703 7.12859L6.86428 5.68584C7.84326 5.23435 8.91249 4.99861 9.99888 5.00008L10 5.00008C13.2645 5.00008 16.0435 7.08605 17.0739 9.99962C16.5929 11.3561 15.7336 12.5435 14.6017 13.4234L12.8712 11.6935ZM3.8531 6.81158C4.22 7.08944 4.29219 7.61211 4.01434 7.97901C3.54932 8.59306 3.18232 9.27487 2.92591 10.0001C3.95627 12.9139 6.73536 15.0001 10 15.0001C10.4721 15.0004 10.9438 14.9565 11.4077 14.8688C11.8599 14.7832 12.2958 15.0805 12.3813 15.5327C12.4668 15.985 12.1696 16.4209 11.7173 16.5064C11.151 16.6135 10.5758 16.6672 9.99937 16.6667C9.99916 16.6667 9.99958 16.6667 9.99937 16.6667C5.89354 16.6665 2.42091 13.9677 1.25251 10.2499C1.20139 10.0873 1.20139 9.91282 1.25253 9.75016C1.56728 8.74898 2.05208 7.80947 2.68567 6.97282C2.96353 6.60592 3.4862 6.53373 3.8531 6.81158Z"
					      fill="currentColor"
					    />
					  </g>
					</svg>
					<svg  class="icon-eye" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" v-show="showPwd" @click="showPwd = !showPwd">
					  <g id="Component 10">
					    <path
					      id="Vector"
					      d="M12.5 10C12.5 10.663 12.2366 11.2989 11.7678 11.7678C11.2989 12.2366 10.663 12.5 10 12.5C9.33696 12.5 8.70107 12.2366 8.23223 11.7678C7.76339 11.2989 7.5 10.663 7.5 10C7.5 9.33696 7.76339 8.70107 8.23223 8.23223C8.70107 7.76339 9.33696 7.5 10 7.5C10.663 7.5 11.2989 7.76339 11.7678 8.23223C12.2366 8.70107 12.5 9.33696 12.5 10Z"
					      fill="currentColor"
					      stroke="currentColor"
					      stroke-width="1.5"
					      stroke-linecap="round"
					      stroke-linejoin="round"
					    />
					    <path
					      id="Vector_2"
					      d="M2.04834 10.0001C3.11001 6.61925 6.26917 4.16675 10 4.16675C13.7317 4.16675 16.89 6.61925 17.9517 10.0001C16.89 13.3809 13.7317 15.8334 10 15.8334C6.26917 15.8334 3.11001 13.3809 2.04834 10.0001Z"
					      stroke="currentColor"
					      stroke-width="1.5"
					      stroke-linecap="round"
					      stroke-linejoin="round"
					    />
					  </g>
					</svg>
                    <!-- <img src="./img/eye-close.svg" v-show="!showPwd" @click="showPwd = !showPwd"
                        class="my-input-eye-close" alt="" /> -->
                   <!-- <img src="./img/eye.svg" v-show="showPwd" @click="showPwd = !showPwd" class="my-input-eye-close"
                        alt="" /> -->
                </div>
            </template>
            <template #right-icon v-else-if="showCode">
                <div class="my-code-box" @click="getCodeValue" :class="{ disabled: !codeValid }">
                    <span v-if="time === 0">{{ $t('common.getCode') }}</span>
                    <span v-else>{{ time }}s</span>
                </div>
            </template>
            <template #right-icon v-else-if="isSelect || selectAndInput">
                <div class="flex items-center text-theme" @click.stop="showSelectAndInput">
                    <slot name="select"></slot>
					<svg class="icon-eye" width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path id="Polygon 5" d="M3.37814 6.23756C3.7876 6.7369 4.55151 6.7369 4.96098 6.23756L8.14411 2.35578C8.60063 1.79906 8.20456 0.962061 7.48459 0.962061L0.854525 0.962061C0.134554 0.96206 -0.261519 1.79906 0.195007 2.35578L3.37814 6.23756Z" fill="currentColor"/>
					</svg>
					
                    <!-- <img src="../../assets/img/arrow-down.svg" alt="" class="arrow-down" /> -->
                </div>
            </template>
            <template #right-icon v-else>
                <slot name="right"></slot>
            </template>
        </van-field>
        <div class="my-input-error" v-if="errorObj[propName]">
            <img src="./img/error.svg" alt="" class="error-img" />
            {{ errorObj[propName] }}
        </div>
        <div class="my-select-box" :style="{
            opacity: showSelectOpacity ? 1 : 0,
            transform: `scale(${showSelectOpacity ? 1 : 0.7})`,
        }" v-if="isSelect || selectAndInput || isPhone" v-show="showSelect">
            <!-- 搜索框 -->
            <div class="my-select-search" v-if="hasSearch">
                <van-field v-model="keyWord" class="search-input">
                    <template #left-icon>
                        <img src="./img/search.svg" alt="" />
                    </template>
                </van-field>
            </div>

            <div class="my-select-li" v-for="item in selectList" :key="item.value"
                @click.stop="changeSelect(item.value, item)">
                {{ item.name }}
            </div>
        </div>
    </div>
    <div :id="cfId" class="cf-turnstile" v-if="showCode"></div>
    <!-- <MySelect
        v-if="isSelect || selectAndInput"
        v-model="showSelect"
        :dataList="dataList"
        @confirm="changeSelect"
        :selectHeight="selectHeight"
    ></MySelect> -->
</template>

<style scoped lang="scss">
	.icon-eye {
	  color: var(--text-color); /* 日间黑 / 黑夜白 */
	}
:deep(.van-cell:after) {
    display: none;
}

.my-input {
    position: relative;
    margin-bottom: 16px;

    &.mb-0 {
        margin-bottom: 0 !important;
    }
}

.my-input-title {
    color: var(--text-color);
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.my-input-phone-pre {
    position: relative;
    display: flex;
    font-size: 16px;
    align-items: center;
    z-index: 9;
    color: var(--text-color);
    justify-content: center;

    &::after {
        position: absolute;
        right: 2px;
        content: '';
        width: 1px;
        height: 20px;
        background-color: #1C1E27;
    }
}

:deep(.van-field) {
    border-radius: 18px;
    padding: 14px 16px;
    background: var(--self-bg);
    display: flex;
    align-items: center;
    color: var(--text-color);
    border: 1px solid #303030;
}

:deep(.van-field--disabled .van-field__control) {
    color: #666666;
}

.is-small {
    .van-field {
        padding: 9px 10px !important;
        min-height: 30px;
    }

    .my-input {
        margin-bottom: 12px;
    }
}

.my-code-box {
    color: var(--text-color);
    text-align: center;
    font-size: 14px;

    &.disabled {
        color: var(--label-text);
    }
}

.forget-pwd {
    color: var(--text-color);
    text-align: center;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: -0.42px;
    display: flex;
    align-items: center;

    &::before {
        width: 2px;
        height: 16px;
        background-color: var(--text-color);
        margin-right: 8px;
        margin-left: 8px;
        display: inline-block;
    }
}

.is-select {
    :deep(.van-field) {
        // border: 1px solid #1EB576;
    }
}

:deep(.van-field__control) {
    color: var(--text-color);
    font-size: 15px;
    font-style: normal;
    line-height: normal;

    .my-input-eye-close {
        width: 20px;
        height: 20px;
    }

    .cf-turnstile {
        margin: 0 auto;
        width: 300px;
    }
}

.my-input-error {
    color: var(--Danger-Hover, #bd251c);

    /* Body3/400 */
    font-family: Inter;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    /* 133.333% */
    display: flex;
    margin-top: 10px;

    .error-img {
        width: 16px;
        height: 16px;
        margin-right: 8px;
    }
}

.arrow-down {
    width: 10px;
}

.my-select-box {
    transition:
        opacity 0.15s,
        transform 0.15s;
    position: absolute;
    z-index: 999;
    width: 100%;
    padding: 16px;
    background: var(--surface-bg);
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 8px;
    max-height: 40vh;
    overflow: auto;

    .my-select-search {
        margin-bottom: 16px;

        .search-input {
            :deep(.van-field) {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 8px 12px;

                .van-field__control {
                    color: var(--text-color);
                    font-size: 14px;

                    &::placeholder {
                        color: rgba(255, 255, 255, 0.5);
                    }
                }

                .van-field__left-icon {
                    color: rgba(255, 255, 255, 0.7);
                }
            }
        }
    }

    .my-select-li {
        margin-bottom: 20px;

        &:last-child {
            margin-bottom: 0;
        }
    }
}

.isPhone {
    :deep(.van-field__label) {
        width: auto;
    }
}

/* ✅ 只用于替换 template 里的 text-white（不改布局） */
.text-theme {
    color: var(--text-color);
}
</style>