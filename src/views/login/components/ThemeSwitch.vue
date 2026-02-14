<script setup>
import { useI18n } from 'vue-i18n'
import { setTheme } from '@/utils/theme'
import { Sunny, Moon } from '@element-plus/icons-vue'

const { t } = useI18n()

const currentTheme = ref('dark')

function updateTheme() {
    currentTheme.value = document.documentElement.getAttribute('data-theme') || 'dark'
}

function toggleTheme() {
    const next = currentTheme.value === 'dark' ? 'light' : 'dark'
    setTheme(next)
    currentTheme.value = next
}

onMounted(() => {
    updateTheme()
})

// 监听其他处修改主题（如多标签）
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
    })
    onUnmounted(() => observer.disconnect())
}
</script>

<template>
    <div
        class="theme-switch"
        :title="t('setting.theme')"
        @click="toggleTheme"
    >
        <el-icon class="theme-icon">
            <Sunny v-if="currentTheme === 'light'" />
            <Moon v-else />
        </el-icon>
        <span class="theme-label">
            {{ currentTheme === 'dark' ? t('setting.themeDark') : t('setting.themeLight') }}
        </span>
    </div>
</template>

<style scoped lang="scss">
.theme-switch {
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    border-radius: 20px;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
    min-width: 100px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.9;
    }
}

.theme-icon {
    font-size: 18px;
}

.theme-label {
    white-space: nowrap;
}
</style>
