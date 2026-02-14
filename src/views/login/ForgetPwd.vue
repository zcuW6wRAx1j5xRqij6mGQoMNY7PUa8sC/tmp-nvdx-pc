<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getCodeApi } from '@/api/common'
import { successMessage } from '/@/utils/message'
import { forgetPasswordApi } from '@/api/user'
import Language from '@/views/login/components/Language.vue'
import ThemeSwitch from '@/views/login/components/ThemeSwitch.vue'

const { t } = useI18n()
const tabList = computed(() => {
    return [
        { id: 'email', name: t('register.tab2') },
        { id: 'phone', name: t('register.tab1') },
    ]
})
const tabChange = id => {
    fromData.cf_token = ''
    fromData.captcha_code = ''
    fromData.password = ''
    fromData.nwePassword = ''
    fromData.email = ''
    fromData.phone = ''
    fromData.account_type = id
}
const router = useRouter()
const fromData = reactive({
    email: '',
    cf_token: '',
    password: '',
    captcha_code: '',
    nwePassword: '',
    account_type: 'email',
    phone_code: '',
    phone: '',
})
const codeValid = computed(() => {
    return fromData.account_type === 'phone' ? fromData.phone : fromData.email
})
// 发送验证码（与 mobile 一致：先写入 cf_token 再调接口，提交时 fromData 带 cf_token）
const getCode = token => {
    fromData.cf_token = token
    return getCodeApi({
        email: fromData.email,
        phone: fromData.phone,
        account_type: fromData.account_type,
        phone_code: fromData.phone_code,
        type: 'reset_password',
        cf_token: token,
    }).then(() => {
        successMessage(t('common.sendSuccess'))
    })
}
const getCodeError = error => {
    errorObj.value = error
}
const errorObj = ref({})
const isDisabled = computed(() => {
    if (fromData.account_type === 'email') {
        return (
            !fromData.email || !fromData.password || !fromData.nwePassword || !fromData.captcha_code
        )
    } else {
        return (
            !fromData.phone || !fromData.password || !fromData.nwePassword || !fromData.captcha_code
        )
    }
})
const submitForm = () => {
    errorObj.value = {}
    if (fromData.password !== fromData.nwePassword) {
        errorObj.value.password = t('forgetPwd.error1')
        return
    }
    return forgetPasswordApi(fromData)
        .then(() => {
            successMessage(t('common.opeSuccess'))
            router.replace('/Login')
        })
        .catch(error => {
            errorObj.value = error
        })
}
const toPage = path => {
    router.push(path)
}
const changePhoneCode = (value) => {
    fromData.phone_code = value
}
</script>

<template>
    <div class="c-content login-page relative">
        <div class="top-header">
            <ThemeSwitch />
            <Language />
        </div>
        <div class="login-body">
            <div class="from-box">
                <div class="login-title">
                    {{ $t('forgetPwd.title') }}
                </div>
                <MyTab
                    :tabList="tabList"
                    class="mb-4"
                    :tabActive="fromData.account_type"
                    @tabChange="tabChange"
                />
                <MyInput
                    isIn
                    isLarge
                    v-model="fromData.phone"
                    :placeholder="$t('register.input0')"
                    :errorObj="errorObj"
                    propName="phone"
                    isPhone
                    v-if="fromData.account_type === 'phone'"
                    @changePhoneCode="changePhoneCode"
                />
                <MyInput
                    isIn
                    isLarge
                    v-model="fromData.email"
                    :placeholder="$t('forgetPwd.input1')"
                    :errorObj="errorObj"
                    propName="email"
                    v-if="fromData.account_type === 'email'"
                />
                <MyInput
                    isIn
                    isLarge
                    v-model="fromData.captcha_code"
                    :placeholder="$t('forgetPwd.input2')"
                    :errorObj="errorObj"
                    propName="captcha_code"
                    showCode
                    :codeValid="codeValid"
                    :getCode="getCode"
                    @getCodeError="getCodeError"
                />
                <MyInput
                    isIn
                    isLarge
                    v-model="fromData.password"
                    :placeholder="$t('forgetPwd.input3')"
                    :errorObj="errorObj"
                    propName="password"
                    type="password"
                />
                <MyInput
                    isIn
                    isLarge
                    v-model="fromData.nwePassword"
                    :placeholder="$t('forgetPwd.input4')"
                    :errorObj="errorObj"
                    propName="nwePassword"
                    type="password"
                />
                <MyButton :clickFn="submitForm" :disabled="isDisabled">{{
                    $t('forgetPwd.button2')
                }}</MyButton>
                <div class="tip-font mt-10 text-center" @click="toPage('/Login')">
                    {{ $t('forgetPwd.toLogin') }}
                </div>
            </div>
            <div class="flex-auto flex flex-col justify-center items-center">
                <div class="flex items-center">
                    <img src="../../assets/img/logo.webp" alt="" class="logo">
                </div>
                <img src="./img/login-right.png" class="login-bg" alt="">
            </div>
        </div>
    </div>
</template>

<style scoped>
@import './login.scss';
</style>
