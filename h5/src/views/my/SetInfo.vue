<script lang="ts" setup>
import { useDisabled } from '@/hooks/useDisabled'
import { onMounted, reactive, ref } from 'vue'
import { modifyMyInfoApi, getMyInfoApi } from '@/api/my'
import { showSuccessToast } from 'vant'
import { useI18n } from 'vue-i18n'
import useUpload from '@/hooks/useUpload'
import { setBaseUrl } from '@/utils/utils'
const { t } = useI18n()
import { useRouter } from 'vue-router'
const uploadFile = useUpload()
const router = useRouter()
const fromData = reactive({
    name: '',
    avatar: '',
})
const isDisabled = useDisabled(fromData, ['name'])
const errorObj = ref({})
onMounted(() => {
    getMyInfoApi().then(data => {
        fromData.name = data.name
        fromData.avatar = data.avatar
    })
})
const submitHandle = () => {
    return modifyMyInfoApi(fromData)
        .then(() => {
            showSuccessToast(t('common.success'))
            router.replace('/My')
        })
        .catch(error => {
            errorObj.value = error
        })
}
const beforeRead = file => {
    uploadFile(file).then(data => {
        console.log(data)
        fromData.avatar = data
    })
    return false
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
        :title="$t('setInfo.title')"
    />
    <div class="flex-auto p-4">
        <MyInput
            :errorObj="errorObj"
            propName="avatar"
            :label="$t('setInfo.avatar')"
            isBlock
            readonly
            class="avatar"
            isSmall
            hasLeft
        >
            <template #left>
                <van-uploader
                    :before-read="beforeRead"
                    reupload
                    max-count="1"
                    accept="image/png, image/jpeg, image/jpg"
                >
                    <img v-if="fromData.avatar" :src="setBaseUrl(fromData.avatar)" alt="" class="avatar" />
                    <img v-else src="./img/avatar.svg" class="avatar" alt="" />
                </van-uploader>
            </template>
        </MyInput>
        <MyInput
            v-model="fromData.name"
            :label="$t('setInfo.nickname')"
            :placeholder="$t('setInfo.pla1')"
            :errorObj="errorObj"
            propName="name"
            isBlock
            maxlength="30"
        ></MyInput>
    </div>
    <div class="c-footer">
        <MyButton :disabled="isDisabled" :clickFn="submitHandle">{{
            $t('common.saveChanges')
        }}</MyButton>
    </div>
</template>

<style scoped lang="scss">
.avatar {
    border-radius: 50%;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.22);
}
</style>
