// 处理环境变量
const warpperEnv = (envConf) => {
    // 此处为默认值，无需修改
    const ret = {
        VITE_PORT: 8668,
        VITE_PUBLIC_PATH: '',
        VITE_PROXY_DOMAIN: '',
        VITE_PROXY_DOMAIN_REAL: '',
        VITE_ROUTER_HISTORY: '',
    }

    for (const envName of Object.keys(envConf)) {
        let realName = envConf[envName].replace(/\\n/g, '\n')
        realName = realName === 'true' ? true : realName === 'false' ? false : realName

        if (envName === 'VITE_PORT') {
            realName = Number(realName)
        }
        ret[envName] = realName
        if (typeof realName === 'string') {
            process.env[envName] = realName
        } else if (typeof realName === 'object') {
            process.env[envName] = JSON.stringify(realName)
        }
    }
    return ret
}

// 跨域代理重写
const regExps = (value, reg) => {
    return value.replace(new RegExp(`^${reg}`, 'g'), '')
}

// 环境变量
const loadEnv = () => {
    return import.meta.env
}

// # 图片资源路径
const VITE_IMAGE_PATH = 'https://s3.nvdx.io'
export { warpperEnv, regExps, loadEnv, VITE_IMAGE_PATH }
