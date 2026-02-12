<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import { friendlyNumber, setBaseUrl, formatNumber, usdcToUsd } from '@/utils/utils'
import SelectB from './SelectB.vue'
import { useRouter } from 'vue-router'
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
const emit = defineEmits(['bChange', 'dataChange'])
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

const showLeft = ref(false)
const selectHandle = item => {
    if (item?.id === symbolId.value) {
        showLeft.value = false
        return
    }
    activeB.value = item?.name
    symbol.value = item?.symbol
    symbolId.value = item?.id
    emit('bChange', item)
    showLeft.value = false
}
const changeVal = ref()
const dataChange = (val, recordMap) => {
    if (val.symbol === symbol.value) {
        changeVal.value = friendlyNumber(+val.price_change_percent)
    }
    emit('dataChange', val, recordMap)
}
// 回到详情
const toDetail = () => {
    router.push({
        path: '/DetailPage',
        query: {
            type: props.isSpots ? 0 : 1,
            symbolId: symbolId.value,
        },
    })
}
</script>
<!--  -->
<template>
    <van-nav-bar safe-area-inset-top fixed placeholder>
        <template #left>
            <div class="flex items-center" @click="showLeft = true">
                <img
                    v-if="defaultValue.bLogo"
                    :src="setBaseUrl(defaultValue.bLogo)"
                    class="b-img"
                    alt=""
                />
                <div class="b-title">
                    {{ usdcToUsd(activeB) }}
                    <div
                        class="change_percent"
                        :class="[formatNumber(changeVal) > 0 ? 'green-color' : 'red-color']"
                    >
                        {{ changeVal }}%
                    </div>
                </div>
				<div style="margin-left: 5px;">
					<svg class="lang-icon" width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path id="Polygon 5" d="M3.37814 6.23756C3.7876 6.7369 4.55151 6.7369 4.96098 6.23756L8.14411 2.35578C8.60063 1.79906 8.20456 0.962061 7.48459 0.962061L0.854525 0.962061C0.134554 0.96206 -0.261519 1.79906 0.195007 2.35578L3.37814 6.23756Z" fill="currentColor"/>
					</svg>
				</div>
                <!-- <img src="../../../assets/img/arrow-down.svg" class="arrow-down" alt="" /> -->
            </div>
        </template>
        <template #right>
            <!-- <img src="../img/to-detail.svg" class="w-6 h-6" alt="" @click="toDetail" /> -->
			<svg class="lang-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" @click="toDetail">
			<g id="Frame">
			<path id="Vector" d="M18.511 9.82755H20.4666C21.1867 9.82755 21.7704 10.4113 21.7704 11.1313V18.3021C21.7704 19.0222 21.1867 19.6059 20.4666 19.6059H18.511V21.7791C18.511 22.379 18.0246 22.8653 17.4248 22.8653C16.8249 22.8653 16.3385 22.379 16.3385 21.7791V19.6059H14.3829C13.6628 19.6059 13.0791 19.0222 13.0791 18.3021V11.1313C13.0791 10.4113 13.6628 9.82755 14.3829 9.82755H16.3385V7.65432C16.3385 7.05443 16.8249 6.56812 17.4248 6.56812C18.0246 6.56812 18.511 7.05443 18.511 7.65432V9.82755ZM15.773 12C15.485 12 15.2515 12.2335 15.2515 12.5215V16.9103C15.2515 17.1983 15.485 17.4318 15.773 17.4318H19.0765C19.3645 17.4318 19.598 17.1983 19.598 16.9103V12.5215C19.598 12.2335 19.3645 12 19.0765 12H15.773Z" fill="currentColor"/>
			<path id="Vector_2" d="M7.64572 4.39421H9.60139C10.3214 4.39421 10.9052 4.97793 10.9052 5.69798V12.8687C10.9052 13.5888 10.3214 14.1725 9.60139 14.1725H7.64572V16.3458C7.64572 16.9457 7.15941 17.432 6.55952 17.432C5.95962 17.432 5.47331 16.9457 5.47331 16.3458V14.1725H3.51764C2.79759 14.1725 2.21387 13.5888 2.21387 12.8687V5.69798C2.21387 4.97793 2.79759 4.39421 3.51764 4.39421H5.47331V2.22097C5.47331 1.62108 5.95962 1.13477 6.55952 1.13477C7.15941 1.13477 7.64572 1.62108 7.64572 2.22097V4.39421ZM4.90779 6.56825C4.61977 6.56825 4.38628 6.80174 4.38628 7.08976V11.4786C4.38628 11.7666 4.61977 12.0001 4.90779 12.0001H8.21124C8.49926 12.0001 8.73275 11.7666 8.73275 11.4786V7.08976C8.73275 6.80174 8.49926 6.56825 8.21124 6.56825H4.90779Z" fill="currentColor"/>
			</g>
			</svg>
			
        </template>
    </van-nav-bar>
    <SelectB
        v-model="showLeft"
        :isSpots="isSpots"
        :setSub="setSub"
        @selectHandle="selectHandle"
        @dataChange="dataChange"
    ></SelectB>
</template>

<style scoped>
	.lang-icon {
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.arrow-down {
    width: 10px;
    margin-left: 14px;
}
.b-title {
    font-size: 16px;
    /* color: #ffffff; */
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
