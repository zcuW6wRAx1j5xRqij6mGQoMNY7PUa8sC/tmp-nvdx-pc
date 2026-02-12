<script setup>
import { useDisabled } from '@/hooks/useDisabled'
import { computed, reactive, ref } from 'vue'
import { modifyLoginPwdApi, modifyPayPwdApi } from '@/api/my'
import { showSuccessToast, showFailToast } from 'vant'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
// 1是登录 2是支付
const isPay = computed(() => {
    return +route.query.pay === 2
})
// 是否有历史支付密码
const hasOldPwd = computed(() => {
    return !!+route.query.has
})
const fromData = reactive({
    old_password: '',
    new_password: '',
    confirmPwd: '',
})
const fromDataPay = reactive({
    old_trade_password: '',
    trade_password: '',
    confirmPwd: '',
})
const isDisabled = useDisabled(fromData)
const isPayDisabled = useDisabled(fromDataPay, ['trade_password', 'confirmPwd'])
const isPayOldDisabled = useDisabled(fromDataPay)

const errorObj = ref({})
const submitHandle = () => {
    if (isPay.value) {
        if (fromDataPay.trade_password !== fromDataPay.confirmPwd) {
            showFailToast(t('my.diffPwd'))
            return
        }
    } else {
        if (fromData.new_password !== fromData.confirmPwd) {
            showFailToast(t('my.diffPwd'))
            return
        }
    }
    const action = isPay.value ? modifyPayPwdApi : modifyLoginPwdApi
    let params = isPay.value ? fromDataPay : fromData
    if (!hasOldPwd.value) {
        Reflect.deleteProperty(params, 'old_trade_password')
    }
    return action(params)
        .then(() => {
            showSuccessToast(t('my.changPwd'))
            if (isPay.value) {
                router.push('/')
            } else {
                localStorage.removeItem('token')
                router.replace('/Login')
            }
        })
        .catch(error => {
            errorObj.value = error
        })
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
        :title="$t('changePwd.title')"
    />
    <div class="flex-auto p-4">
        <template v-if="isPay">
            <MyInput
                v-model="fromDataPay.old_trade_password"
                type="password"
                :label="$t('changePwd.label1')"
                :placeholder="$t('changePwd.pla1')"
                showSee
                :errorObj="errorObj"
                propName="old_trade_password"
                isBlock
                v-if="hasOldPwd"
            ></MyInput>
            <MyInput
                v-model="fromDataPay.trade_password"
                type="password"
                :label="$t('changePwd.label2')"
                :placeholder="$t('changePwd.pla2')"
                showSee
                :errorObj="errorObj"
                propName="trade_password"
                isBlock
            ></MyInput>
            <MyInput
                v-model="fromDataPay.confirmPwd"
                type="password"
                :label="$t('changePwd.label3')"
                :placeholder="$t('changePwd.pla3')"
                showSee
                :errorObj="errorObj"
                propName="confirmPwd"
                isBlock
            ></MyInput>
        </template>
        <template v-else>
            <MyInput
                v-model="fromData.old_password"
                type="password"
                :label="$t('changePwd.label1')"
                :placeholder="$t('changePwd.pla1')"
                showSee
                :errorObj="errorObj"
                propName="old_password"
                isBlock
            ></MyInput>
            <MyInput
                v-model="fromData.new_password"
                type="password"
                :label="$t('changePwd.label2')"
                :placeholder="$t('changePwd.pla2')"
                showSee
                :errorObj="errorObj"
                propName="new_password"
                isBlock
            ></MyInput>
            <MyInput
                v-model="fromData.confirmPwd"
                type="password"
                :label="$t('changePwd.label3')"
                :placeholder="$t('changePwd.pla3')"
                showSee
                :errorObj="errorObj"
                propName="confirmPwd"
                isBlock
            ></MyInput>
        </template>
    </div>
    <div class="c-footer">
        <MyButton v-if="isPay && hasOldPwd" :disabled="isPayOldDisabled" :clickFn="submitHandle">{{
            $t('changePwd.btn')
        }}</MyButton>
        <MyButton v-else-if="isPay" :disabled="isPayDisabled" :clickFn="submitHandle">{{
            $t('changePwd.btn')
        }}</MyButton>
        <MyButton v-else :disabled="isDisabled" :clickFn="submitHandle">{{
            $t('changePwd.btn')
        }}</MyButton>
    </div>
</template>

<style scoped></style>
