<script setup>
import { useRouter, useRoute } from 'vue-router'
import { registerApi } from '@/api/login'
import { showSuccessToast, showFailToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'
// import { isEmail } from '@/utils/is'
import { getCodeApi } from '@/api/common'
import Top from './Top.vue'
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
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
    fromData.cf_token = ''
    fromData.captcha_code = ''
    fromData.password = ''
    fromData.confirmPwd = ''
    fromData.email = ''
    fromData.phone = ''
    fromData.account_type = id
}
const fromData = reactive({
    email: '',
    cf_token: '',
    password: '',
    captcha_code: '',
    confirmPwd: '',
    account_type: 'email',
    phone_code: '',
    phone: '',
})
const isDisabled = computed(() => {
    if (fromData.account_type === 'email') {
        return (
            !fromData.email ||
            !fromData.password ||
            !fromData.confirmPwd ||
            !fromData.captcha_code
        )
    } else {
        return (
            !fromData.phone ||
            !fromData.password ||
            !fromData.confirmPwd ||
            !fromData.captcha_code 
        )
    }
})

const codeValid = computed(() => {
    return true
})
// 发送验证码
const getCode = token => {
    fromData.cf_token = token

    return getCodeApi({
        email: fromData.email,
        phone: fromData.phone,
        account_type: fromData.account_type,
        phone_code: fromData.phone_code,
        type: 'register',
        cf_token: token,
    }).then(() => {
        showSuccessToast(t('login.codeSuccess'))
    })
}
const toLogin = () => {
    router.replace('/Login')
}
const errorObj = ref({})
const sureHandle = () => {
    if (fromData.password !== fromData.confirmPwd) {
        showFailToast(t('my.diffPwd'))
        return
    }
    return registerApi(fromData)
        .then(() => {
            showSuccessToast(t('login.registerSuccess'))
            toLogin()
        })
        .catch(error => {
            errorObj.value = error
        })
}
onMounted(() => {
    fromData.invite_code = route.query.invite_code
})
const getCodeError = error => {
    errorObj.value = error
}
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
            propName="phone"
            isPhone
            @selectChange="selectChange"
            large
            v-else
        ></MyInput>
        <MyInput
            v-model="fromData.captcha_code"
            :label="$t('forgetPwd.label2')"
            :placeholder="$t('forgetPwd.pla2')"
            :errorObj="errorObj"
            propName="captcha_code"
            showCode
            :codeValid="codeValid"
            :getCode="getCode"
            @getCodeError="getCodeError"
            v-if="fromData.account_type === 'email'"
        ></MyInput>
        <MyInput
            v-model="fromData.captcha_code"
            :label="$t('forgetPwd.label2')"
            :placeholder="$t('forgetPwd.pla2')"
            :errorObj="errorObj"
            propName="captcha_code"
            showCode
            :codeValid="codeValid"
            :getCode="getCode"
            @getCodeError="getCodeError"
            v-else
        ></MyInput>
        <MyInput
            v-model="fromData.invite_code"
            :label="$t('tipAll.code')"
            :placeholder="$t('tipAll.plaCode')"
            :errorObj="errorObj"
            propName="invite_code"
        ></MyInput>
        <MyInput
            v-model="fromData.password"
            type="password"
            :label="$t('login.pwd')"
            :placeholder="$t('login.plaPwd')"
            showSee
            :errorObj="errorObj"
            propName="password"
        ></MyInput>
        <MyInput
            v-model="fromData.confirmPwd"
            type="password"
            :label="$t('forgetPwd.label4')"
            :placeholder="$t('forgetPwd.pla4')"
            showSee
            :errorObj="errorObj"
            propName="confirmPwd"
        ></MyInput>
        <MyButton :disabled="isDisabled || !checked" @click="sureHandle">{{
            $t('login.register')
        }}</MyButton>
        <div class="to-register" @click="toLogin">{{ $t('login.toLogin') }}</div>
        <div class="login-tip" @click.stop="checked = !checked">
            <!-- <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
                class="check-icon"
            >
                <rect x="0.5" y="0.5" width="16" height="16" rx="4" fill="currentColor" />
                <path
                    d="M4.82135 9.0256L6.92338 11.1276L12.1784 5.87256"
                    :stroke="checked ? 'var(--checkbox-check)' : 'var(--checkbox-check-off)'"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg> -->
		<svg
		  xmlns="http://www.w3.org/2000/svg"
		  width="17"
		  height="17"
		  viewBox="0 0 17 17"
		  fill="none"
		  class="check-icon"
		 
		>
		  <!-- 白色背景（始终存在） -->
		  <rect
		    x="0.5"
		    y="0.5"
		    width="16"
		    height="16"
		    rx="4"
		    fill="#ffffff"
		  />
		
		  <!-- 黑色对勾：点一下显示 / 再点一下消失 -->
		  <path
		    v-show="checked"
		    d="M4.82135 9.0256L6.92338 11.1276L12.1784 5.87256"
		    stroke="#000000"
		    stroke-width="1.5"
		    stroke-linecap="round"
		    stroke-linejoin="round"
		  />
		</svg>
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
        margin-bottom: 36px;
    }
    .login-tip {
        display: flex;
        align-items: center;
        color: var(--muted-text);
        flex-wrap: wrap;
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
    margin: 0 auto 30px;
	border-radius: 10px;
}
.cf-turnstile {
        width: 400px;
    }
</style>