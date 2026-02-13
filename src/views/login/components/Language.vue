<script setup>
import { useI18n } from "vue-i18n"
const { t, locale } = useI18n()
import { ArrowDownBold } from "@element-plus/icons-vue"
const languageList = computed(() => {
    let list = []
    if (process.env.NODE_ENV === "development") {
        list.push({
            text: t("changeLang.label2"),
            value: "zh_CN",
        })
    }
    return [
        ...list,
        {
            text: '繁體中文',
            value: "zh_TW",
        },
        {
            text: "Deutsch",
            value: "de",
        },
        {
            text: "English",
            value: "en",
        },
        {
            text: "Español",
            value: "es",
        },
        {
            text: "Français",
            value: "fr",
        },
        {
            text: "Italiano",
            value: "it",
        },
    ]
})
const curLanguage = ref("")
onMounted(() => {
    const language = localStorage.getItem("language")
    if (language) {
        locale.value = language
        curLanguage.value =
            languageList.value.find((item) => item.value === language)?.text ||
            t("changeLang.label6")
    } else {
        curLanguage.value = t("changeLang.label6")
    }
})
const handleCommand = (val) => {
    locale.value = val
    localStorage.setItem("language", val)
    curLanguage.value =
        languageList.value.find((item) => item.value === val)?.text ||
        t("changeLang.label6")
}
</script>
<template>
	
    <el-dropdown @command="handleCommand" popper-class="my-dropdown-popper" class="ml-4">
		
        <div class="show-language">
            {{ curLanguage
            }}<el-icon class="el-icon--right">
                <ArrowDownBold />
            </el-icon>
        </div>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item v-for="item in languageList" :key="item.value" :command="item.value">
				{{item.text }}
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>
<style scoped lang="scss">
	
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
	
	/* 分割线（如果你用了 divided） */
	:global(.my-dropdown-popper .el-dropdown-menu__item--divided::before) {
	  background: var(--border-color) !important;
	}
	
	:global(.my-dropdown-popper .el-popper__arrow::before) {
	  background: var(--bg-popup) !important;
	  border: 1px solid var(--border-color) !important;
	}
	
	
:deep(.el-dropdown) {
    .el-button--primary {
        height: 60px;
        background-color:  var(--bg-card);
        border-radius: 4px;
        border: none !important;
        color: #fff;
        font-family: Raleway;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: 22px;
        /* 157.143% */
        outline: none !important;
    }

    .el-icon {
        color: #fff;
    }

    .popper {
        background: pink !important;
    }
}

.show-language {
	border: 1px solid var(--border-color);
    background: var(--bg-card);
    border-radius: 4px;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 14px;
    color:var(--text-primary);
    min-width: 145px;
    height: 60px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>