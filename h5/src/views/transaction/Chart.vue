<script setup>
import { onMounted, onUnmounted, defineProps, ref } from 'vue'
import { getKlineApi } from '@/api/data'
import { init, dispose } from 'klinecharts'

const props = defineProps({
    setSub: {
        type: Function,
        required: true,
    },
    symbol: {
        type: String,
        required: true,
    },
    symbolId: {
        type: String,
        required: true,
    },
    unsubscribeChannel: {
        type: Function,
        required: false,
    },
    isSpots: {
        type: Boolean,
        default: false,
    },
})
const typeActive = ref('1m')
const typeClick = async item => {
    typeActive.value = item.id
    getHisData()
}
const typeList = ref([
    {
        id: '1m',
        name: '1m',
    },
    {
        id: '5m',
        name: '5m',
    },
    {
        id: '15m',
        name: '15m',
    },
    {
        id: '30m',
        name: '30m',
    },
    {
        id: '1d',
        name: '1d',
    },
    {
        id: '1w',
        name: '1w',
    },
    {
        id: '1M',
        name: '1M',
    },
])
const chartTypeList = ref([
    {
        id: 'MA',
        name: 'MA',
    },
    {
        id: 'RSI',
        name: 'RSI',
    },
    {
        id: 'MACD',
        name: 'MACD',
    },
    {
        id: 'BOLL',
        name: 'BOLL',
    },
    {
        id: 'KDJ',
        name: 'KDJ',
    },
    {
        id: 'OBV',
        name: 'OBV',
    },
    {
        id: 'SAR',
        name: 'SAR',
    },
])
let changeLoading = ref(false)
const chatProps = ['open', 'high', 'low', 'close', 'volume']
const chartContainer = ref(null)
let lastClosePrice = null
const setInfo = ctx => {
    if (changeLoading.value) {
        return
    }
    const data = ctx.data
    if (data.interval === typeActive.value) {
        if(data.symbol == "ulxusdc" && data.interval == "1M" && data.time_line == "1756684800000"){
          data.open = 0.361
          data.low = 0.361
        }
        data.timestamp = Number(data.time_line)
        chatProps.forEach(key => {
            data[key] = Number(data[key])
        })

        // 检查开盘价是否与上一根收盘价一致
        console.log(lastClosePrice, 'lastClosePrice', data.open)
        if (data.open !== lastClosePrice) {
            // 保存原始数据
            const originalOpen = data.open
            const originalHigh = data.high
            const originalLow = data.low
            
            // 修正开盘价为上一根的收盘价
            data.open = lastClosePrice
            
            // 重新计算最高价和最低价
            // 如果原始最高价不是开盘价，则保留；如果是开盘价，则用新的开盘价和收盘价计算
            if (originalHigh !== originalOpen) {
                // 原始最高价不是开盘价，保留原始最高价
                data.high = Math.max(data.open, data.close, originalHigh)
            } else {
                // 原始最高价就是开盘价，重新计算
                data.high = Math.max(data.open, data.close)
            }
            
            // 如果原始最低价不是开盘价，则保留；如果是开盘价，则用新的开盘价和收盘价计算
            if (originalLow !== originalOpen) {
                // 原始最低价不是开盘价，保留原始最低价
                data.low = Math.min(data.open, data.close, originalLow)
            } else {
                // 原始最低价就是开盘价，重新计算
                data.low = Math.min(data.open, data.close)
            }
        }
        if(data.full_kline){
            lastClosePrice = data.close
        }
        console.log(data)
        chartContainer.value.updateData(data)
    }
}
// 获取历史数据
function getHisData() {
    changeLoading.value = true
    return getKlineApi({
        symbol_id: props.symbolId,
        interval: typeActive.value,
        symbol_type: props.isSpots ? 'spot' : 'futures',
    })
        .then(data => {
            let max = Number.MIN_SAFE_INTEGER
            data =
                data &&
                data.map(el => {
                    chatProps.forEach(key => {
                        el[key] = Number(el[key])
                    })
                    el.timestamp = +el.tl
                    el.open = +el.o
                    el.close = +el.c
                    el.high = +el.h
                    el.low = +el.l
                    el.volume = +el.v
                    max = Math.max(max, +el.c)
                    return el
                })
            if (max < 0.009) {
                chartContainer.value.setPrecision({
                    price: 8,
                    volume: 2,
                }) // 价格保留 6 位小数，成交量保留 2 位小数
            } else {
                chartContainer.value.setPrecision({
                    price: 4,
                    volume: 2,
                }) // 价格保留 6 位小数，成交量保留 2 位小数
            }
            console.log(data)
            lastClosePrice = data[data.length - 1].close
            chartContainer.value.applyNewData(data)
        })
        .finally(() => {
            changeLoading.value = false
        })
}
// 保存当前订阅的回调函数引用，用于取消订阅
const currentCallbackRef = ref(null)
watch(
    () => props.symbol,
    (newVal, oldVal) => {
        // 取消旧订阅时传入回调函数引用
        if (oldVal && currentCallbackRef.value) {
            props.unsubscribeChannel(`public:kline_${oldVal}`, currentCallbackRef.value)
            currentCallbackRef.value = null
        }
        // 订阅新频道并保存回调函数引用
        if (newVal) {
            currentCallbackRef.value = setInfo
            props.setSub(`public:kline_${newVal}`, setInfo)
            getHisData()
        }
    },
    { immediate: true },
)
const initChart = () => {
    // const chart = init('k-line-chart')
    const chart = init('k-line-chart', { decimalFold: { threshold: 1000 },
        // 使用内置的en-US语言，通过自定义格式化函数实现欧洲格式
        locale: 'en-US',
        // 自定义千分符配置实现欧洲格式
        thousandsSeparator: {
            sign: '.',
            format: (value) => {
                const num = parseFloat(value)
                if (isNaN(num)) return value
                const parts = num.toString().split('.')
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                return parts.join(',')
            }
        } ,
        // 自定义格式化器
        formatter: {
            formatBigNumber: (value) => {
                const num = parseFloat(value)
                if (isNaN(num)) return value
                const parts = num.toString().split('.')
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                return parts.join(',')
            }
        }  })
    chart.setStyles({
        candle: {
            // 蜡烛图类型 'candle_solid'|'candle_stroke'|'candle_up_stroke'|'candle_down_stroke'|'ohlc'|'area'
            type: 'candle_solid',
            // 蜡烛柱
            bar: {
                upColor: '#F92855',
                downColor: '#2DC08E',
                noChangeColor: '#888888',
                upBorderColor: '#F92855',
                downBorderColor: '#2DC08E',
                noChangeBorderColor: '#888888',
                upWickColor: '#F92855',
                downWickColor: '#2DC08E',
                noChangeWickColor: '#888888',
            },
            // 面积图
        },
        // 网格线
        grid: {
            show: true,
            horizontal: {
                show: true,
                size: 1,
                color: '#333',
                style: 'dashed',
                dashedValue: [2, 2],
            },
            vertical: {
                show: true,
                size: 1,
                color: '#333',
                style: 'dashed',
                dashedValue: [2, 2],
            },
        },
        xAxis: {
            show: true,
            size: 'auto',
            // x轴线
            axisLine: {
                show: true,
                color: '#888888',
                size: 1,
            },
            // x轴分割文字
            tickText: {
                show: true,
                color: '#D9D9D9',
                family: 'Helvetica Neue',
                weight: 'normal',
                size: 12,
                marginStart: 4,
                marginEnd: 4,
            },
            // x轴分割线
            tickLine: {
                show: true,
                size: 1,
                length: 3,
                color: '#888888',
            },
        },
        // y轴
        yAxis: {
            show: true,
            size: 'auto',
            reverse: false,
            // y轴线
            axisLine: {
                show: true,
                color: '#888888',
                size: 1,
            },
            tickText: {
                show: true,
                color: '#D9D9D9',
                family: 'PingFang SC',
                weight: 'normal',
                size: 12,
                marginStart: 4,
                marginEnd: 4,
            },
            // x轴分割线
            tickLine: {
                show: true,
                size: 1,
                length: 3,
                color: '#888888',
            },
        },
        candle: {
            tooltip: {
                showType: 'rect',
                showRule: 'follow_cross',
            },
        },
        indicator: {
            tooltip: {
                showRule: 'follow_cross',
            },
        },
        separator: {
            size: 1,
            color: '#333',
            fill: true,
            activeBackgroundColor: 'rgba(230, 230, 230, .15)'
        },
    })
    // registerLocale('zh-HK', {
    //     time: '時間：',
    //     open: '開：',
    //     high: '高：',
    //     low: '低：',
    //     close: '收：',
    //     volume: '成交量:',
    // })
    // this.chart.setLocale('zh-HK')
    // chart.applyNewData(genData())

    chart.createIndicator(
        {
            name: 'VOL',
            styles: {
                'font-size': '12px',
                color: 'red',
                lines: [
                    {
                        size: 1,
                        style: 'solid',
                        dashedValue: [2, 2],
                        color: 'rgba(0, 0, 0, 0)',
                    },
                ],
            },
        },
        true,
        {
            gap: { top: 0.02, bottom: 0.01 },
        },
    ) // volume
    chartContainer.value = chart
    // getHisData()
    tabChange(['MA', 'MACD'])
}
const showList = []
const speList = ['MACD', 'OBV', 'RSI', 'KDJ',]
const tabChange = activeList => {
    // 判断activeList 里面的数据是否在showList里面如果在，则不操作，不在则添加，如果showList里面有activeList没有的元素 则删除
    activeList.forEach(item => {
        if (!showList.includes(item)) {
            showList.push(item)
            if (speList.includes(item)) {
                chartContainer.value.createIndicator(item, false, { id: item })
            } else {
                chartContainer.value.createIndicator(
                    {
                        name: item,
                        styles: {
                            'font-size': '12px',
                            color: 'red',
                        },
                    },
                    true,
                    {
                        id: 'candle_pane',
                        gap: { top: 0.02, bottom: 0.01 },
                    },
                )
            }
        }
    })
    showList.forEach(item => {
        if (!activeList.includes(item)) {
            if (speList.includes(item)) {
                chartContainer.value.removeIndicator({
                    name: item,
                })
            } else {
                chartContainer.value.removeIndicator({
                    name: item,
                })
            }

            showList.splice(showList.indexOf(item), 1)
        }
    })
    chartContainer.value.resize()
}
onMounted(() => {
    initChart()
})
onUnmounted(() => {
    dispose('k-line-chart')
})
</script>

<template>
    <div class="type-ul">
        <div
            class="type-li"
            v-for="item in typeList"
            :key="item.id"
            @click="typeClick(item)"
            :class="{ active: item.id === typeActive }"
        >
            {{ item.name }}
        </div>
    </div>
    <div id="k-line-chart" style="width: 100%; min-height: 500px" class="overflow-auto"></div>
    <MyTab
        style="flex-shrink: 0"
        :tabList="chartTypeList"
        isMultiple
        isSelect
        isSmall
        @tabChange="tabChange"
        :tabActive="['MA', 'MACD']"
    ></MyTab>
</template>

<style scoped lang="scss">
.type-ul {
    display: flex;
    margin-left: -4px;
    overflow: auto;
    justify-content: space-between;
    margin-bottom: 14px;
    flex-shrink: 0;
    .type-li {
        margin-left: 4px;
        color: #a1a1a1;
        text-align: center;
        font-size: 12px;
        font-style: normal;
        line-height: normal;
        padding: 2px 6px;
        border-radius: 4px;
        flex-shrink: 0;
        &.active {
            color: #fff;
            font-weight: 500;
            background: #1EB576;
        }
    }
}
</style>
