import { getUploadApi } from '@/api/common'
import { showFailToast, showLoadingToast, closeToast } from 'vant'
export default function useUpload() {
    return async function uploadFile(file) {
        showLoadingToast({
            forbidClick: true,
        })

        // 获取后缀名
        const type = file.name.split('.').pop()
        const resp = await getUploadApi({
            mimetypes: type,
        })
        const uploadUrl = resp.upload_url ?? ''
        const filepath = resp.filepath ?? ''
        if (uploadUrl.length <= 0 || filepath.length <= 0) {
            showFailToast('upload error')
            return
        }

        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
        })

        if (!uploadRes.ok) {
            showFailToast('upload error')
            return
        }
        closeToast()
        return filepath
    }
}
