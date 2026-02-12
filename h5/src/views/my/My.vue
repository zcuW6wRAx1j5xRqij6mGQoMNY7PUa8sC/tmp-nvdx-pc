<script setup>
import { getWalletApi, signInApi } from '@/api/my'
import copy from '@/utils/copy.js'
import { useI18n } from 'vue-i18n'
import { setDataToNumber, friendlyNumber, setBaseUrl, formatNumber } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { useUserInfo } from '@/hooks/useUserInfo'
import { version as packageVer } from '../../../package.json'
import { showSuccessToast, showLoadingToast } from 'vant'
import WalletDetail from './WalletDetail.vue'
const { userInfo, initUserData } = useUserInfo()
const { t } = useI18n()
const router = useRouter()
const wallet = ref({})

function getImageUrl(imageName) {
    return new URL(`./img/${imageName}.svg`, import.meta.url).href
}
onMounted(() => {
    // 钱包信息
    getWalletApi().then(data => {
        wallet.value = setDataToNumber(data || {})
    })
})

const toPage = (path, query = {}) => {
   
    router.push({
        path,
        query,
    })
}
// 对币的操作
const opeMoneyList = computed(() => {
    return [
        {
            name: t('userPopup.btn2'),
            path: '/Recharge',
            img: getImageUrl('btn2'),
        },
        {
            name: t('userPopup.btn1'),
            path: '/Withdrawal',
            img: getImageUrl('btn1'),
        },
        {
            name: t('userPopup.btn3'),
            path: '/Transform',
            img: getImageUrl('btn3'),
        },
        {
            name: t('setting.sbutitle'),
            path: '/Setting',
            img: getImageUrl('set'),
        },
    ]
})
const total = computed(() => {
    return friendlyNumber(wallet.value.total, false)
})
// 签到
const checkIn = () => {
    if (userInfo.value.today_punch) {
        return
    }
    showLoadingToast({})
    signInApi().then(() => {
        showSuccessToast({})
        initUserData()
    })
}

const vipObj = {
    VIP1: {
       icon: getImageUrl('VIP-icon1'),
       name: getImageUrl('VIP1'),
       processCss: 'vip1',
       value: 9999,
    },
    VIP2: {
        icon: getImageUrl('VIP-icon2'),
        name: getImageUrl('VIP2'),
        processCss: 'vip2',
        value: 9999,
    },
    VIP3: {
        icon: getImageUrl('VIP-icon3'),
        name: getImageUrl('VIP3'),
        processCss: 'vip3',
        value: 9999,
    },
    VIP4: {
        icon: getImageUrl('VIP-icon4'),
        name: getImageUrl('VIP4'),
        processCss: 'vip4',
        value: 9999,
    },
    VIP5: {
        icon: getImageUrl('VIP-icon5'),
        name: getImageUrl('VIP5'),
        processCss: 'vip5',
        value: 9999,
    },
    SVIP: {
        icon: getImageUrl('VIP-iconS'),
        name: getImageUrl('SVIP'),
        processCss: 'vips',
        value: 9999,
    },
}
</script>
<template>
    <div class="my-info">
        <div class="popup-user-info">
            <div class="user-box">
                <div @click="toPage('/SetInfo')" class="flex-shrink-0">
                    <img
                        v-if="userInfo.avatar"
                        :src="setBaseUrl(userInfo.avatar)"
                        alt=""
                        class="avatar"
                    />
                    <img v-else src="./img/avatar.svg" class="avatar" alt="" />
                </div>
                <div>
                    <div class="name">
                        {{ userInfo.name || '-'
                        }}<span class="name-end">{{
                            userInfo.is_verified_identity === 1
                                ? $t('userPopup.endName')
                                : $t('userPopup.noName')
                        }}</span>
                        <img v-if="userInfo.level && userInfo.level.name" :src="getImageUrl(`icon-${userInfo.level.name}`)" class="vip-img" alt="" />
                    </div>
                    <!-- UID： -->
                    <div class="phone">{{ userInfo.id || '-' }}</div>
                </div>
            </div>
            
            <!-- <div class="flex justify-between items-center p-4 mt-2 code-bg mb-2">
                <div class="code flex items-center" @click="copy(userInfo.id)">
                    <span>UID:</span>
                    <span>{{ userInfo.id }}</span>
                    <img src="./img/copy.svg" alt="" class="w-3 ml-1" />
                </div>
                <div class="flex items-center version">version: {{ packageVer }}</div>
            </div> -->
        </div>
        <div class="check-in">
            <span class="check-name">
                {{ $t('userPopup.points') }}
                <span class="check-value c-is-num">{{ userInfo.punch_rewards }}</span>
            </span>
            <span
                class="check-btn"
                @click="checkIn"
                :style="{ opacity: userInfo.today_punch ? 0.5 : 1 }"
                >{{ userInfo.today_punch ? $t('userPopup.checked') : $t('userPopup.check') }}</span
            >
        </div>
        <!-- 操作 -->
        <div class="btn-box ">
            <div
                class="btn-css"
                v-for="item in opeMoneyList"
                :key="item.path"
                @click="toPage(item.path)"
            >
                <div class="svg-box">
                    <img :src="item.img" class="svg-icon" alt="" />
                </div>
                {{ item.name }}
            </div>
        </div>
        <div class="mt-6">
            <div class="card-title flex">
                {{ t('my.wallet') }}(USD)
            </div>
            <div class="card-value">{{ total }}</div>
        </div> 
        <div class="mt-4">
            <div class="card-title">{{ t('my.wallet5') }}(USD)</div>
            <div
                class="day-value"
                :class="[formatNumber(wallet.total_profit) < 0 ? 'red-color' : 'green-color']"
                >{{ wallet.total_profit || 0 }}
                </div
            >
        </div>
        <WalletDetail />
    </div>
</template>
<style lang="scss" scoped>
.my-info {
    padding: 24px 16px;
    flex: auto;
    .card-title {
        font-weight: 400;
        font-size: 12px;
        color: #8b939a;
        line-height: 14px;
    }
    .card-value {
        font-family: DIN;
        font-weight: 500;
        font-size: 20px;
        // color: #ffffff;
		color: var(--text-color);
        line-height: 23px;
        margin-top: 12px;
    }
    :deep(.show-value) {
        font-size: 15px !important;
        line-height: 18px !important;
    }
}
.code {
    font-weight: 400;
    font-size: 12px;
    color: #8b939a;
    line-height: 14px;
}
.btn-box {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 16px;
    .svg-box {
        width: 46px;
        height: 46px;
        margin-bottom: 10px;
        border-radius: 50%;
        background: #1F1F1F;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .svg-icon {
        width: 24px;
        height: 24px;
    }
    .btn-css {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: auto;
        // color: #fff;
		color: var(--text-color);
        text-align: center;
        font-family: 'PingFang SC';
        font-size: 14px;
        font-style: normal;
        // word-break: break-all;
    }
}
.day-value {
    font-family: DIN, DIN;
    font-weight: 500;
    font-size: 15px;
    margin-top: 6px;
}
.popup-user-info {
	border-radius: 10px;
	padding: 10px;
	background-color: var(--surface-bg);
    // background-color: #0E0E0E;
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
        // color: #ffffff;
		color: var(--text-color);
    }
    .phone {
        color: #a1a1a1;
        font-family: 'PingFang SC';
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        letter-spacing: -0.42px;
    }
    .name-end {
        background: #424242;
        padding: 2px 6px;
        font-weight: 400;
        font-size: 13px;
        color: #eeeeee;
        border-radius: 8px;
        margin-left: 8px;
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
}
.check-in {
    display: flex;
    align-items: center;
    padding: 16px;
    // background: #1F1F1F;
	background-color: var(--surface-bg);
    border-radius: 18px;
    margin-top: 16px;
}
.check-name {
    font-weight: 400;
    font-size: 12px;
    color: #8b939a;
    line-height: 14px;
}
.check-value {
    font-weight: 500;
    font-size: 14px;
    // color: #ffffff;
	color: var(--text-color);
}
.check-btn {
    padding: 3px 12px;
    font-weight: 500;
    font-size: 14px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 16px;
    background-color: #1EB576;
    border-radius: 100px;
    margin-left: auto;
}
.fn-title {
    font-weight: 400;
    font-size: 14px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 16px;
    margin-top: 16px;
}
.arrow-right {
    transform: rotate(-90deg);
}
.detail {
    font-weight: 400;
    font-size: 13px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 15px;
    display: flex;
    align-items: center;
    margin-left: auto;
}
.version {
    font-weight: 400;
    font-size: 11px;
    color: #8b939a;
    line-height: 13px;
    text-align: right;
    margin-left: auto;
}
.vip-img {
    width: 24px;
    margin-left: 8px;
    flex-shrink: 0;
}
.vip-name {
    height: 30px;
    flex-shrink: 0;
    width: 23px;
}

.vip-value {
    font-family: DIN, DIN;
    font-weight: 500;
    font-size: 13px;
    // color: #ffffff;
	color: var(--text-color);
    line-height: 15px;
    .vip-count {
        color: #8b939a;
    }
}
.code-bg {
    background-color: #15171E;
}
</style>
