<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue"
import * as echarts from "echarts/core"
import { TooltipComponent, GridComponent, VisualMapComponent } from "echarts/components"
import { LineChart, BarChart } from "echarts/charts"
import { UniversalTransition } from "echarts/features"
import { CanvasRenderer } from "echarts/renderers"
import { getKlineApi } from "@/api/data"
import { friendlyNumber } from "@/utils/utils"
import dayjs from "dayjs"

echarts.use([
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  LineChart,
  BarChart,
  CanvasRenderer,
  UniversalTransition,
])

const props = defineProps({
  symbolId: { type: Number, default: 0 },
})

const periods = ["5m", "15m", "30m", "1h", "1d", "1w", "1mo"]
const dayList = ["1d", "1w", "1mo"]
const activePeriod = ref(periods[0])
const chartRef = ref(null)
let chartInstance = null
let visibilityObserver = null
const dateList = ref([])
const valueList = ref([])
const volumeList = ref([])

const getChartData = (list, isDay) => {
  dateList.value = []
  valueList.value = []
  volumeList.value = []
  if (!list || !list.length) return
  list.forEach((item) => {
    dateList.value.push(
      dayjs(item.tl).format(isDay ? "YYYY-MM-DD" : "HH:mm")
    )
    valueList.value.push(+item.o)
    volumeList.value.push(+item.v)
  })
}

const getKlineData = async (interval, id = props.symbolId) => {
  if (!id) return
  activePeriod.value = interval
  const isDay = dayList.includes(interval)
  const res = await getKlineApi({
    symbol_id: id,
    interval,
    symbol_type: "spot",
  }).catch(() => [])
  getChartData(res || [], isDay)
  nextTick(() => initChart())
}

// 根据当前数据计算 y 轴 min/max/interval
const calcYAxisRange = (values) => {
  if (!values || !values.length) return { min: 0, max: 100, interval: 25 }
  const min = Math.min(...values)
  const maxVal = Math.max(...values)
  const maxIncrease = maxVal * 0.2
  const range = maxVal + maxIncrease - min
  const padding = range * 0.4
  let yMin = Math.max(0, min - padding)
  let yMax = maxVal + maxIncrease
  const finalRange = yMax - yMin
  const interval = finalRange > 0 ? finalRange / 4 : 25
  return { min: yMin, max: yMax, interval }
}

const initChart = () => {
  if (!chartRef.value || !valueList.value.length) return
  setTimeout(() => {
    if (!chartRef.value) return
    if (!chartInstance) {
      chartInstance = echarts.init(chartRef.value)
    } else {
      chartInstance.resize()
    }
    const totalData = valueList.value.length
    const defaultShowCount = Math.min(1000, totalData)
    const start =
      totalData > defaultShowCount
        ? ((totalData - defaultShowCount) / totalData) * 100
        : 0
    const { min: yMin, max: yMax, interval: yInterval } = calcYAxisRange(
      valueList.value
    )
    const volValues = volumeList.value
    const volMin =
      volValues.length > 0 ? Math.min(...volValues) * 0.9 : 0
    const volMax =
      volValues.length > 0 ? Math.max(...volValues) * 1.1 : 100

    const option = {
      backgroundColor: "transparent",
      grid: [
        { left: "0", right: "15%", top: "5%", bottom: "30%" },
        { left: "0", right: "15%", top: "65%", bottom: "8%" },
      ],
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0, 1],
          start,
          end: 100,
          minSpan: 10,
          maxSpan: 100,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          preventDefaultMouseMove: true,
        },
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          axis: "x",
          lineStyle: {
            color: "#FFAA00",
            type: "dashed",
            width: 1,
          },
        },
        formatter(params) {
          const lineData = params.find((p) => p.seriesIndex === 0)
          const barData = params.find((p) => p.seriesIndex === 1)
          const currentData = lineData || barData
          if (!currentData) return ""
          const list =
            currentData.seriesIndex === 0 ? valueList.value : volumeList.value
          let value = Math.max(0, currentData.value)
          const dataIndex = currentData.dataIndex
          let diff = 0
          let diffPercent = "0.00"
          if (dataIndex > 0) {
            const prevValue = list[dataIndex - 1]
            diff = value - prevValue
            diffPercent = prevValue
              ? ((diff / prevValue) * 100).toFixed(4)
              : "0.00"
          }
          return `
            <div style="background: rgba(0, 0, 0, 0.9); padding: 10px 15px; border-radius: 6px; border: 1px solid #555;">
              <div style="display: flex; justify-content: center; align-items: center;">
                <div style="color: #fff; font-size: 12px; margin-right: 5px;">${friendlyNumber(value)}</div>
                <div style="color: ${diff >= 0 ? "#00ff00" : "#ff0000"}; font-size: 12px;">
                  ${diff >= 0 ? "+" : ""}${friendlyNumber(diff)} ( ${diff >= 0 ? "+" : ""}${friendlyNumber(diffPercent)}%)
                </div>
              </div>
            </div>
          `
        },
        backgroundColor: "transparent",
        borderColor: "transparent",
        position(point, params, dom, rect, size) {
          let x = point[0] - 50
          let y = point[1] - 100
          if (rect && size?.contentSize) {
            const [tw, th] = size.contentSize
            const [cw, ch] = [rect.width, rect.height]
            x = point[0] - tw - 10
            if (x < 0) x = point[0] + 10
            if (x + tw > cw) x = cw - tw - 10
            y = point[1] - th - 10
            if (y < 0) y = point[1] + 10
            if (y + th > ch) y = ch - th - 10
          }
          return [x, y]
        },
      },
      xAxis: [
        {
          type: "category",
          data: dateList.value,
          gridIndex: 0,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
        {
          type: "category",
          data: dateList.value,
          gridIndex: 1,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            show: true,
            color: "#8C8C8C",
            fontSize: 12,
            y: 30,
          },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: "value",
          gridIndex: 0,
          position: "right",
          axisLine: { show: false },
          axisLabel: {
            color: "#8C8C8C",
            fontSize: 10,
            formatter: (val) => friendlyNumber(Math.max(0, val)),
          },
          splitLine: {
            show: true,
            lineStyle: { color: "rgba(255, 255, 255, 0.1)", type: "dashed" },
          },
          splitNumber: 4,
          axisTick: { show: false },
          min: yMin,
          max: yMax,
          interval: yInterval,
        },
        {
          type: "value",
          gridIndex: 1,
          axisLine: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
          axisTick: { show: false },
          min: volMin,
          max: volMax,
        },
      ],
      series: [
        {
          name: "price",
          type: "line",
          data: valueList.value,
          xAxisIndex: 0,
          yAxisIndex: 0,
          showSymbol: false,
          smooth: false,
          lineStyle: { color: "#FFAA00", width: 1 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(255, 170, 0, 0.4)" },
              { offset: 1, color: "rgba(255, 170, 0, 0.05)" },
            ]),
          },
        },
        {
          name: "volume",
          type: "bar",
          data: volumeList.value,
          xAxisIndex: 1,
          yAxisIndex: 1,
          barWidth: "60%",
          silent: true,
          emphasis: { disabled: true },
          select: { disabled: true },
          itemStyle: {
            color: (params) =>
              params.dataIndex > 0 &&
              valueList.value[params.dataIndex] >=
                valueList.value[params.dataIndex - 1]
                ? "rgba(30,181,118,0.6)"
                : "rgba(246,66,66,0.6)",
          },
        },
      ],
    }
    chartInstance.setOption(option, true)

    // 初始展示最新一段数据
    if (valueList.value.length > 0) {
      const len = valueList.value.length
      const start = Math.max(0, 100 - (Math.min(30, len) / len) * 100)
      chartInstance.dispatchAction({
        type: "dataZoom",
        start,
        end: 100,
      })
    }

    chartInstance.off("dataZoom")
    chartInstance.on("dataZoom", (params) => {
      if (!valueList.value?.length) return
      const length = valueList.value.length
      const startIndex = Math.max(
        0,
        Math.round((params.start / 100) * (length - 1))
      )
      const endIndex = Math.min(
        length - 1,
        Math.round((params.end / 100) * (length - 1))
      )
      if (startIndex > endIndex) return
      const visibleValues = valueList.value.slice(startIndex, endIndex + 1)
      if (!visibleValues.length) return
      const { min: finalMin, max: finalMax, interval: finalInterval } =
        calcYAxisRange(visibleValues)
      chartInstance.setOption({
        yAxis: [
          {
            gridIndex: 0,
            min: finalMin,
            max: finalMax,
            interval: finalMax - finalMin > 0 ? (finalMax - finalMin) / 4 : 25,
          },
        ],
      })
    })
  }, 0)
}

const handleResize = () => {
  chartInstance?.resize()
}

defineExpose({ initChart })

watch(
  () => props.symbolId,
  (id) => {
    if (id) getKlineData(activePeriod.value, id)
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener("resize", handleResize)
  nextTick(() => {
    if (chartRef.value) {
      visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && chartInstance) {
            chartInstance.resize()
            if (!valueList.value.length && props.symbolId) {
              getKlineData(activePeriod.value, props.symbolId)
            }
          }
        })
      })
      visibilityObserver.observe(chartRef.value)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener("resize", handleResize)
  visibilityObserver?.disconnect()
  visibilityObserver = null
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<template>
  <div class="option-chart">
    <div class="period-selector">
      <div
        v-for="p in periods"
        :key="p"
        :class="['period-btn', { active: activePeriod === p }]"
        @click="getKlineData(p)"
      >
        {{ p }}
      </div>
    </div>
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<style scoped lang="scss">
.option-chart {
  flex: 1;
  min-height: 320px;
  display: flex;
  flex-direction: column;

  .period-selector {
    display: flex;
    gap: 8px;
    padding: 8px 0;
    flex-wrap: wrap;

    .period-btn {
      padding: 4px 10px;
      font-size: 12px;
      color: #8b939a;
      border-radius: 4px;
      cursor: pointer;

      &.active {
        color: #fff;
        background: rgba(255, 170, 0, 0.3);
      }
    }
  }

  .chart {
    flex: 1;
    min-height: 260px;
  }
}
</style>
