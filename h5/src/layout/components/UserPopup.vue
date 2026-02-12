<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { showSuccessToast } from 'vant'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { version as packageVer } from '../../../package.json'
import { signInApi } from '@/api/my'
import { setBaseUrl } from '@/utils/utils'
const router = useRouter()
const props = withDefaults(
    defineProps<{
        modelValue: boolean
        userInfo: any
    }>(),
    { modelValue: false, userInfo: {} },
)
function getImageUrl(imageName) {
    return new URL(`./img/${imageName}.svg`, import.meta.url).href
}
const emit = defineEmits(['update:modelValue', 'check'])
const data = useVModel(props, 'modelValue', emit)
const showName = ref(false)
const toPage = (path, query = {}) => {
    console.log(path);
    // if (['/Transform', '/Recharge', '/Withdrawal'].includes(path)) {
    //     if (props.userInfo?.is_verified_identity === 0) {
    //         showName.value = true
    //         return
    //     }
    // }
    if (path === '/RealName') {
        if (props.userInfo.is_verified_identity === 1) {
            showSuccessToast(t('my.nameSuccess'))
            return
        }
    } else if (path === '/ChangePwd') {
        if (query && query.pay) {
            router.push({
                path: path,
                query: { pay: 2, has: props.userInfo.has_trade_password ? 1 : 0 },
            })
            return
        }
    } else if (path === '/Out') {
        showOut.value = true
        return
    } else if (path === '/Invite') {
        router.push({
            path,
            query: {
                inviteCode: props.userInfo.invite_code,
                inviteLink: props.userInfo.invite_link,
            },
        })
        return
    } else if (path === '/SetEmail') {
        if (props.userInfo.email) {
            router.push({
                path,
                query: {
                    email: props.userInfo.email,
                },
            })
            return
        }
    } else if (path === '/SetPhone') {
        if (props.userInfo.phone) {
            router.push({
                path,
                query: {
                    phone: props.userInfo.phone,
                },
            })
            return
        }
    }
    router.push({
        path,
        query,
    })
}
// 登出
const showOut = ref(false)
const signOut = () => {
    localStorage.removeItem('token')
    showOut.value = false
    router.push('/Login')
}

// 对币的操作
const opeMoneyList = computed(() => {
    return [
        {
            name: t('userPopup.btn1'),
            path: '/Withdrawal',
            img: getImageUrl('btn2'),
        },
        {
            name: t('userPopup.btn2'),
            path: '/Recharge',
            img: getImageUrl('btn1'),
        },
        {
            name: t('userPopup.btn3'),
            path: '/Transform',
            img: getImageUrl('btn3'),
        },
    ]
})

// 用户菜单操作
const menuList = computed(() => {
    return [
        {
            name: t('userPopup.menu1'),
            img: getImageUrl('ope1'),
            path: '/RealName',
        },
        {
            name: t('tipAll.menu2'),
            img: getImageUrl('ope2'),
            path: '/ChangePwd',
            query: { pay: 1 },
        },
        {
            name: t('userPopup.menu3'),
            img: getImageUrl('ope3'),
            path: '/ChangePwd',
        },
        {
            name: t('userPopup.menu11'),
            img: getImageUrl('ope11'),
            path: '/OrderHis',
        },
        {
            name: t('userPopup.menu10'),
            img: getImageUrl('ope10'),
            path: '/SetPhone',
        },
        {
            name: t('userPopup.menu5'),
            img: getImageUrl('ope5'),
            path: '/SetEmail',
        },
        {
            name: t('userPopup.menu6'),
            img: getImageUrl('ope6'),
            path: '/Agree',
            query: { type: 1 },
        },
        {
            name: t('userPopup.menu7'),
            img: getImageUrl('ope7'),
            path: '/Agree',
            query: { type: 2 },
        },
        {
            name: t('userPopup.menu8'),
            img: getImageUrl('ope8'),
            path: '/Agree',
            query: { type: 3 },
        },
        {
            name: t('userPopup.menu9'),
            img: getImageUrl('ope9'),
            path: '/Out',
        },
    ]
})
// 签到
const checkIn = () => {
    if (props.userInfo.today_punch) {
        return
    }
    signInApi().then(() => {
        emit('check')
        showSuccessToast({})
    })
}
</script>
<!--  -->
<template>
    <van-popup
        v-model:show="data"
        position="left"
        :style="{ width: '75%', height: '100%' }"
        :lock-scroll="false"
        safe-area-inset-top
        safe-area-inset-bottom
    >
        <div class="popup-user-info">
            <div class="user-box">
                <div @click="toPage('/SetInfo')" class="flex-shrink-0">
                    <img
                        v-if="userInfo.avatar"
                        :src="setBaseUrl(userInfo.avatar)"
                        alt=""
                        class="avatar"
                    />
                    <img v-else src="../img/avatar.svg" class="avatar" alt="" />
                </div>
                <div>
                    <div class="name">
                        {{ userInfo.name || '-' }}
                    </div>
                    <div class="phone">{{ userInfo.email || userInfo.phone || '-' }}</div>
                </div>
            </div>
            <div class="flex items-center mt-2">
                <span class="name-end">{{
                    userInfo.is_verified_identity === 1
                        ? $t('userPopup.endName')
                        : $t('userPopup.noName')
                }}</span>
                <div class="user-uid">version: {{ packageVer }}</div>
            </div>
            <div class="check-in">
                <span> {{ $t('userPopup.points') }}{{ userInfo.punch_rewards }}</span>
                <span
                    class="check-btn"
                    @click="checkIn"
                    :style="{ opacity: userInfo.today_punch ? 0.5 : 1 }"
                    >{{
                        userInfo.today_punch ? $t('userPopup.checked') : $t('userPopup.check')
                    }}</span
                >
            </div>
            <div class="btn-box">
                <div
                    class="btn-css"
                    v-for="item in opeMoneyList"
                    :key="item.path"
                    @click="toPage(item.path)"
                >
                    <img :src="item.img" class="svg-icon" alt="" />
                    {{ item.name }}
                </div>
            </div>
        </div>
        <div class="popup-ope">
            <div
                class="ope-li"
                v-for="item in menuList"
                :key="item.path"
                @click="toPage(item.path, item.query)"
            >
                <img :src="item.img" class="w-8 h-8 mr-2" alt="" />
                <div>{{ item.name }}</div>
                <img src="./img/arrow-right.svg" class="arrow-right" alt="" />
            </div>
        </div>
    </van-popup>
    <MyConfirm v-model="showOut" @confirm="signOut" :content="$t('my.outContent')"></MyConfirm>
    <MyConfirm
        hideCancel
        v-model="showName"
        @confirm="$router.push('/RealName')"
        :content="$t('tipAll.tip')"
        :close-on-click-overlay="false"
    ></MyConfirm>
</template>

<style scoped lang="scss">
.van-popup {
    background-color: #14171c;
    overflow: auto;
}
.popup-user-info {
    background-color: #0E0E0E;
    padding: 20px;
    .user-box {
        display: flex;
        align-items: center;
    }
    .avatar {
        border-radius: 50%;
        width: 60px;
        height: 60px;
        flex-shrink: 0;
        margin-right: 12px;
        flex-shrink: 0;
    }
    .name {
        font-size: 20px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        display: flex;
        align-items: center;
        color: #ffffff;
    }
    .phone {
        color: #8b939a;
        font-family: 'PingFang SC';
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        letter-spacing: -0.42px;
    }

    .btn-box {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;
        .svg-icon {
            width: 32px;
            height: 32px;
            margin-bottom: 8px;
        }
        .btn-css {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 48px;
            flex: auto;
            color: #fff;
            text-align: center;
            font-family: 'PingFang SC';
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: 120%; /* 15.6px */
            margin-right: 30px;
            word-break: break-all;
            &:last-child {
                margin-right: 0;
            }
        }
    }
}
.popup-ope {
    padding: 24px;
    margin-top: 10px;
    background-color: #0E0E0E;
    .ope-li {
        margin-bottom: 30px;
        font-weight: 400;
        font-size: 14px;
        color: #ffffff;
        line-height: 16px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        display: flex;
        align-items: center;
        &:last-child {
            margin-bottom: 0;
        }
    }
    .arrow-right {
        width: 10px;
        height: 10px;
        margin-left: auto;
    }
}
.name-end {
    background: rgba(255, 255, 255, 0.11);
    padding: 1px 8px;
    font-weight: 400;
    font-size: 13px;
    color: #eeeeee;
    border-radius: 8px;
}
.user-uid {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 0 8px;
    background: rgba(255, 255, 255, 0.12);
    font-weight: 400;
    font-size: 13px;
    color: #8b939a;
    text-align: left;
    font-style: normal;
    text-transform: none;
    margin-left: 8px;
    border-radius: 8px;
}
.check-in {
    padding: 9px 16px;
    margin-top: 16px;
    background: #14171c;
    border-radius: 27px;
    font-weight: 500;
    font-size: 14px;
    color: #ffffff;
    display: flex;
    align-items: center;
}
.check-btn {
    padding: 3px 16px;
    font-weight: 500;
    font-size: 14px;
    color: #ffffff;
    line-height: 16px;
    background-color: #1EB576;
    border-radius: 100px;
    margin-left: auto;
}
</style>
