<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUserInfo } from '@/hooks/useUserInfo'
import { ArrowRight } from '@element-plus/icons-vue'
import MyDialog from '@/components/MyDialog/MyDialog.vue'

const { t } = useI18n()
const router = useRouter()
const { userInfo } = useUserInfo()

const emit = defineEmits(['changeTab'])

// 与 H5 一致的菜单：实名认证、登录密码、交易密码、订单历史、关于我们、用户协议、隐私条款
const menuList = computed(() => [
    { name: t('assets.tabList.tab2'), action: 'tab', tab: 'NameCertification' },
    { name: t('changePwd.tab.tab2'), action: 'tab', tab: 'SetPwd' },
    { name: t('changePwd.tab.tab1'), action: 'tab', tab: 'SetPwd' },
    { name: t('assets.tabList.tab4'), action: 'tab', tab: 'OrderHis' },
    { name: t('userPopup.menu6'), action: 'route', path: '/Agree', query: { type: 1 } },
    { name: t('userPopup.menu7'), action: 'route', path: '/Agree', query: { type: 2 } },
    { name: t('userPopup.menu8'), action: 'route', path: '/Agree', query: { type: 3 } },
])

const showOut = ref(false)

function handleClick(item) {
    if (item.action === 'tab') {
        emit('changeTab', item.tab)
    } else if (item.action === 'route') {
        router.push({ path: item.path, query: item.query || {} })
    }
}

function signOut() {
    localStorage.removeItem('token')
    showOut.value = false
    router.replace('/Login')
}
</script>

<template>
    <div class="setting-panel">
        <div class="setting-title">{{ t('setting.title') }}</div>
        <div class="setting-list">
            <div
                v-for="(item, index) in menuList"
                :key="index"
                class="setting-item"
                @click="handleClick(item)"
            >
                {{ item.name }}
                <el-icon class="setting-arrow"><ArrowRight /></el-icon>
            </div>
        </div>
        <div class="setting-footer">
            <p class="setting-version">Coinalgo</p>
            <el-button type="danger" class="logout-btn" @click="showOut = true">
                {{ t('my.signOut') }}
            </el-button>
        </div>
        <MyDialog
            v-model="showOut"
            :title="t('my.signOut')"
            :show-footer="true"
            :hide-cancel="false"
            @confirm="signOut"
        >
            <template #default>
                <div>{{ t('my.outContent') }}</div>
            </template>
        </MyDialog>
    </div>
</template>

<style scoped lang="scss">
.setting-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: 0 20px;
}

.setting-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 24px;
}

.setting-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--bg-card);
    border-radius: 16px;
    font-size: 15px;
    color: var(--text-primary);
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.9;
    }
}

.setting-arrow {
    color: var(--text-secondary);
    font-size: 14px;
}

.setting-footer {
    margin-top: auto;
    padding: 32px 0 24px;
    text-align: center;

    .setting-version {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 20px;
    }

    .logout-btn {
        width: 100%;
        max-width: 200px;
    }
}
</style>
