<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { modifyEmailApi } from '@/api/my'
import { showSuccessToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { isEmail } from '@/utils/is'
import { getCodeLoginApi } from '@/api/common'
const { t } = useI18n()
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const fromData = reactive({
    old_captcha: '',
    oldEmail: '',
    email: '',
    captcha: '',
    cf_token: '',
})
const isDisabled = computed(() => {
    if (fromData.oldEmail) {
        return !fromData.old_captcha || !fromData.email || !fromData.captcha
    } else {
        return !fromData.email || !fromData.captcha
    }
})
const errorObj = ref({})
const getCode = (token, type) => {
    fromData.cf_token = token
    errorObj.value = {}
    return getCodeLoginApi({
        account_type: 'email',
        email: type === 'old' ? fromData.oldEmail : fromData.email,
        type: 'change_email',
        cf_token: fromData.cf_token,
    }).then(() => {
        showSuccessToast(t('common.sendSuccess'))
    })
}
const codeValid = computed(() => {
    return isEmail(fromData.email)
})
onMounted(() => {
    fromData.oldEmail = route.query.email
})
const submitHandle = () => {
    return modifyEmailApi(fromData)
        .then(() => {
            router.push('/Success')
        })
        .catch(error => {
            errorObj.value = error
        })
}
const getCodeError = error => {
    errorObj.value = error
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
        :title="$t('setEmail.title')"
    />
    <div class="flex-auto p-4">
        <template v-if="fromData.oldEmail">
            <MyInput
                v-model="fromData.oldEmail"
                :label="$t('setPhone.label4')"
                :placeholder="$t('setEmail.pla1')"
                :errorObj="errorObj"
                propName="email"
                isBlock
                disabled
            ></MyInput>
            <MyInput
                v-model="fromData.old_captcha"
                :label="$t('setEmail.label2')"
                :placeholder="$t('setEmail.pla2')"
                showCode
                :errorObj="errorObj"
                propName="captcha"
                isBlock
                :getCode="token => getCode(token, 'old')"
                :codeValid="true"
                @getCodeError="getCodeError"
            ></MyInput>
        </template>
        <MyInput
            v-model="fromData.email"
            :label="$t('setEmail.label1')"
            :placeholder="$t('setEmail.pla1')"
            :errorObj="errorObj"
            propName="email"
            isBlock
        ></MyInput>
        <MyInput
            v-model="fromData.captcha"
            :label="$t('setEmail.label2')"
            :placeholder="$t('setEmail.pla2')"
            showCode
            :errorObj="errorObj"
            propName="captcha"
            isBlock
            :getCode="token => getCode(token, 'new')"
            :codeValid="codeValid"
            @getCodeError="getCodeError"
        ></MyInput>
    </div>
    <div class="c-footer">
        <MyButton :disabled="isDisabled" :clickFn="submitHandle">{{ $t('setEmail.btn') }}</MyButton>
    </div>
</template>

<style scoped></style>
