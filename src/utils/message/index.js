import { ElMessage, ElMessageBox } from "element-plus"
import "element-plus/es/components/message/style/css"
import "element-plus/es/components/message-box/style/css"
import i18n from "@/utils/i18n"
// 消息
const Message = (message) => {
    return ElMessage({
        message,
        type: "normal",
    })
}

// 成功
const successMessage = (message) => {
    return ElMessage({
        message,
        type: "success",
    })
}

// 警告
const warnMessage = (message) => {
    return ElMessage({
        message,
        type: "warning",
    })
}

// 失败
const errorMessage = (message) => {
    return ElMessage({
        message,
        type: "error",
    })
}

const confirmMessageBox = ({ message, title }) => {
    const t = i18n.global.t
    return new Promise((resolve, reject) => {
        ElMessageBox.confirm(message, title ?? t("common.text3"), {
            confirmButtonText: t("common.text1"),
            cancelButtonText: t("spotOpe.cancel"),
            type: "warning",
            showClose: false,
            confirmButtonClass: "confirm-button-class",
            // beforeClose: () => {

            // }
        })
            .then(() => {
                resolve("")
            })
            .catch(() => {
                reject()
            })
    })
}
export { Message, successMessage, warnMessage, errorMessage, confirmMessageBox }
