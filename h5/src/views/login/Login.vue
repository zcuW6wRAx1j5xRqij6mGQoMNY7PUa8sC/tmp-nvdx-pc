<script setup>
import { useRouter } from 'vue-router'
import { loginApi } from '@/api/login'
import { showLoadingToast, closeToast } from 'vant'
import { useI18n } from 'vue-i18n'
import useSocket from '@/hooks/useSocket'
import { onMounted } from 'vue'
import Top from './Top.vue'
const { unConnectHandle } = useSocket()
const router = useRouter()
const { t } = useI18n()
// 类型
const searchList = computed(() => {
    return [
        {
            name: t('login.tab.tab1'),
            id: 'email',
        },
        {
            name: t('login.tab.tab2'),
            id: 'phone',
        },
    ]
})
const searchChange = id => {
    fromData.account_type = id
}
const fromData = reactive({
    email: '',
    phone: '',
    password: '',
    account_type: 'email',
    phone_code: '',
})
const isDisabled = computed(() => {
    if (fromData.account_type === 'email') {
        return !fromData.email || !fromData.password
    } else {
        return !fromData.phone || !fromData.password || !fromData.phone_code
    }
})

function waitForJivoAPI(callback, timeout = 5000) {
  const start = Date.now();
  const interval = setInterval(() => {
    if (window.jivoWidgetLoaded && window.jivo_api) {
      clearInterval(interval);
      callback();
    } else if (Date.now() - start > timeout) {
      clearInterval(interval);
      console.warn("JivoChat API load timeout");
    }
  }, 200);
}

const toRegister = () => {
    router.push('/Register')
}
const errorObj = ref({})
const loginHandle = () => {
    showLoadingToast({})
    return loginApi(fromData)
        .then(data => {
            localStorage.setItem('ws_token', data.ws_token)
            localStorage.setItem('token', data.token)
            localStorage.setItem('ws_channel_token', data.ws_channel_token)
            localStorage.setItem('uid', data.uid)

            waitForJivoAPI(() => {
                window.jivo_api.setContactInfo({
                    name: "UID: " + data.uid ,
                });
            });

            router.push('/')
        })
        .catch(error => {
            errorObj.value = error
        })
        .finally(() => {
            setTimeout(() => {
                closeToast()
            }, 1000)
        })
}
onMounted(unConnectHandle)
const checked = ref(false)
const toAgree = type => {
    router.push({
        path: '/Agree',
        query: {
            type,
        },
    })
}
const selectChange = (val, item) => {
    fromData.phone_code = item.value
}
</script>
<template>
    <Top></Top>
    <div class="flex-auto overflow-auto login-page">
        <!-- <div class="login-title">{{ $t('login.login') }}</div> -->
        <img src="/logo.webp" class="logo" alt="" />
        <MyTab
            :tabList="searchList"
            :tabActive="fromData.account_type"
            @tabChange="searchChange"
            isFew
            isShrink
            class="mb-6"
        ></MyTab>
        <MyInput
            v-model="fromData.email"
            :label="$t('login.email')"
            :placeholder="$t('login.plaEmail')"
            :errorObj="errorObj"
            propName="email"
            large
            v-if="fromData.account_type === 'email'"
        ></MyInput>
        <MyInput
            v-model="fromData.phone"
            :label="$t('login.phone')"
            :placeholder="$t('login.plaPhone')"
            :errorObj="errorObj"
            @selectChange="selectChange"
            propName="phone"
            isPhone
            large
            v-else
        ></MyInput>
        <MyInput
            v-model="fromData.password"
            type="password"
            :label="$t('login.pwd')"
            :placeholder="$t('login.plaPwd')"
            showSee
            :errorObj="errorObj"
            propName="password"
            showForget
            large
        ></MyInput>
        <MyButton :disabled="isDisabled" :clickFn="loginHandle">{{ $t('login.login') }}</MyButton>
        <div class="to-register" @click="toRegister">{{ $t('login.toRegister') }}</div>
        <div class="login-tip" @click.stop="checked = !checked">
            <span class="ml-2">{{ $t('login.tip1') }}</span>
            <span class="agree" @click="toAgree(2)">{{ $t('login.tip2') }}</span>
            <span>{{ $t('login.tip4') }}</span>
            <span class="agree" @click="toAgree(3)">{{ $t('login.tip3') }}</span>
        </div>
    </div>
</template>
<style scoped lang="scss">
.login-page {
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    .login-title {
        color: var(--text-color);

        font-size: 32px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        margin-bottom: 22px;
    }
    .to-register {
        color: var(--text-color);

        font-size: 13px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        margin-top: 36px;
        text-align: center;
    }
    .login-tip {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        color: var(--muted-text);

        font-size: 10px;
        font-style: normal;
        font-weight: 500;
        line-height: 30px;
        justify-content: center;
        margin-top: auto;
    }
    .agree {
        color: var(--text-color);

        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
    }
}
.logo {
    width: 100px;
    margin: 0 auto 40px;
	border-radius: 10px;
}
.cf-turnstile {
        width: 400px;
    }
</style>