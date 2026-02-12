<script setup>
import { addBankApi } from '@/api/my'
import { useRouter } from 'vue-router'
import { useDisabled } from '@/hooks/useDisabled'
const router = useRouter()
const fromData = reactive({
    card_number: '',
    bank_name: '',
    contact_name: '',
    contact_phone: '',
})
const isDisabled = useDisabled(fromData)
const errorObj = ref({})
const sureHandle = () => {
  return  addBankApi(fromData)
        .then(() => {
            router.push('/Card')
        })
        .catch(error => {
            errorObj.value = error
        })
}
</script>
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('card.addTitle')"
        left-arrow
        @click-left="$router.back()"
        fixed
        placeholder
    />
    <div class="flex-auto overflow-auto card-page">
        <div class="c-card-box">
            <MyInput
                v-model="fromData.bank_name"
                :placeholder="$t('card.plaLabel1')"
                :errorObj="errorObj"
                propName="bank_name"
                :label="$t('card.label1')"
            ></MyInput>

            <MyInput
                v-model="fromData.card_number"
                :placeholder="$t('card.plaLabel2')"
                :errorObj="errorObj"
                propName="card_number"
                :label="$t('card.label2')"
            ></MyInput>
            <MyInput
                v-model="fromData.contact_name"
                :placeholder="$t('card.plaLabel3')"
                :errorObj="errorObj"
                propName="contact_name"
                :label="$t('card.label3')"
            ></MyInput>
            <MyInput
                v-model="fromData.contact_phone"
                :placeholder="$t('card.plaLabel4')"
                :errorObj="errorObj"
                propName="contact_phone"
                :label="$t('card.label4')"
            ></MyInput>
            <MyInput
                v-model="fromData.contact_phone"
                :placeholder="$t('card.plaLabel5')"
                :errorObj="errorObj"
                propName="contact_phone"
                :label="$t('card.label5')"
            ></MyInput>
        </div>
    </div>
    <div class="c-footer">
        <MyButton :disabled="isDisabled" :clickFn="sureHandle">{{ $t('card.btn1') }}</MyButton>
    </div>
</template>
<style lang="scss" scoped>
.card-page {
    padding: 20px 16px;
}
</style>
