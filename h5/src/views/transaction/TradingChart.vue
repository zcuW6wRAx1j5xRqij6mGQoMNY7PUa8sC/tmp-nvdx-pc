<script lang="ts" setup>
import { createChart } from 'lightweight-charts'
import { ref, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getKlineApi } from '@/api/data'
const { t } = useI18n()
const route = useRoute()
const symbol = route.query.symbol
let isInit = true
let changeLoading = ref(false)
// 属性 setSub 函数
const props = defineProps({
    setSub: {
        type: Function,
        required: true,
    },
    autosize: {
        type: Boolean,
        default: true,
    },
})
const chatProps = ['open', 'high', 'low', 'close', 'volume']
const setInfo = ctx => {
    if (changeLoading.value) {
        return
    }
    const data = ctx.data
    if (data.interval === typeActive.value) {
        data.time = Number(data.time_line / 1000)
        chatProps.forEach(key => {
            data[key] = Number(data[key])
        })
        mainSeries && mainSeries.update(data)
        volumeSeries &&
            volumeSeries.update({
                time: data.time,
                value: +data.volume,
            })
        if (isInit) {
            isInit = false
            updateLegend(undefined)
        }

    }
}
function getHisData() {
    changeLoading.value = true
    return getKlineApi({
        symbol_id: route.query.id,
        interval: typeActive.value,
    }).then(data => {
        data = data.map(el => {
            chatProps.forEach(key => {
                el[key] = Number(el[key])
            })

            el.timeline = +el.timeline
            // el.time = dayjs(+el.time_line).format('YYYY-MM-DD')
            el.time = Number(el.timeline / 1000)
            return el
        })
        changeLoading.value = false
        return data
    })
}
props.setSub(`public:kline_${symbol}`, setInfo)
const chartContainer = ref(null)
const typeActive = ref('1m')
const typeClick = async item => {
    typeActive.value = item.id
    const data = await getHisData()
    mainSeries && mainSeries.setData(data)
    volumeSeries &&
        volumeSeries.setData(
            data.map(el => {
                return {
                    time: el.time,
                    value: +el.volume,
                }
            }),
        )
    updateLegend(undefined)
    // isInit = true
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
        id: '1h',
        name: '1h',
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
let volumeSeries = null
let chart = null
let mainSeries = null
let legend = null

watch(
    () => props.autosize,
    enabled => {
        if (!enabled) {
            window.removeEventListener('resize', resizeHandler)
            return
        }
        window.addEventListener('resize', resizeHandler)
    },
)
const initChart = async () => {
    let container = document.getElementById('container')
    chart = createChart(chartContainer.value, {
        layout: {
            background: { color: '#141517' },
            textColor: '#C3BCDB',
        },
        grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
        },
    })
    chart.timeScale().applyOptions({
        // borderColor: '#71649C',
        barSpacing: 10,
    })
    chart.applyOptions({
        rightPriceScale: {
            scaleMargins: {
                top: 0.1,
                bottom: 0.1,
            },
            invertScale: true,
        },
    })
    volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
            type: 'volume',
        },
        priceScaleId: '', // set as an overlay by setting a blank priceScaleId
        // set the positioning of the volume series
        scaleMargins: {
            top: 0.7, // highest point of the series will be 70% away from the top
            bottom: 0,
        },
    })
    volumeSeries.priceScale().applyOptions({
        scaleMargins: {
            top: 0.7, // highest point of the series will be 70% away from the top
            bottom: 0,
        },
    })

    volumeSeries.setData([])

    // Create the Main Series (Candlesticks)
    mainSeries = chart.addCandlestickSeries()

    // Set the data for the Main Series
    mainSeries.setData([])
    setTimeout(() => {
        typeClick({
            id: '1m',
        })
    }, 200)

    /**
     * legend
     */
    legend = document.createElement('div')
    legend.style =
        'position: absolute; left: 12px; top: 10px; z-index: 1; font-size: 14px; font-family: sans-serif; line-height: 18px; font-weight: 300;'
    legend.style.color = 'white'
    nextTick(() => {
        container.appendChild(legend)
        // 初始显示legend
        updateLegend(undefined)
        chart.subscribeCrosshairMove(updateLegend)
        chart.timeScale().fitContent()
    })
}
const getLastBar = series => {
    const lastIndex = series && series.dataByIndex(Number.MAX_SAFE_INTEGER, -1)
    return series && series.dataByIndex(lastIndex)
}

const setTooltipHtml = ({ close, high, low, open, time }) => {
    const color = open <= close ? 'green' : 'red' // 根据条件确定颜色
    legend.innerHTML = `
            <div style="font-size: 14px;display:flex;flex-wrap: wrap;">
                <div class="mr-2" style="color: ${color};">${time}</div>
                <div class="mr-2">${t('detail.chart1')}:<span  class="ml-2" style="color: ${color};">${open}</span></div>
                <div class="mr-2">${t('detail.chart2')}:<span  class="ml-2" style="color: ${color};">${high}</span></div>
                <div class="mr-2">${t('detail.chart3')}:<span  class="ml-2" style="color: ${color};">${low}</span></div>
                <div class="mr-2">${t('detail.chart4')}:<span  class="ml-2" style="color: ${color};">${close}</span></div>
            </div>
        `
}
const updateLegend = param => {
    const validCrosshairPoint = !(
        param === undefined ||
        param.time === undefined ||
        param.point.x < 0 ||
        param.point.y < 0
    )
    const data = validCrosshairPoint ? param.seriesData.get(mainSeries) : getLastBar(mainSeries)
    data && setTooltipHtml(data)
}

const resizeHandler = () => {
    console.log('okkkkk')
    if (!chart || !chartContainer.value) return
    const dimensions = chartContainer.value.getBoundingClientRect()
    chart.resize(dimensions.width, dimensions.height)
}

onMounted(() => {
    initChart()
})

onUnmounted(() => {
    if (chartContainer.value) {
        chartContainer.value.remove()
        chartContainer.value = null
    }
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
    <div class="contract-trading">
        <div id="container" ref="chartContainer" />
    </div>
</template>
<style scoped lang="scss">
.contract-trading {
    position: relative;
    background: #141517;
}

#container {
    background: #141517;
    width: 100%;
    height: 330px;
    // padding-top: 70px;
    // padding-left: 60px;
}
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
        padding: 4px 8px;
        border-radius: 4px;
        flex-shrink: 0;
        &.active {
            color: #fff;
            font-weight: 500;
            background: #313c42;
        }
    }
}
</style>
