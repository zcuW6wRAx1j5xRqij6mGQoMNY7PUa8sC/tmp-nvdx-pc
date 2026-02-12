<script setup>
import { withdrawalApi } from '@/api/my'
import { useRouter } from 'vue-router'
import { useDisabled } from '@/hooks/useDisabled'
import { useI18n } from 'vue-i18n'
import { useCurrency } from '@/hooks/useCurrency'
const { t } = useI18n()
const money = ref('')
const router = useRouter()
const sureHandle = () => {
   return withdrawalApi({ money: money.value }).then(() => {
        router.push('/Success')
    })
}
const fromData = reactive({
    money: '',
    moneyLabel: '',
})
const isDisabled = useDisabled(fromData)
const { currencyList } = useCurrency()
const selectChange = (_, item) => {
    console.log(item)
    fromData.money = item.id
    fromData.moneyLabel = item.name
}
const errorObj = ref({})
const accountList = computed(() => {
    return [
        { name: t('transform.select1'), id: 0 },
        { name: t('transform.select2'), id: 1 },
        { name: t('transform.select3'), id: 2 },
    ]
})
const accountChange = (_, item) => {
    console.log(item)
}
const accountChange1 = (_, item) => {
    console.log(item)
}
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('transformTwo.title')"
        left-arrow
        @click-left="$router.back()"
        fixed
        placeholder
    >
    </van-nav-bar>
    <div class="recharge-page overflow-auto flex-auto">
        <MyInput
            type="digit"
            isBlock
            v-model="fromData.moneyLabel"
            :placeholder="$t('transformTwo.pla1')"
            :errorObj="errorObj"
            propName="password"
            selectAndInput
            :dataList="currencyList"
            @selectChange="selectChange"
            :title="$t('transform.title2')"
            :label="$t('transformTwo.label1')"
        >
            <template #select>
                <span>{{ fromData.moneyLabel }}</span>
            </template>
        </MyInput>
        <p class="tip">
            {{ $t('transform.tip1') }}
            <span class="is-num ml-4">0.78270000 USD</span>
        </p>
        <div class="flex justify-center mt-4 mb-4 rotate-90">
            <img src="./img/transform.svg" class="w-5 h-5" alt="" />
        </div>
        <MyInput
            isBlock
            v-model="fromData.moneyLabel"
            :placeholder="$t('transform.label1')"
            :errorObj="errorObj"
            propName="password"
            readonly
            selectAndInput
            :dataList="currencyList"
            @selectChange="selectChange"
            :title="$t('transform.title2')"
            :label="$t('transformTwo.label2')"
            isLast
        >
            <template #select>
                <span>{{ fromData.moneyLabel }}</span>
            </template>
        </MyInput>
        <!-- <p class="tip">
            {{ $t('transformTwo.tip2') }}
            <span class="is-num ml-4">0.78270000 USD</span>
        </p> -->
    </div>
    <div class="c-footer">
        <!-- <MyButton :disabled="isDisabled" :clickFn="sureHandle">{{
            $t('transformTwo.btn1')
        }}</MyButton> -->
        <!-- todo -->
        <MyButton :disabled="true" :clickFn="sureHandle">{{
            $t('transformTwo.btn1')
        }}</MyButton>
    </div>
</template>

<style scoped lang="scss">
.recharge-page {
    padding: 24px 16px;
}
.tip {
    color: #a1a1a1;
    font-family: 'PingFang SC';
    font-size: 14px;
    font-style: normal;
    line-height: normal;
    margin-top: 16px;
    .is-num {
        font-family: DIN;
        font-weight: 500;
    }
}
</style>
