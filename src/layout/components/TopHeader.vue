<script setup>
import { useUserStoreHook } from "@/store/modules/user"
import { useI18n } from "vue-i18n"
import { computed, ref } from "vue"
import Language from "@/views/login/components/Language.vue"
import { useRouter, useRoute } from "vue-router"
import OpeBtn from "./OpeBtn.vue"
import { Setting as SettingIcon } from "@element-plus/icons-vue"
import MyDialog from "@/components/MyDialog/MyDialog.vue"
import { aboutUsApi, userAgreementApi, privacyPolicyApi } from "@/api/data"
import { setTheme } from "@/utils/theme"

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const useUserStore = useUserStoreHook()
const userName = computed(() => useUserStore.userInfoData.name)

const props = defineProps({
    isCollapsed: {
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(['toggle-menu'])
const getIcon = url => {
    return new URL(`../img/${url}.svg`, import.meta.url).href
}

// 设置下拉菜单：跳转我的资产用 action: 'tab'，协议弹窗用 action: 'agree'，退出用 action: 'logout'
const settingMenuList = computed(() => [
    { label: t('assets.tabList.tab2'), action: 'tab', tab: 'NameCertification' },
    { label: t('changePwd.tab.tab2'), action: 'tab', tab: 'SetPwd' },
    { label: t('changePwd.tab.tab1'), action: 'tab', tab: 'SetPwd' },
    { label: t('assets.tabList.tab4'), action: 'tab', tab: 'OrderHis' },
    { label: t('userPopup.menu6'), action: 'agree', type: 1 },
    { label: t('userPopup.menu7'), action: 'agree', type: 2 },
    { label: t('userPopup.menu8'), action: 'agree', type: 3 },
])

const agreeDialogVisible = ref(false)
const agreeTitle = ref('')
const agreeContent = ref('')
const agreeLoading = ref(false)
const logoutDialogVisible = ref(false)

function onSettingCommand(item) {
    if (item.action === 'tab') {
        router.push({ path: '/MyAssets', query: { type: item.tab } })
        return
    }
    if (item.action === 'agree') {
        agreeTitle.value = item.label
        agreeContent.value = ''
        agreeDialogVisible.value = true
        agreeLoading.value = true
        const api = item.type === 1 ? aboutUsApi : item.type === 2 ? userAgreementApi : privacyPolicyApi
        api().then((data) => {
            agreeContent.value = data?.content || ''
        }).finally(() => {
            agreeLoading.value = false
        })
        return
    }
    if (item.action === 'theme') {
        const current = document.documentElement.getAttribute('data-theme')
        setTheme(current === 'dark' ? 'light' : 'dark')
        return
    }
    if (item.action === 'logout') {
        logoutDialogVisible.value = true
    }
}

function signOut() {
    localStorage.removeItem('token')
    logoutDialogVisible.value = false
    router.replace('/Login')
}
</script>

<template>
    <section class="top-header">
        <img src="../img/open.svg" class="open" :class="{ 'collapsed': isCollapsed }" @click="emit('toggle-menu')" alt="">
        <div class="right-ope">
            <OpeBtn />
            <el-dropdown trigger="click" popper-class="my-dropdown-popper" @command="onSettingCommand">
                <span class="ope-box setting-trigger">
                    <el-icon class="setting-icon"><SettingIcon /></el-icon>
                    <span class="setting-label">{{ t('setting.sbutitle') }}</span>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item
                            v-for="(item, index) in settingMenuList"
                            :key="index"
                            :command="item"
                        >
                            {{ item.label }}
                        </el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'theme' }">
                            {{ t('setting.theme') }}
                        </el-dropdown-item>
                        <el-dropdown-item divided :command="{ action: 'logout' }">
                            {{ t('my.signOut') }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <Language />
        </div>

        <!-- 协议/关于我们 弹窗 -->
        <el-dialog
            v-model="agreeDialogVisible"
            :title="agreeTitle"
            width="600px"
            class="agree-dialog"
            destroy-on-close
        >
            <div v-loading="agreeLoading" class="agree-dialog-body" v-html="agreeContent" />
        </el-dialog>

        <!-- 退出登录确认 -->
        <MyDialog
            v-model="logoutDialogVisible"
            :title="t('my.signOut')"
            :show-footer="true"
            :hide-cancel="false"
            @confirm="signOut"
        >
            <template #default>
                <div>{{ t('my.outContent') }}</div>
            </template>
        </MyDialog>
    </section>
</template>

<style scoped lang="scss">
.top-header {
    width: 100%;
    min-height: 100px;
    display: flex;
    align-items: center;
    padding: 20px 30px;
    flex-shrink: 0;
}


.right-ope {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    margin-left: auto;
    gap: 10px;
}

/* 样式参考 OpeBtn.vue 的 .ope-box */
.ope-box {
    min-width: 145px;
    height: 60px;
    background: var(--bg-card);
    border-radius: 20px;
    padding: 18px;
    font-weight: 500;
    font-size: 14px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
}

.setting-trigger {
    cursor: pointer;
    .setting-icon {
        margin-right: 6px;
        font-size: 18px;
    }
}

/* 下拉样式参考 Language.vue */
:global(.my-dropdown-popper.el-popper),
:global(.my-dropdown-popper.el-dropdown__popper) {
    background: var(--bg-popup) !important;
    border: 1px solid var(--border-color) !important;
    box-shadow: var(--shadow-popup) !important;
}
:global(.my-dropdown-popper .el-dropdown-menu) {
    background: var(--bg-popup) !important;
    padding: 6px 0;
}
:global(.my-dropdown-popper .el-dropdown-menu__item) {
    color: var(--text-primary) !important;
}
:global(.my-dropdown-popper .el-dropdown-menu__item:hover),
:global(.my-dropdown-popper .el-dropdown-menu__item.is-active) {
    background: var(--bg-hover) !important;
    color: var(--text-primary) !important;
}
:global(.my-dropdown-popper .el-dropdown-menu__item--divided::before) {
    background: var(--border-color) !important;
}
:global(.my-dropdown-popper .el-popper__arrow::before) {
    background: var(--bg-popup) !important;
    border: 1px solid var(--border-color) !important;
}

:deep(.agree-dialog-body) {
    max-height: 60vh;
    overflow: auto;
    color: var(--text-primary);
    line-height: 1.6;
}
:deep(.agree-dialog .el-dialog__body) {
    padding: 20px 24px;
}

.open {
    cursor: pointer;
    transition: transform 0.3s ease;

    &.collapsed {
        transform: rotate(180deg);
    }
}

.notice {
    width: 60px;
    height: 60px;
    margin-left: 10px;
    cursor: pointer;
    border-radius: 20px;
}

</style>
