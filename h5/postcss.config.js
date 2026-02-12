// postcss.config.js
const px2rem = require('postcss-px2rem-exclude')

module.exports = {
    plugins: {
        autoprefixer: {},
        'postcss-px2rem-exclude': {
            remUnit: 37.5, // 设计稿宽度/10，通常设置为750
            exclude: /node_modules|folder_name/i, // 正则匹配不转换的文件或文件夹
        },
    },
}
