<script setup>
import { useRouter } from 'vue-router'
import { noticeListApi, bannerListApi, recommendListApi, supportApi, announcementListApi, readAnnouncementApi } from '@/api/home'
import { onMounted } from 'vue'
import useSocket from '@/hooks/useSocket'
import { friendlyNumber, openLink, setBaseUrl, formatNumber } from '@/utils/utils'
import News from './components/News.vue'
import { useI18n } from 'vue-i18n'
import { useUserInfo } from '@/hooks/useUserInfo'
import { serChartData } from '@/utils/serChartData'
import { closeToast, showLoadingToast, showSuccessToast, showToast } from 'vant'
import { getWalletApi } from '@/api/my'
const { userInfo, initUserData } = useUserInfo()
const { t } = useI18n()
const router = useRouter()
const noticeList = ref([])
const bannerList = ref([])
const cardList = ref([])
const bList = ref([])
const announcementList = ref([])
const currentAnnouncementIndex = ref(0)
const showAnnouncement = ref(false)
const wallet = ref({})
onMounted(() => {
    // 钱包信息
    getWalletApi().then(data => {
        wallet.value = data || {}
        console.log(wallet.value)
    })
})
const showNextAnnouncement = () => {
    if (currentAnnouncementIndex.value < announcementList.value.length - 1) {
        currentAnnouncementIndex.value++
        showAnnouncement.value = true
    } else {
        showAnnouncement.value = false
    }
}
const handleAnnouncementConfirm = async () => {
    if (loading.value) return

    const currentAnnouncement = announcementList.value[currentAnnouncementIndex.value]
    if (currentAnnouncement) {
        loading.value = true
        try {
            await readAnnouncementApi({ announcement_id: currentAnnouncement.id })
            showNextAnnouncement()
        } catch (error) {
            console.error('Failed to mark announcement as read:', error)
        } finally {
            loading.value = false
        }
    }
}

onMounted(() => {
    // 平台滚动消息
    noticeListApi().then(data => {
        noticeList.value = data || []
    })
    // banner滚动
    bannerListApi().then(data => {
        bannerList.value = data || []
    })
    recommendListApi({ page: 1, page_size: 20 }).then(data => {
        cardList.value = data.items.slice(0, 3)
        bList.value = JSON.parse(JSON.stringify(data.items.slice(0, 6))).map(el => {
            el.setId = `${el.id}a`
            return el
        })
    })
    // 获取弹窗公告列表
    announcementListApi().then(data => {
        if (data && data.length > 0) {
            announcementList.value = data
            showAnnouncement.value = true
        }
    })
})

const recordMap = ref({})
const setListData = data => {
    recordMap.value[data.data.symbol] = data.data
}
useSocket('public:allticker', setListData)
function getData(row, prop, needSymbol = false) {
    let data = recordMap.value[row.symbol] || {}
    row[prop] = +data[prop] || '-'
    const show = friendlyNumber(+data[prop]) || '-'
    if (needSymbol) {
        if (formatNumber(show) > 0) {
            return `+${show}`
        }
    }
    return show
}
// 打开外部链接
const toLink = async item => {
    if (!item.link_url) return
    openLink(item.link_url)
}

const menuList = computed(() => {
    return [
        {
            path: '/OTC',
            name: 'OTC',
            img: getImageUrl('otc'),
        },
        {
            path: '/AI',
            name: t('ai.title'),
            img: getImageUrl('ai'),
        },
        {
            path: '/Defn',
            name: t('defn.title').replace('Title ', '').trim(),
            img: getImageUrl('de'),
        },
        {
            path: '/IEO',
            name: t('home.menu10'),
            img: getImageUrl('ieo'),
        },
        {
            name: t('userPopup.btn2'),
            path: '/Recharge',
            img: getImageUrl('btn2'),
            
        },
        {
            name: t('userPopup.btn1'),
            path: '/Withdrawal',
            img: getImageUrl('btn1')
            
        },
        {
            name: t('userPopup.btn3'),
            path: '/Transform',
            img: getImageUrl('btn3')
            
        },
        {
            name: t('setting.sbutitle'),
            path: '/Setting',
            img: getImageUrl('set')
            
        },
    ]
})
function getImageUrl(imageName, type = 'svg') {
    return new URL(`./img/${imageName}.${type}`, import.meta.url).href
}
const loading = ref(false)
const showConfirm = ref(false)
const success = ref(false)
const toPage = (path, query, isLink = false) => {
    if (!path) {
        return
    }
    if (path === '/Support') {
        if (userInfo.value?.allow_support === 0) {
            showConfirm.value = true
            return
        }
        if (loading.value) {
            return
        }
        loading.value = true
        showLoadingToast({
            forbidClick: true,
            loadingType: 'spinner',
            duration: 0,
        })
        supportApi()
            .then(() => {
                initUserData()
                success.value = true
            })
            .finally(() => {
                loading.value = false
                closeToast()
            })
        return
    }
    if (isLink) {
        openLink(path)
        return
    }
    if (path === '/RealName') {
        if (userInfo.value?.is_verified_identity === 1) {
            showSuccessToast(t('my.nameSuccess'))
            return
        }
    } else if (path === '/ChangePwd') {
        if (query && query.pay) {
            router.push({
                path: path,
                query: { pay: 2, has: userInfo.value?.has_trade_password ? 1 : 0 },
            })
            return
        }
    }
    router.push({ path, query })
}
const toDetail = data => {
    router.push({
        path: '/SpotOpe',
        query: {
            symbolId: data.id,
        },
    })
}

const showName = ref(false)
const total = computed(() => {
    return friendlyNumber(wallet.value.total, false)
})
</script>

<template>
    <div class="home-page flex-auto overflow-auto">
        <div class="top-show-box">
            <div class="top-label">
                {{ $t('my.wallet1') }}(USD)
            </div>
            <div class="top-box">
                <div class="top-left">
                    {{ total }}
                    <div class="top-tip">{{ $t('my.wallet5') }} {{ friendlyNumber(wallet.total_profit) }} USD</div>
                </div>
                <MyButton size="small" @click="toPage('/Recharge')">{{ $t('my.btn1') }}</MyButton>
            </div>
        </div>

        <!-- 菜单部分 -->
        <div class="menu-ul">
            <div class="menu-li" v-for="item in menuList" :key="item.path"
                @click="toPage(item.path, item.query, item.isLink)">
                <div :class="{ 'svg-box': item.isMax }">
                    <img :src="item.img" class="menu-icon" alt="" />
                </div>
                <div class="menu-name">{{ item.name }}</div>
            </div>
        </div>

        <!-- ✅ 这里把写死的 background / color 换成变量 -->
        <van-notice-bar
            left-icon="volume-o"
            class="mt-4 flex-shrink-0 notice"
            :background="'var(--surface-bg)'"
            :color="'var(--muted-text)'"
        >
            <template #left-icon="">
				
				<svg class="lang-icon" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g id="Frame">
					<path id="Union" fill-rule="evenodd" clip-rule="evenodd" d="M11.3374 19.3172C10.9903 19.3172 10.6484 19.1933 10.3707 18.954L6.44835 15.5753H3.88471C2.79303 15.5753 1.9043 14.6866 1.9043 13.5949V8.4655C1.9043 7.37381 2.79303 6.48508 3.88471 6.48508H6.54449L10.3472 3.0669C10.7905 2.66846 11.4037 2.57233 11.9484 2.8148C12.4921 3.05728 12.8307 3.57856 12.8307 4.1746V17.8281C12.8307 18.4167 12.4985 18.9358 11.9623 19.1804C11.7604 19.2723 11.5479 19.3172 11.3374 19.3172ZM3.88471 7.76797C3.50016 7.76797 3.18612 8.08095 3.18612 8.46657V13.5971C3.18612 13.9816 3.4991 14.2956 3.88471 14.2956H6.52526C6.78269 14.2956 7.03158 14.3886 7.22706 14.5563L11.2071 17.9851C11.2947 18.061 11.3823 18.0364 11.4282 18.0161C11.4742 17.9958 11.5489 17.9435 11.5489 17.8292V4.17353C11.5489 4.0571 11.472 4.00583 11.4261 3.98553C11.3802 3.96524 11.2904 3.94281 11.2039 4.02078L7.34135 7.49238C7.14395 7.66982 6.88789 7.76798 6.62246 7.76797H3.88471ZM14.6671 14.9387C14.5671 14.9387 14.4684 14.9153 14.3791 14.8705C14.2897 14.8256 14.212 14.7604 14.1522 14.6802C14.102 14.6127 14.0656 14.536 14.045 14.4544C14.0245 14.3727 14.0203 14.2879 14.0326 14.2046C14.0449 14.1214 14.0735 14.0414 14.1167 13.9692C14.16 13.897 14.2171 13.8341 14.2847 13.784C15.1798 13.1196 15.6936 12.0995 15.6936 10.9854C15.6936 9.89262 15.1959 8.88426 14.3264 8.21878C14.2595 8.16762 14.2034 8.10379 14.1613 8.03094C14.1192 7.95808 14.0918 7.87763 14.0808 7.79419C14.0698 7.71075 14.0753 7.62596 14.0971 7.54467C14.1189 7.46338 14.1565 7.38718 14.2078 7.32043C14.2589 7.2536 14.3228 7.19751 14.3956 7.15537C14.4685 7.11323 14.5489 7.08588 14.6324 7.07486C14.7158 7.06385 14.8006 7.0694 14.8819 7.09119C14.9632 7.11298 15.0394 7.15059 15.1061 7.20187C16.294 8.11196 16.9755 9.49098 16.9755 10.9864C16.9755 12.4872 16.2555 13.9186 15.0485 14.8148C14.9377 14.8954 14.8041 14.9388 14.6671 14.9387ZM16.5391 17.0241C16.6468 17.0991 16.7748 17.1392 16.906 17.1392C17.0534 17.1392 17.2008 17.0889 17.3205 16.9864C19.0819 15.4845 20.0924 13.2969 20.0924 10.9843C20.0924 8.66952 19.0808 6.48188 17.3183 4.98002C17.1889 4.86986 17.0209 4.81562 16.8515 4.82925C16.682 4.84287 16.5249 4.92322 16.4147 5.05265C16.185 5.32184 16.2181 5.72668 16.4873 5.95634C17.9635 7.21359 18.8106 9.04659 18.8106 10.9843C18.8111 11.9402 18.6037 12.8847 18.2029 13.7525C17.8021 14.6203 17.2175 15.3906 16.4894 16.0101C16.3896 16.0952 16.3183 16.2089 16.2852 16.3358C16.252 16.4628 16.2586 16.5968 16.304 16.7199C16.3494 16.843 16.4315 16.9491 16.5391 17.0241Z" fill="currentColor"/>
					</g>
				</svg>
				
				
                <!-- <img src="./img/notice.svg" class="laba" alt="" /> -->
            </template>
            <van-swipe vertical class="notice-swipe" :autoplay="10000" :touchable="false" :show-indicators="false">
                <van-swipe-item v-for="item in noticeList" :key="item.id"
                    @click="toPage('/NoticeDetail', { id: item.id })">
                    {{ item.subject }}
                </van-swipe-item>
            </van-swipe>
        </van-notice-bar>
        <div class="b-ul mt-6 mb-6">
            <div class="flex items-center b-li" v-for="row in bList" :key="row.id" @click="toDetail(row)">
                <img v-if="row.logo" :src="setBaseUrl(row.logo)" class="w-7 h-7 mr-2" alt="" />
                <div class="b-title">
                    <div>{{ row.base_asset.toUpperCase() }}</div>
                </div>
                <div class="latest_change flex-auto" :class="[
                    formatNumber(getData(row, 'price_latest_change')) >= 0 ? 'green-color' : 'red-color ',
                ]">
                    {{ getData(row, 'price') }}
                </div>
                <div class="num-count flex-shrink-0 ml-auto" :class="[
                    formatNumber(getData(row, 'price_change_percent')) > 0 ? 'status-green' : 'status-red',
                ]">
                    <div class="change_percent" :class="[
                        formatNumber(getData(row, 'price_change_percent')) > 0 ? 'green-color' : 'red-color',
                    ]">
                        {{ getData(row, 'price_change_percent') }}%
                    </div>
                </div>
            </div>
        </div>

        <MyConfirm hideCancel v-model="showConfirm" @confirm="showConfirm = false" :content="$t('success.error')"
            :close-on-click-overlay="false"></MyConfirm>
        <MyConfirm hideCancel v-model="success" @confirm="success = false" :content="$t('success.tip')"
            :close-on-click-overlay="false"></MyConfirm>
        <MyConfirm hideCancel v-model="showName" @confirm="$router.push('/RealName')" :content="$t('tipAll.tip')"
            :close-on-click-overlay="false"></MyConfirm>

        <!-- 弹窗公告 -->
        <MyConfirm v-model="showAnnouncement" :title="announcementList[currentAnnouncementIndex]?.title" hideCancel
            @confirm="handleAnnouncementConfirm" :close-on-click-overlay="false">
            <div class="p-4">
                <div v-html="announcementList[currentAnnouncementIndex]?.content"></div>
            </div>
        </MyConfirm>
    </div>
</template>

<style scoped lang="scss">
	.lang-icon {
		width: 24px;
		height: 24px;
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.logo {
    width: 101px;
    height: 24px;
    margin-top: 8px;
}

.img-item {
    width: 100%;
    height: 148px;
    flex-shrink: 0;
    border-radius: 4px;
    object-fit: cover;
}

.home-page {
    padding: 16px;
    display: flex;
    flex-direction: column;
}

.laba {
    width: 22px;
    height: 22px;
    margin-right: 8px;
}

.img-date {
    width: 24px;
    height: 24px;
}

.notice {
    .notice-swipe {
        height: 40px;
        line-height: 40px;
    }
}

.card-ul {
    display: flex;

    .card-li {
        width: 30%;
        flex: auto;
        margin-right: 8px;
        padding: 8px;
        border-radius: 8px;
        background-color: var(--surface-bg);

        &:last-child {
            margin-right: 0;
        }

        .card-title {
            font-weight: 500;
            font-size: 13px;
            color: var(--text-color);
            line-height: 15px;
            margin-bottom: 8px;
        }

        .card-value {
            font-family: DIN, DIN;
            font-weight: 500;
            font-size: 12px;
            color: var(--text-color);
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
        }

        .card-change {
            color: #e34646;
            font-size: 13px;
            font-family: DIN;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}

.menu-ul {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding-left: 0;
    padding-right: 0;
    margin-bottom: 0;
    margin-top: 12px;

    .menu-li {
        padding: 8px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;

        .menu-icon {
            width: 46px;
            height: 46px;
            margin-bottom: 10px;
        }

        .svg-box {
            width: 46px;
            height: 46px;
            border-radius: 50%;
            margin-bottom: 10px;
            background: var(--surface-bg);
            display: flex;
            align-items: center;
            justify-content: center;

            .menu-icon {
                width: 26px;
                height: 26px;
                margin: 0px;
            }
        }

        .menu-name {
            color: var(--text-color);
            text-align: center;
            font-size: 12px;
            line-height: 14px;
            min-width: 50px;
            font-weight: 500;
        }
    }
    .menu-li:nth-child(4n) {
        padding-right: 0;
    }
    .menu-li:nth-child(5),.menu-li:nth-child(1) {
        padding-left: 0;
    }
}

.money-ul {
    margin-top: 12px;
    display: flex;
    justify-content: space-between;
}

.money-box {
    width: 30%;
    flex: auto;
    background: var(--surface-bg);
    border-radius: 8px;
    padding: 14px 16px;
    font-weight: 500;
    font-size: 13px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.fs-15 {
    font-size: 15px !important;
}

.b-li {
    display: flex;
    align-items: center;
    margin-top: 10px;
    background: var(--surface-bg);
    border-radius: 0;
    padding: 16px;
    border-radius: 18px;

    &:first-child {
        margin-top: 0;
    }

    .b-title {
        font-weight: 500;
        font-size: 15px;
        color: var(--text-color);
        line-height: 18px;
        width: 25%;
    }

    .b-desc {
        font-weight: 500;
        font-size: 13px;
        color: var(--muted-text);
        line-height: 15px;
    }
}

.num-count {
    text-align: right;
    margin-left: 10px;
}

.latest_change {
    font-family: DIN, DIN;
    font-weight: 500;
    font-size: 15px;
    color: var(--text-color);
    line-height: 18px;
}

.change_percent {
    font-family: DIN, DIN;
    font-weight: 500;
    font-size: 13px;
    line-height: 15px;
    margin-top: 4px;
}

.chart {
    height: 30px;
}

:deep(.van-notice-bar) {
    border-radius: 12px;
    border: 1px solid var(--border-color);
}

.top-show-box {
    background: var(--surface-bg);
    border-radius: 18px;
    padding: 16px;
}

.top-label {
    font-weight: 500;
    font-size: 13px;
    color: var(--muted-text);
    line-height: 13px;
    margin-bottom: 6px;
}

.top-box {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .top-left {
        font-family: DIN, DIN;
        font-weight: 500;
        font-size: 25px;
        color: var(--text-color);
        line-height: 30px;
    }

    .top-tip {
        font-weight: 500;
        font-size: 10px;
        color: var(--primary);
        line-height: 10px;
        margin-top: 7px;
    }
}
</style>