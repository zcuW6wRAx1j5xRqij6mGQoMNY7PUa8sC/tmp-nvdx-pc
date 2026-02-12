<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { friendlyNumber, setBaseUrl, formatNumber } from '@/utils/utils'
import SelectB from './SelectB.vue'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
interface info {
    symbol: string
    symbolId: number
    name: string
    bLogo: string
}
const props = withDefaults(
    defineProps<{
        isSpots: boolean
        defaultValue: info
        setSub: Function
    }>(),
    {
        isSpots: false,
    },
)
const emit = defineEmits(['bChange', 'dataChange', 'tabChange', 'optionsList'])
// 切换币
const symbolId = ref()
const activeB = ref()
const symbol = ref()
watchEffect(() => {
    if (props.defaultValue && props.defaultValue.symbolId) {
        activeB.value = props.defaultValue.name
        symbolId.value = +props.defaultValue.symbolId
        symbol.value = props.defaultValue.symbol
    }
})

// 回到详情
const toDetail = () => {
    const path = activeTab.value === 1 ? '/OptionsOrder' : '/DetailPage'
    const query = {
        symbolId: symbolId.value,
        type: 1
    }
    router.push({
        path: path,
        query: query,
    })
}

// 切换tab
const activeTab = ref(2)
const optionsList = ref([])

const tabList = computed(() => {

    return [
        { id: 1, name: t('spotOpe.Options') },
        { id: 2, name: t('spotOpe.Futures') },
    ]
    // if (!optionsList.value.length) {
    //     return []
    // } else if (symbolId.value && optionsList.value.some(item => item.symbol_id === symbolId.value)) {
    //     return [
    //         { id: 1, name: t('spotOpe.Options') },
    //         { id: 2, name: t('spotOpe.Futures') },
    //     ]
    // } else {
    //     activeTab.value = 2
    //     return [
    //         { id: 2, name: t('spotOpe.Futures') },
    //     ]
    // }
})

const tabChange = item => {
    activeTab.value = item
    emit('tabChange', item)
}

</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top fixed placeholder>
        <template #left>
            <MyTab :tabList="tabList" :tabActive="activeTab" @tabChange="tabChange"></MyTab>
            <!-- <div class="flex items-center" @click="showLeft = true">
                <img
                    v-if="defaultValue.bLogo"
                    :src="setBaseUrl(defaultValue.bLogo)"
                    class="b-img"
                    alt=""
                />
                <div class="b-title">
                    {{ activeB }}
                    <div
                        class="change_percent"
                        :class="[formatNumber(changeVal) > 0 ? 'green-color' : 'red-color']"
                    >
                        {{ changeVal }}%
                    </div>
                </div>
                <img src="../../../assets/img/arrow-down.svg" class="arrow-down" alt="" />
            </div> -->
            <div class="list"></div>
        </template>
        <template #right>
            <!-- <img src="../img/right.svg" class="w-6 h-6" alt="" @click="toDetail" v-if="activeTab === 1" /> -->
			
			<svg class="lang-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"  @click="toDetail" v-if="activeTab === 1">
			<g id="&#231;&#148;&#179;&#232;&#180;&#173;&#232;&#174;&#176;&#229;&#189;&#149;">
			<path id="Vector" d="M4.48096 20.6255L4.47344 4.4668H6.9873V5.29389C6.9873 6.21957 7.73503 6.97314 8.65486 6.97314H15.3451C15.7888 6.97115 16.2136 6.79322 16.5262 6.4784C16.8388 6.16357 17.0138 5.73757 17.0127 5.29389V4.4668L19.519 4.46011L19.5257 20.6188L4.48096 20.6255ZM15.3418 3.6397L15.3451 5.30225L8.6582 5.29389V3.6397L8.65486 3.63135L15.3418 3.6397ZM19.5149 2.7959H16.7788C16.4897 2.29881 15.9584 1.96045 15.3451 1.96045H8.65486C8.04164 1.96045 7.51113 2.29797 7.22123 2.7959H4.47344C4.03227 2.79634 3.60932 2.97185 3.29744 3.28388C2.98557 3.5959 2.81028 4.01895 2.81006 4.46011V20.6255C2.81006 21.5428 3.55695 22.2897 4.47427 22.2897H19.5257C19.9669 22.289 20.3898 22.1135 20.7018 21.8015C21.0137 21.4896 21.1893 21.0667 21.1899 20.6255V4.46011C21.1882 4.0174 21.0108 3.59348 20.6967 3.28145C20.3826 2.96942 19.9576 2.79479 19.5149 2.7959Z" fill="currentColor"/>
			<path id="Vector_2" d="M14.7955 10.5734L10.8338 14.9044L9.21214 13.0873C9.06458 12.922 8.85739 12.8221 8.63616 12.8095C8.41493 12.797 8.19778 12.8729 8.03249 13.0204C7.8672 13.168 7.76729 13.3752 7.75476 13.5964C7.74222 13.8176 7.81808 14.0348 7.96565 14.2001L10.203 16.7064C10.2808 16.7936 10.376 16.8634 10.4825 16.9115C10.589 16.9596 10.7044 16.9848 10.8212 16.9855H10.8262C11.0602 16.9855 11.2841 16.8869 11.4428 16.7139L16.0286 11.7012C16.1781 11.5377 16.2566 11.3215 16.2467 11.1001C16.2369 10.8787 16.1395 10.6703 15.9759 10.5208C15.8124 10.3712 15.5962 10.2927 15.3748 10.3026C15.1534 10.3125 14.945 10.4099 14.7955 10.5734Z" fill="currentColor"/>
			</g>
			</svg>
			
            <!-- <img src="../img/to-detail.svg" class="w-6 h-6" alt="" @click="toDetail" v-else /> -->
			<svg v-else class="lang-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" @click="toDetail">
			<g id="Frame">
			<path id="Vector" d="M18.511 9.82755H20.4666C21.1867 9.82755 21.7704 10.4113 21.7704 11.1313V18.3021C21.7704 19.0222 21.1867 19.6059 20.4666 19.6059H18.511V21.7791C18.511 22.379 18.0246 22.8653 17.4248 22.8653C16.8249 22.8653 16.3385 22.379 16.3385 21.7791V19.6059H14.3829C13.6628 19.6059 13.0791 19.0222 13.0791 18.3021V11.1313C13.0791 10.4113 13.6628 9.82755 14.3829 9.82755H16.3385V7.65432C16.3385 7.05443 16.8249 6.56812 17.4248 6.56812C18.0246 6.56812 18.511 7.05443 18.511 7.65432V9.82755ZM15.773 12C15.485 12 15.2515 12.2335 15.2515 12.5215V16.9103C15.2515 17.1983 15.485 17.4318 15.773 17.4318H19.0765C19.3645 17.4318 19.598 17.1983 19.598 16.9103V12.5215C19.598 12.2335 19.3645 12 19.0765 12H15.773Z" fill="currentColor"/>
			<path id="Vector_2" d="M7.64572 4.39421H9.60139C10.3214 4.39421 10.9052 4.97793 10.9052 5.69798V12.8687C10.9052 13.5888 10.3214 14.1725 9.60139 14.1725H7.64572V16.3458C7.64572 16.9457 7.15941 17.432 6.55952 17.432C5.95962 17.432 5.47331 16.9457 5.47331 16.3458V14.1725H3.51764C2.79759 14.1725 2.21387 13.5888 2.21387 12.8687V5.69798C2.21387 4.97793 2.79759 4.39421 3.51764 4.39421H5.47331V2.22097C5.47331 1.62108 5.95962 1.13477 6.55952 1.13477C7.15941 1.13477 7.64572 1.62108 7.64572 2.22097V4.39421ZM4.90779 6.56825C4.61977 6.56825 4.38628 6.80174 4.38628 7.08976V11.4786C4.38628 11.7666 4.61977 12.0001 4.90779 12.0001H8.21124C8.49926 12.0001 8.73275 11.7666 8.73275 11.4786V7.08976C8.73275 6.80174 8.49926 6.56825 8.21124 6.56825H4.90779Z" fill="currentColor"/>
			</g>
			</svg>
        </template>
    </van-nav-bar>
    <!-- <SelectB
        v-model="showLeft"
        :isSpots="isSpots"
        :setSub="setSub"
        @selectHandle="selectHandle"
        @dataChange="dataChange"
    ></SelectB> -->
</template>

<style scoped lang="scss">
	.lang-icon {
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
:deep(.van-tab) {
    padding: 0 !important;
    flex: auto;
}

:deep(.van-tabs__nav) {
    gap: 60px;
}

.arrow-down {
    width: 10px;
    margin-left: 14px;
}

.b-title {
    font-size: 16px;
    // color: #ffffff;
	color: var(--text-color);
    font-weight: bold;
}

.change_percent {
    font-family: DIN, DIN;
    font-weight: 500;
    font-size: 13px;
    line-height: 15px;
    text-align: left;
}
</style>
