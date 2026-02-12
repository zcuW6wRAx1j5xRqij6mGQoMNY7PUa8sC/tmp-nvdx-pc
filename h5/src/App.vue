<template>
    <!-- <router-view :key="locale"/> -->
    <router-view>
        <template #default="{ Component, route }">
            <section class="flex-auto overflow-auto flex flex-col">
                <component :is="Component" :key="route.path + locale" />
            </section>
        </template>
    </router-view>
    <UpdateComponent
        :show="needUpdate"
        :download-process="downloadProgress"
        :latest-version="latestVer"
        :current-version="currentVer"
        :update-notice="releaseNote"
    />
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
import { openApp, version } from '@/api/common.js'
import { Device } from '@capacitor/device'
import HotUpdate from '@/helper/update'
import { App } from '@capacitor/app'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import UpdateComponent from '@/components/UpdateComponent/UpdateComponent.vue'
const appVersionCompare = (ver1, ver2) => {
    return ver1.localeCompare(ver2, undefined, { numeric: true })
}
const needUpdate = ref(false)
const latestVer = ref('')
const currentVer = ref('')
const releaseNote = ref('')
const downloadProgress = ref(0)
const downloadSuccess = ref(true)
const hotUpdate = new HotUpdate()

const checkForUpdates = async () => {
    const updateInfo = await hotUpdate.checkUpdate()
    if (!updateInfo || Object.keys(updateInfo).length === 0) {
        return
    }
    latestVer.value = updateInfo.latest_version
    releaseNote.value = updateInfo.release_content
    const downloadPath = updateInfo.download_path
    const downloadSum = updateInfo.md5_sum
    currentVer.value = await hotUpdate.currentVersion()

    if (appVersionCompare(currentVer.value, latestVer.value) >= 0) {
        return
    }

    needUpdate.value = true
    const data = await hotUpdate.update(downloadPath, latestVer.value, downloadSum)
    if (data && downloadSuccess.value) {
        try {
            await hotUpdate.install(data.id)
        } catch (e) {
            console.error('Install failed: ', e)
        } finally {
            needUpdate.value = false
            downloadProgress.value = 0
        }
    }
}

onMounted(async () => {
    CapacitorUpdater.addListener('download', state => {
        if (Number(state.percent) > Number(downloadProgress.value)) {
            downloadProgress.value = state.percent
        }
    })

    CapacitorUpdater.addListener('downloadFailed', () => {
        downloadSuccess.value = false
        needUpdate.value = false
        downloadProgress.value = 0
    })

    CapacitorUpdater.notifyAppReady()

    App.addListener('appStateChange', async state => {
        if (state.isActive) {
            await checkForUpdates()
        }
    })

    if (localStorage.getItem('token')) {
        // openApp({})
        //     .then(() => {
        //         localStorage.setItem('openApp', 1)
        //     })
        //     .catch(err => {
        //         console.error('Error opening app: ', err)
        //     })
    }
    localStorage.setItem('langname', 'id')

    if (localStorage.getItem('alarm')) {
        console.log('Removing alarm')
        localStorage.removeItem('alarm')
    }

    // const info = await Device.getInfo()
    // const platform = info.platform

    // if (platform !== 'web') {
    //     const type = platform === 'ios' ? 'IOS' : 'ANDROID'
    //     version({ type })
    //         .then(() => {
    //             // Handle version check logic here if needed
    //         })
    //         .catch(err => {
    //             console.error('Version error: ', err)
    //         })
    // }
})

onBeforeUnmount(() => {
    localStorage.removeItem('openApp')
})
</script>
