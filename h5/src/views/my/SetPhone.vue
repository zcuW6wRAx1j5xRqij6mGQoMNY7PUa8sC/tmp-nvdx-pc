<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { modifyPhoneApi } from '@/api/my'
import { showSuccessToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { getCodeLoginApi } from '@/api/common'
const { t } = useI18n()
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const fromData = reactive({
    old_captcha: '',
    oldPhone: '',
    phone: '',
    captcha: '',
    cf_token: '',
    phone_code: '',
    phone_code1: '',
})
const isDisabled = computed(() => {
    if (fromData.oldPhone) {
        return !fromData.old_captcha || !fromData.phone || !fromData.captcha
    } else {
        return !fromData.phone || !fromData.captcha
    }
})
const errorObj = ref({})
const getCode = (token, type) => {
    fromData.cf_token = token
    errorObj.value = {}
    return getCodeLoginApi({
        phone: type === 'old' ? fromData.oldPhone : fromData.phone,
        account_type: 'phone',
        phone_code: fromData.phone_code,
        type: 'change_phone',
        cf_token: fromData.cf_token,
    }).then(() => {
        showSuccessToast(t('common.sendSuccess'))
    })
}
const codeValid = computed(() => {
    return fromData.phone
})
onMounted(() => {
    fromData.oldPhone = route.query.phone
})
const submitHandle = () => {
    return modifyPhoneApi(fromData)
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
const selectChange = (val, item) => {
    fromData.phone_code = item.value
}
const selectChange1 = (val, item) => {
    fromData.phone_code1 = item.value
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
        :title="$t('setPhone.title')"
    />
    <div class="flex-auto p-4">
        <template v-if="fromData.oldPhone">
            <MyInput
                v-model="fromData.oldPhone"
                :label="$t('setPhone.label3')"
                :placeholder="$t('setPhone.pla1')"
                :errorObj="errorObj"
                propName="phone"
                isBlock
                isPhone
                @selectChange="selectChange1"
                disabled
            ></MyInput>
            <MyInput
                v-model="fromData.old_captcha"
                :label="$t('setPhone.label2')"
                :placeholder="$t('setPhone.pla2')"
                showCode
                :errorObj="errorObj"
                propName="captcha"
                isBlock
                :getCode="(token) => getCode(token, 'old')"
                :codeValid="true"
                @getCodeError="getCodeError"
            ></MyInput>
        </template>
        <MyInput
            v-model="fromData.phone"
            :label="$t('setPhone.label1')"
            :placeholder="$t('setPhone.pla1')"
            :errorObj="errorObj"
            propName="phone"
            isBlock
            isPhone
            @selectChange="selectChange"
            disabled
        ></MyInput>
        <MyInput
            v-model="fromData.captcha"
            :label="$t('setPhone.label2')"
            :placeholder="$t('setPhone.pla2')"
            showCode
            :errorObj="errorObj"
            propName="captcha"
            isBlock
            :getCode="(token) => getCode(token, 'new')"
            :codeValid="codeValid"
            @getCodeError="getCodeError"
        ></MyInput>
    </div>
    <div class="c-footer">
        <MyButton :disabled="isDisabled" :clickFn="submitHandle">{{ $t('setPhone.btn') }}</MyButton>
    </div>
</template>

<style scoped></style>
