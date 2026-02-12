<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { getCodeApi } from '@/api/common'
import { useI18n } from 'vue-i18n'
import { showSuccessToast, showFailToast } from 'vant'
import { forgetPasswordApi } from '@/api/login'
import { useRouter } from 'vue-router'
const { t } = useI18n()
const router = useRouter()
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
    fromData.nwePassword = ''
    fromData.email = ''
    fromData.phone = ''
    fromData.account_type = id
}
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
const errorObj = ref({})
const submitHandle = () => {
    if (fromData.password !== fromData.nwePassword) {
        showFailToast(t('my.diffPwd'))
        return
    }
    return forgetPasswordApi(fromData)
        .then(() => {
            showSuccessToast(t('forgetPwd.success'))
            router.replace('/Login')
        })
        .catch(error => {
            errorObj.value = error
        })
}

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
        type: 'reset_password',
        cf_token: token,
    }).then(() => {
        showSuccessToast(t('login.codeSuccess'))
    })
}
const getCodeError = error => {
    errorObj.value = error
}
const selectChange = (val, item) => {
    fromData.phone_code = item.value
}
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        placeholder
        fixed
        left-arrow
        @click-left="$router.back()"
        :title="$t('forgetPwd.title')"
    />
    <div class="flex-auto overflow-auto login-page">
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
            v-model="fromData.password"
            type="password"
            :label="$t('forgetPwd.label3')"
            :placeholder="$t('forgetPwd.pla3')"
            showSee
            :errorObj="errorObj"
            propName="password"
        ></MyInput>
        <MyInput
            v-model="fromData.nwePassword"
            type="password"
            :label="$t('forgetPwd.label4')"
            :placeholder="$t('forgetPwd.pla4')"
            showSee
            :errorObj="errorObj"
            propName="password"
        ></MyInput>
        <MyButton class="mt-2" :disabled="isDisabled" :clickFn="submitHandle">{{
            $t('forgetPwd.btn')
        }}</MyButton>
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
        margin-bottom: 44px;
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
        color: var(--muted-text);

        font-size: 10px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        justify-content: center;
        margin-top: auto;
    }
    .agree {
        color: var(--muted-text);

        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
    }
}
.cf-turnstile {
        width: 400px;
    }
</style>