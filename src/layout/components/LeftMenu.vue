<script setup>
import { useUserInfo } from "@/hooks/useUserInfo"
import { useUserStoreHook } from "@/store/modules/user"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
const { t } = useI18n()
import { setBaseUrl } from "@/utils/utils"
const { userInfo } = useUserInfo()
const useUserStore = useUserStoreHook()
const router = useRouter()
const props = defineProps({
    isCollapsed: {
        type: Boolean,
        default: false,
    },
})

const getIcon = url => {
    return new URL(`../img/${url}.svg`, import.meta.url).href
}
const menuList = computed(() => {
    return [
        {
            name: t("menu.menu1"),
            path: "/",
            id: "homePage",
            icon: getIcon("menu1"),
			icons: getIcon("menu1s")
        },
        {
            name: t("menu.menu2"),
            path: "/TradingList",
            id: "tradingList",
            icon: getIcon("menu2"),
			icons: getIcon("menu2s"),
        },
        {
            name: t("menu.menu3"),
            path: "/ContractTradingList",
            id: "contractTradingList",
            icon: getIcon("menu3"),
			icons: getIcon("menu3s"),
        },
        {
            name: t("menu.menuOption"),
            path: "/OptionTrading",
            id: "optionTradingList",
            icon: getIcon("menuOption"),
            icons: getIcon("menuOptions"),
        },
        {
            name: t("menu.menu4"),
            path: "/MyAssets",
            id: "/MyAssets",
            icon: getIcon("menu4"),
			icons: getIcon("menu4s")
        },
        {
            name: t('ieo.list'),
            path: "/IEO",
            id: "IEO",
            icon: getIcon("menu5"),
			icons: getIcon("menu5s")
        },
        {
            name: t('ai.title'),
            path: '/AI',
            id: "AI",
            icon: getIcon("menu9"),
			icons: getIcon("menu9s")
        },
        {
            name: t('defn.title'),
            path: "/Defi",
            id: "Defi",
            icon: getIcon("menu7"),
			icons: getIcon("menu7s")
        },
        {
            name: t('otc.title'),
            path: "/OTC",
            id: "OTC",
            icon: getIcon("menu8"),
			icons: getIcon("menu8s")
        },
    ]
})
const handleMenuClick = (item) => {
    router.push(item.path)
}
const handleSignOut = () => {
    useUserStore.logOut()
}
</script>

<template>
    <section class=" left-menu" :class="{ collapsed: isCollapsed }">
        <div class="flex items-center mb-10">
			
            <img src="../../assets/img/logo.webp" class="logo" alt="" />
        <!-- <img src="/text.svg" alt="" class="text-logo"> -->
        </div>
        <img v-if="userInfo.avatar" :src="setBaseUrl(userInfo.avatar)" alt="" class="avatar" />
        <div class="user-info" v-show="!isCollapsed">{{ userInfo.name && userInfo.name.startsWith('user:') ? userInfo.name.slice(5) : userInfo.name }}</div>
        <div class="verified-identity flex items-center">
          <div v-if="!isCollapsed">
            {{ userInfo.is_verified_identity ? $t('userPopup.endName') :
            $t('userPopup.noName') }}
          </div>
            <img src="../img/verified-success.svg" v-if="userInfo.is_verified_identity" class="verified-icon" alt="">
            <img src="../img/verified.svg" class="verified-icon" v-else alt="">
        </div>
        <div class="menu-ul">
            <div v-for="item in menuList" :key="item.name" class="menu-item" :class="{
                'active':
                    item.path === $route.path ||
                    item.path === $route.meta.id,
            }" @click="handleMenuClick(item)">
                <img :src="item.icons" class="menu-icon" alt="" v-if='item.path === $route.path  || item.path === $route.meta.id'>
				<img :src="item.icon" class="menu-icon" alt="" v-else>
                <div class="menu-name" v-if="!isCollapsed">{{ item.name }}</div>
            </div>
        </div>
        <div class="sign-out"  @click="handleSignOut">
            <!-- <img src="../img/sign-out.svg" alt="" class="mr-2 w-4 h-4" :class="{ 'w-6 h-6': isCollapsed }" /> -->
			
			<svg   class="mr-2 w-4 h-4 lang-icon" :class="{ 'w-6 h-6': isCollapsed }" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path id="Vector" d="M7.16104 10.3092C6.84712 10.6243 6.84761 11.1341 7.16214 11.4487V11.4487C7.4771 11.7636 7.98775 11.7636 8.30271 11.4487L11.6177 8.1337C11.7035 8.04787 11.7035 7.90871 11.6177 7.82288L8.30271 4.50791C7.98775 4.19295 7.4771 4.19295 7.16214 4.50791V4.50791C6.84761 4.82244 6.84712 5.33224 7.16104 5.64737L8.67794 7.17015H1.67144C1.22511 7.17015 0.863299 7.53197 0.863299 7.97829V7.97829C0.863299 8.42461 1.22511 8.78643 1.67144 8.78643H8.67795L7.16104 10.3092ZM13.7934 0.705078H2.47955C1.58253 0.705078 0.863281 1.43239 0.863281 2.32135V4.74574C0.863281 5.19207 1.2251 5.55388 1.67142 5.55388V5.55388C2.11774 5.55388 2.47955 5.19207 2.47955 4.74574V2.32135H13.7934V13.6352H2.47955V11.2108C2.47955 10.7645 2.11774 10.4027 1.67143 10.4027V10.4027C1.22511 10.4027 0.863299 10.7645 0.863299 11.2108V13.6352C0.863299 14.5242 1.58254 15.2515 2.47957 15.2515H13.7934C14.6824 15.2515 15.4097 14.5242 15.4097 13.6352V2.32135C15.4097 1.43241 14.6824 0.705078 13.7934 0.705078Z" fill="currentColor"/>
			</svg>
			
			
            <div class="sigh-out-text" v-if="!isCollapsed">{{ t('my.signOut') }}</div>
        </div>
    </section>
</template>


<style scoped lang="scss">
.left-menu {
  flex-shrink: 0;
  width: 252px;
  padding: 24px;
  align-items: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;

  background-color: var(--bg-card);
  transition: width 0.3s ease;

  &.collapsed {
    width: 90px;
    padding: 24px 12px;

    .menu-name,
    .user-info,
    .verified-identity > div {
      opacity: 0;
      width: 0;
      margin: 0;
    }
  }
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 25px;
  margin-bottom: 14px;
}

.user-info {
  font-weight: 600;
  font-size: 16px;
  text-align: center;
  transition: all 0.3s ease;
  opacity: 1;
  white-space: nowrap;
  overflow: hidden;
  color: var(--text-primary);
}

.verified-identity {
  margin-top: 4px;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  opacity: 1;
  white-space: nowrap;
  overflow: hidden;
}

.verified-icon {
  width: 14px;
  height: 14px;
  margin-left: 4px;
}

.menu-ul {
  margin-top: 32px;
  width: 100%;
  overflow: auto;

  .menu-item {
    font-weight: 500;
    font-size: 16px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    padding: 18px 20px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;

    .menu-name {
      margin-left: 12px;
      transition: all 0.3s ease;
      opacity: 1;
      white-space: nowrap;
      overflow: hidden;
    }

    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    &.active {
      font-weight: bold;
      color: #fff; /* 主题色按钮通常用白字更稳 */
      background-color: var(--color-primary);
    }
  }

  .menu-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
}

.sign-out {
  padding: 18px 42px;
  background: var(--bg-page);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: auto;
  color: var(--text-primary);

  &:hover {
    background: var(--bg-hover);
  }
}

.collapsed .sign-out {
  padding: 12px;
}

.text-logo {
  height: 20px;
  margin-left: 10px;
}

.logo {
  width: 70px;
  height: auto;
  border-radius: 10px;
}
</style>