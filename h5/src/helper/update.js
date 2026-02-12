import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { Device } from '@capacitor/device'
import { queryUpdate } from '@/api/common'
import { version as packageVer } from '../../package.json'

export default class HotUpdate {
    update(url, version, package_sum) {
        return CapacitorUpdater.download({
            url: url,
            version: version,
            checksum: package_sum,
        })
    }

    async install(id) {
        return CapacitorUpdater.set({ id: id })
    }

    async currentVersion() {
        const { bundle } = await CapacitorUpdater.current()
        let ver = bundle.version
        if (!ver || ver === 'builtin') {
            ver = packageVer ? packageVer : '0.0.0'
        }
        return ver
    }

    async checkUpdate() {
        const { platform } = await Device.getInfo()
        const { bundle } = await CapacitorUpdater.current()
        const { version } = await CapacitorUpdater.getPluginVersion()
        const { identifier } = await Device.getId()

        if (platform.toString().toLowerCase() == 'web') {
            return {}
        }

        let currentVer = bundle.version
        if (!currentVer || currentVer === 'builtin') {
            currentVer = '0.0.1'
        }

        // 下个版本传递给服务端 记录用户使用情况
        const payload = {
            platform: platform,
            device_id: identifier,
            app_version: currentVer,
            plugin_version: version,
        }

        const res = await queryUpdate(payload).catch(e => {
            console.error(e)
            return {}
        })

        return res
    }
}
