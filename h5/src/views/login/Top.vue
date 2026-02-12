<script lang="ts" setup>
	import { computed, onMounted, ref } from 'vue'
	import { useI18n } from 'vue-i18n'
	import vantChange from '@/utils/i18n/vantChange'

	// ✅ 主题工具（你前面 main.ts 用的那个）
	import { getTheme, setTheme, toggleTheme } from '@/utils/theme'

	const { t, locale } = useI18n()

	/** =========================
	 *  Language
	 *  ========================= */
	const langTxt = ref('')
	const langList = computed(() => {
		return [
			
			{ text: t('changeLang.label3'), value: 'en' },
			{ text: t('changeLang.label6'), value: 'de' },
			{ text: t('changeLang.label4'), value: 'es' },
			{ text: t('changeLang.label5'), value: 'fr' },
			{ text: t('changeLang.label7'), value: 'it' },
			{ text: t('changeLang.label1'), value: 'zh_TW' }
		]
	})

	const showPopover = ref(false)

	const onSelect = (item : any) => {
		langTxt.value = item.text
		locale.value = item.value
		localStorage.setItem('lang', item.value)
		vantChange()
	}

	/** =========================
	 *  Theme
	 *  ========================= */
	const themeMode = ref<'dark' | 'light'>('dark')

	const initTheme = () => {
		themeMode.value = getTheme()
		setTheme(themeMode.value) // 确保 Top 加载时也一致
	}

	const onToggleTheme = () => {
		themeMode.value = toggleTheme()
	}

	const themeIcon = computed(() => (themeMode.value === 'dark' ? '🌙' : '☀️'))
	const themeText = computed(() => (themeMode.value === 'dark' ? '' : ''))

	onMounted(() => {
		locale.value = (localStorage.getItem('lang') as any) || 'en'
		langTxt.value = langList.value.find(item => item.value === locale.value)?.text || ''

		// ✅ 初始化主题
		initTheme()
	})
</script>

<template>
	<van-nav-bar safe-area-inset-top placeholder fixed>
		<!-- 左侧：语言 -->
		<template #left>
			<van-popover v-model:show="showPopover" :actions="langList" @select="onSelect" teleport="#app"
				placement="bottom-start">
				<template #reference>
					<div class="flex items-center">
						<svg class="lang-icon" width="24" height="24" viewBox="0 0 24 24" fill="none"
							xmlns="http://www.w3.org/2000/svg">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
								xmlns="http://www.w3.org/2000/svg">
								<g id="Frame">
									<path id="Vector"
										d="M12 22.0781C6.44297 22.0781 1.92188 17.5573 1.92188 12C1.92188 6.44297 6.44297 1.92188 12 1.92188C17.5573 1.92188 22.0781 6.44297 22.0781 12C22.0781 17.5573 17.5573 22.0781 12 22.0781ZM12 3.32812C7.21828 3.32812 3.32812 7.21828 3.32812 12C3.32812 16.7817 7.21828 20.6719 12 20.6719C16.7817 20.6719 20.6719 16.7817 20.6719 12C20.6719 7.21828 16.7817 3.32812 12 3.32812Z"
										fill="currentColor" />
									<path id="Vector_2"
										d="M12 22.0781C9.24023 22.0781 7.07812 17.651 7.07812 12C7.07812 6.34875 9.24023 1.92188 12 1.92188C14.7598 1.92188 16.9219 6.34875 16.9219 12C16.9219 17.651 14.7598 22.0781 12 22.0781ZM12 3.32812C10.3371 3.32812 8.48438 6.88945 8.48438 12C8.48438 17.1105 10.3371 20.6719 12 20.6719C13.6631 20.6719 15.5156 17.1105 15.5156 12C15.5156 6.88945 13.6631 3.32812 12 3.32812Z"
										fill="currentColor" />
									<path id="Vector_3"
										d="M21.375 12.7031H2.625C2.23664 12.7031 1.92188 12.3884 1.92188 12C1.92188 11.6116 2.23664 11.2969 2.625 11.2969H21.375C21.7631 11.2969 22.0781 11.6116 22.0781 12C22.0781 12.3884 21.7631 12.7031 21.375 12.7031Z"
										fill="currentColor" />
									<path id="Vector_4"
										d="M12 21.9994C11.6116 21.9994 11.2969 21.6844 11.2969 21.2962V2.625C11.2969 2.23664 11.6116 1.92188 12 1.92188C12.3884 1.92188 12.7031 2.23664 12.7031 2.625V21.2962C12.7031 21.6844 12.3884 21.9994 12 21.9994Z"
										fill="currentColor" />
									<path id="Vector_5"
										d="M11.9993 22.0781C9.555 22.0781 7.19273 21.1838 5.34797 19.5591C5.19656 19.4255 5.10938 19.233 5.10938 19.0312C5.10938 18.8295 5.19633 18.637 5.34797 18.5034C7.19273 16.8787 9.555 15.9844 11.9993 15.9844C14.4438 15.9844 16.8059 16.8787 18.6506 18.5034C18.802 18.637 18.8892 18.8295 18.8892 19.0312C18.8892 19.233 18.8023 19.4255 18.6506 19.5591C16.8059 21.1838 14.4438 22.0781 11.9993 22.0781ZM6.9382 19.0312C8.41078 20.0941 10.1787 20.6719 11.9993 20.6719C13.8199 20.6719 15.5878 20.0941 17.0604 19.0312C15.5878 17.9684 13.8199 17.3906 11.9993 17.3906C10.1787 17.3906 8.41078 17.9684 6.9382 19.0312ZM11.9993 8.01562C9.55453 8.01562 7.1925 7.12102 5.34797 5.49633C5.19633 5.36297 5.10938 5.17055 5.10938 4.96875C5.10938 4.76695 5.19609 4.57453 5.34797 4.44117C7.1925 2.81648 9.55453 1.92188 11.9993 1.92188C14.4438 1.92188 16.8063 2.81648 18.6506 4.44117C18.802 4.57453 18.8892 4.76695 18.8892 4.96875C18.8892 5.17055 18.8023 5.36297 18.6506 5.49633C16.8063 7.12102 14.4438 8.01562 11.9993 8.01562ZM6.9382 4.96875C8.41055 6.03188 10.1784 6.60938 11.9993 6.60938C13.8199 6.60938 15.588 6.03188 17.0604 4.96875C15.5883 3.90562 13.8199 3.32812 11.9993 3.32812C10.1784 3.32812 8.41055 3.90562 6.9382 4.96875Z"
										fill="currentColor" />
								</g>
							</svg>
						</svg>

						<!-- <img src="./img/lang.svg" class="h-6 w-6" alt="" /> -->
						<span class="lang-txt">{{ langTxt }}</span>
						
						<svg class="arrow-down lang-icon" width="9" height="7" viewBox="0 0 9 7">
						  <svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
						    <path
						      id="Polygon 5"
						      d="M4.03829 6.23756C4.44776 6.7369 5.21167 6.7369 5.62113 6.23756L8.80426 2.35578C9.26079 1.79906 8.86472 0.962061 8.14475 0.962061L1.51468 0.962061C0.79471 0.96206 0.398637 1.79906 0.855163 2.35578L4.03829 6.23756Z"
						      fill="currentColor"
						    />
						  </svg>
						</svg>

						<!-- <img src="./img/arrow-down.svg" class="arrow-down" alt="" /> -->
					</div>
				</template>
			</van-popover>
		</template>

		<!-- 右侧：主题切换 -->
		<template #right>
			<div class="theme-btn" @click="onToggleTheme">
				<span class="theme-ico">{{ themeIcon }}</span>
				<!-- <span class="theme-txt">{{ themeText }}</span> -->
			</div>
		</template>
	</van-nav-bar>
</template>

<style scoped>
	.lang-txt {
		font-weight: 500;
		font-size: 15px;
		color: var(--text-color);
		line-height: 18px;
		text-align: left;
		font-style: normal;
		text-transform: none;
		margin-left: 6px;
		margin-right: 8px;
	}

	/* 主题按钮 */
	.theme-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		border-radius: 10px;
		user-select: none;
		cursor: pointer;
		background: rgba(127, 127, 127, 0.12);
	}

	.theme-ico {
		font-size: 16px;
		line-height: 1;
	}

	.theme-txt {
		font-weight: 500;
		font-size: 12px;
		color: var(--text-color);
		line-height: 16px;
	}

	.lang-icon {
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
</style>