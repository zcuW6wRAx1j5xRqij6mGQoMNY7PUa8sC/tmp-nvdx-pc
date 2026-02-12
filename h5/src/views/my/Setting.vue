<script setup>
import { useUserInfo } from '@/hooks/useUserInfo'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { showSuccessToast } from 'vant'
import { Device } from '@capacitor/device'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
const router = useRouter()
const { userInfo, initUserData } = useUserInfo()
const { t } = useI18n()
const toPage = (path, query = {}) => {
    if (path === '/RealName') {
        if (userInfo.value.is_verified_identity === 1) {
            showSuccessToast(t('my.nameSuccess'))
            return
        }
    } else if (path === '/ChangePwd') {
        if (query && query.pay) {
            router.push({
                path: path,
                query: { pay: 2, has: userInfo.value.has_trade_password ? 1 : 0 },
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
                inviteCode: userInfo.value.invite_code,
                inviteLink: userInfo.value.invite_link,
            },
        })
        return
    } else if (path === '/SetEmail') {
        if (userInfo.value.email) {
            router.push({
                path,
                query: {
                    email: userInfo.value.email,
                },
            })
            return
        }
    } else if (path === '/SetPhone') {
        if (userInfo.value.phone) {
            router.push({
                path,
                query: {
                    phone: userInfo.value.phone,
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
// 用户菜单操作
const menuList = computed(() => {
    return [
        {
            name: t('userPopup.menu1'),
            path: '/RealName',
        },
        {
            name: t('tipAll.menu2'),
            path: '/ChangePwd',
            query: { pay: 1 },
        },
        {
            name: t('userPopup.menu3'),
            path: '/ChangePwd',
        },
        //{
        //    name: t('userPopup.menu5'),
        //    img: getImageUrl('ope4'),
        //    path: '/SetEmail',
        //},
        // {
        //     name: t('userPopup.menu10'),
        //     img: getImageUrl('ope5'),
        //     path: '/SetPhone',
        // },
        {
            name: t('userPopup.menu11'),
            path: '/OrderHis',
        },
        {
            name: t('userPopup.menu6'),
            path: '/Agree',
            query: { type: 1 },
        },
        {
            name: t('userPopup.menu7'),
            path: '/Agree',
            query: { type: 2 },
        },
        {
            name: t('userPopup.menu8'),
            path: '/Agree',
            query: { type: 3 },
        },
    ]
})
// 登出
const showOut = ref(false)
const signOut = () => {
    localStorage.removeItem('token')
    showOut.value = false
    router.replace('/Login')
}

const verInfo = ref('')
const deviceId = ref('')
const refer = ref('')


onMounted(async () => {
    // 获取当前web完整的url地址
    refer.value = window.location.href
    verInfo.value = await getVer()
    deviceId.value = await getDeviceId()
})
const getVer = async () => {
    const { bundle } = await CapacitorUpdater.current()

    let currentVer = bundle.version
    if (!currentVer || currentVer === 'builtin') {
        currentVer = '0.0.1'
    }
    return `Version:${currentVer}`
}

const getDeviceId = async () => {
    const { identifier } = await Device.getId()
    const { platform } = await Device.getInfo()
    return `${platform}:${identifier}`
}

</script>
<template>
    <van-nav-bar :title="$t('setting.title')" safe-area-inset-top left-arrow @click-left="$router.back()" fixed
        placeholder />
    <div class="setting-box">
        <div class="setting-item" v-for="item in menuList" :key="item.path" @click="toPage(item.path, item.query)">
            {{ item.name }}
        </div>
        <MyConfirm v-model="showOut" @confirm="signOut" :content="$t('my.outContent')"></MyConfirm>
    </div>
        <p class="text-center mb-10">Coinalgo</p>
        <p class="text-center">{{ verInfo }}</p>
        <p class="m-2"></p>
        <!-- <p class="text-center">{{ refer }}</p> -->
        <!-- <p class="text-center">{{ deviceId }}</p> -->
    <div class="c-footer">
        <MyButton @click="showOut = true" type="danger">{{ $t('userPopup.menu9') }}</MyButton>
    </div>
</template>
<style lang="scss" scoped>
.setting-box {
    flex: auto;
    padding: 16px;
    .setting-item {
        padding: 12px ;
		border-radius: 10px;
        // background: #0E0E0E;
		background-color: var(--surface-bg);
        box-shadow: 0px 1px 0px 0px rgba(255, 255, 255, 0.1);
        margin-bottom: 16px;
    }
}
</style>