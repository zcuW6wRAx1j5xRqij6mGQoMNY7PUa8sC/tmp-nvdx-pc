<script setup>
import { useDisabled } from '@/hooks/useDisabled'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ExamineResult from './components/ExamineResult.vue'
import { getRealNameInfoApi, submitRealNameApi, getMyInfoApi } from '@/api/my'
import { getCountryApi } from '@/api/common'
import useUpload from '@/hooks/useUpload'
import { useRouter } from 'vue-router'
import { setObj, setBaseUrl } from '@/utils/utils'
import { showSuccessToast } from 'vant'

const router = useRouter()
const uploadFile = useUpload()
const countryList = ref([])
const getCountry = () => {
    return getCountryApi().then(data => {
        countryList.value = data
    })
}
const initData = ref({
    data: {},
})
const isRefuse = ref(false)
const dataList = computed(() => {
    return [
        {
            name: t('my.idCard'),
            id: 'id_card',
        },
        {
            name: t('my.passport'),
            id: 'passport',
        },
        {
            name: t('my.driverLicense'),
            id: 'driver_license',
        },
    ]
})
onMounted(async () => {
    await getMyInfoApi().then(data => {
        if (data && data.is_verified_identity === 1) {
            showSuccessToast(t('my.nameSuccess'))
            router.push('/')
            return
        }
    })
    await getCountry()
    getRealNameInfoApi().then(data => {
        initData.value = data
        isRefuse.value = data.status === 2
        if (data.status !== -1) {
            fromData.value = setObj(fromData.value, data.data)
            fromData.value.document_type_label = dataList.value.find(
                item => item.id === data.data.document_type,
            )?.name
            fromData.value.country_name = data.data?.country?.name
        }
    })
})
const { t } = useI18n()
const fromData = ref({
    document_type_label: '',
    document_type: '',
    document_frontend: '',
    country_id: '',
    country_name: '',
    first_name: '',
    last_name: '',
    document_number: '',
    face: '',
})
const errorObj = ref({})
const isDisabled = useDisabled(fromData)
const submitHandle = () => {
    return submitRealNameApi(fromData.value)
        .then(() => {
            router.push('/Success')
        })
        .catch(err => {
            errorObj.value = err
        })
}
// 1 证件 2 面部
const beforeRead = (file, type) => {
    uploadFile(file).then(data => {
        fromData.value[type === 1 ? 'document_frontend' : 'face'] = data
    })
    return false
}

const selectChange = (_, item) => {
    fromData.value.document_type = item.id
    fromData.value.document_type_label = item.name
}
const countryChange = (_, item) => {
    fromData.value.country_id = item.id
    fromData.value.country_name = item.name
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
        :title="$t('userPopup.menu1')"
    />
    <div class="p-4 flex-auto overflow-auto" v-show="!isRefuse">
        <MyInput
            :modelValue="fromData.document_type_label"
            :placeholder="$t('my.documentType')"
            :label="$t('my.documentType')"
            :errorObj="errorObj"
            propName="document_type"
            readonly
            isSelect
            :dataList="dataList"
            @selectChange="selectChange"
        ></MyInput>
        <MyInput
            v-model="fromData.country_name"
            :placeholder="$t('my.realName.pla1')"
            :label="$t('my.realName.input1')"
            :errorObj="errorObj"
            propName="country_id"
            isSelect
            readonly
            :dataList="countryList"
            @selectChange="countryChange"
            selectHeight="80vh"
            hasSearch
        ></MyInput>
        <MyInput
            v-model="fromData.first_name"
            :placeholder="$t('my.realName.pla3')"
            :label="$t('my.realName.input3')"
            :errorObj="errorObj"
            propName="first_name"
        ></MyInput>
        <MyInput
            v-model="fromData.last_name"
            :placeholder="$t('my.realName.pla2')"
            :label="$t('my.realName.input2')"
            :errorObj="errorObj"
            propName="last_name"
        ></MyInput>
        <MyInput
            v-model="fromData.document_number"
            :placeholder="$t('my.realName.pla4')"
            :label="$t('my.realName.input4')"
            :errorObj="errorObj"
            propName="document_number"
        ></MyInput>
        <div class="c-card-box">
            <van-uploader
                :before-read="file => beforeRead(file, 1)"
                reupload
                max-count="1"
            >
                <div class="c-card-title mb-4">
                    {{ $t('my.nameUp') }}
                    <span class="c-tip" v-if="fromData.document_frontend">{{
                        $t('my.reUpload')
                    }}</span>
                </div>
                <img
                    v-if="fromData.document_frontend"
                    :src="setBaseUrl(fromData.document_frontend)"
                    alt=""
                    class="upload-img"
                />
                <div v-else class="upload">
                    <img src="./img/upload.svg" class="upload-icon" alt="" />
                </div>
            </van-uploader>
        </div>
        <div class="c-card-box">
            <van-uploader :before-read="file => beforeRead(file, 2)" reupload max-count="1" capture="user">
                <div class="c-card-title mb-4">
                    {{ $t('my.realName.input5') }}
                    <span class="c-tip" v-if="fromData.face">{{ $t('my.reUpload') }}</span>
                </div>
                <img
                    v-if="fromData.face"
                    :src="setBaseUrl(fromData.face)"
                    alt=""
                    class="upload-img"
                />
                <div v-else class="upload">
                    <img src="./img/upload.svg" class="upload-icon" alt="" />
                </div>
            </van-uploader>
        </div>
    </div>
    <div class="c-footer" v-if="!isRefuse">
        <MyButton :disabled="isDisabled || initData.status === 0" :clickFn="submitHandle">{{
            initData.status === 0 ? $t('my.nameExamine') : $t('my.submit')
        }}</MyButton>
    </div>
    <ExamineResult
        v-if="isRefuse"
        :msg="initData.data.reason"
        @reUpload="isRefuse = false"
    ></ExamineResult>
</template>

<style scoped lang="scss">
.upload {
    width: 310px;
    height: 130px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #4a575e;
}
.upload-img {
    max-width: 100%;
    max-height: 80px;
    border-radius: 8px;
}
.upload-icon {
    width: 30px;
    height: 30px;
}
.van-uploader {
    display: flex;
    :deep(.van-uploader__wrapper),
    :deep(.van-uploader__input-wrapper) {
        width: 100%;
    }
}
</style>
