<template>
    <div class="chart-container">
        <div class="period-selector">
            <div v-for="period in periods" :key="period" :class="['period-btn', { active: activePeriod === period }]"
                @click="getKlineData(period)">
                <span>{{ period }}</span>
            </div>
        </div>
        <div ref="chartRef" class="chart"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts/core';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    VisualMapComponent
} from 'echarts/components';
import { LineChart, BarChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { friendlyNumber } from '@/utils/utils'
import dayjs from 'dayjs'
 
import { getKlineApi } from '@/api/data'

// 注册ECharts组件
echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    VisualMapComponent,
    LineChart,
    BarChart,
    CanvasRenderer,
    UniversalTransition
]);

// 图表容器引用
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// 周期选择器数据
const periods = ['5m', '15m', '30m', '1h', '1d', '1w', '1mo'];
const dayList = ['1d', '1w', '1mo'] 
const activePeriod = ref(periods[0]);


// 处理数据
const dateList = ref([]);
const valueList = ref([]);

// 生成成交量数据，调整数值大小以控制柱状图高度
const volumeList = ref([]);

const props = defineProps({
    symbolId: {
        type: Number,
        default: 0
    }
})

// 初始化图表
const initChart = () => {
    if (!chartRef.value || valueList.value.length === 0) return;
    
    // 确保DOM元素已挂载且可见
    if (!chartRef.value) return;
    
    // 使用setTimeout确保DOM元素已经完全渲染到视图中
    setTimeout(() => {
        if (chartRef.value) {
            // 初始化图表
            // 如果图表实例已存在，直接使用，避免重复初始化
            if (!chartInstance) {
                chartInstance = echarts.init(chartRef.value);
            } else {
                // 图表实例已存在，更新图表大小
                chartInstance.resize();
            }
            
            // 计算数据缩放的开始和结束百分比，默认显示最新数据
            const max = 1000
            const totalData = valueList.value.length;
            const defaultShowCount = Math.min(max, totalData);
            const start = totalData > defaultShowCount
                ? ((totalData - defaultShowCount) / totalData) * max
                : 0;
            const end = max;
            
            // 计算y轴的最小和最大值，确保右侧数据能完整显示
            const values = valueList.value;
            const min = Math.min(...values);
            const maxVal = Math.max(...values);
            
            // 确保右侧最大值能完整覆盖曲线图内的数据
            // 计算20%的增量，确保右侧有足够的空间显示所有数据点
            const maxIncrease = maxVal * 0.2;
            let range = (maxVal + maxIncrease) - min;
            
            // 扩大y轴范围，缩小波动效果
            // 使用更大的内边距，例如40%
            const padding = range * 0.4; // 40%的内边距，扩大范围，减小波动显示
            let yMin = min - padding;
            let yMax = maxVal + maxIncrease; // 将右侧最大值设置为最大值的20%，确保能完整显示所有数据点
            
            const option = {
                backgroundColor: '#0e0e0e',
                // 添加数据缩放配置
                dataZoom: [
                    {
                        type: 'inside',
                        xAxisIndex: [0, 1], // 应用到两个x轴
                        start: start,
                        end: end,
                        minSpan: 10, // 最小缩放范围10%
                        maxSpan: 100, // 最大缩放范围100%
                        zoomOnMouseWheel: true, // 鼠标滚轮缩放
                        moveOnMouseMove: true, // 鼠标移动平移
                        preventDefaultMouseMove: true
                    }
                ],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line',
                        axis: 'x', // 只显示垂直方向的虚线
                        lineStyle: {
                            color: '#FFAA00',
                            type: 'dashed',
                            width: 1
                        }
                    },
                    formatter: function (params: any) {
                        // 区分是柱状图还是曲线图
                        const lineData = params.find((p: any) => p.seriesIndex === 0); // 曲线图（seriesIndex: 0）
                        const barData = params.find((p: any) => p.seriesIndex === 1); // 柱状图（seriesIndex: 1）
                        const list = lineData ? valueList.value : volumeList.value;
                        const currentData = lineData || barData
                        // 只处理曲线图的数据
                        // if (lineData) {
                        let value = currentData.value;
                        // 确保当前值不会是负数
                        value = Math.max(0, value);
                        
                        // 获取当前数据点的索引
                        const dataIndex = currentData.dataIndex;
                        
                        // 计算与上一个数据的差值
                        let diff = 0;
                        let diffPercent = '0.00';
                        
                        if (dataIndex > 0) {
                            // 跟上一个数据对比
                            const prevValue = list[dataIndex - 1];
                            diff = value - prevValue;
                            diffPercent = ((diff / prevValue) * 100).toFixed(4);
                        }
                        
                        return `
                      <div style="background: rgba(0, 0, 0, 0.9); padding: 10px 15px; border-radius: 6px; border: 1px solid #555;scale:.7">
                        <div style="display: flex; justify-content: center; align-items: center;">
                          <div style="color: #fff; font-size: 12px;margin-right:5px">${friendlyNumber(value)}</div>
                          <div style="color: ${diff >= 0 ? '#00ff00' : '#ff0000'}; font-size: 12px;">
                          ${diff >= 0 ? '+' : ''}${friendlyNumber(diff)} ( ${diff >= 0 ? '+' : ''}${friendlyNumber(diffPercent)}%) 
                          </div>
                        </div> 
                      </div>
                    `;
                        // }
                        
                        return '';
                    },
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    // 调整tooltip的位置，让它更靠近数据点，并确保不超出边界
                    position: function(point: any, params: any, dom: any, rect: any, size: any) {
                        // 初始位置：向左上方偏移
                        let x = point[0] - 50;
                        let y = point[1] - 100;
                        
                        // 检查tooltip是否超出图表容器边界
                        // 只有当rect存在时才进行完整的边界检查
                        if (rect) {
                            // 计算tooltip的宽高
                            const tooltipWidth = size.contentSize[0];
                            const tooltipHeight = size.contentSize[1];
                            const chartWidth = rect.width;
                            const chartHeight = rect.height;
                            
                            // === 水平方向定位 ===
                            // 默认向左偏移
                            x = point[0] - tooltipWidth - 10;
                            
                            // 如果左侧空间不足，就向右偏移
                            if (x < 0) {
                                x = point[0] + 10;
                            }
                            
                            // 确保右侧不会超出边界
                            if (x + tooltipWidth > chartWidth) {
                                x = chartWidth - tooltipWidth - 10;
                            }
                            
                            // === 垂直方向定位 ===
                            // 默认向上偏移
                            y = point[1] - tooltipHeight - 10;
                            
                            // 如果顶部空间不足，就向下偏移
                            if (y < 0) {
                                y = point[1] + 10;
                            }
                            
                            // 确保底部不会超出边界
                            if (y + tooltipHeight > chartHeight) {
                                y = chartHeight - tooltipHeight - 10;
                            }
                        } else {
                            // 如果rect不存在，使用安全的位置计算
                            // 确保tooltip不会超出视口太多
                            const tooltipWidth = size.contentSize[0];
                            const tooltipHeight = size.contentSize[1];
                            
                            // 水平方向安全检查
                            if (x < 0) {
                                x = point[0] + 10;
                            } else if (x + tooltipWidth > window.innerWidth) {
                                x = point[0] - tooltipWidth - 10;
                            }
                            
                            // 垂直方向安全检查
                            if (y < 0) {
                                y = point[1] + 10;
                            } else if (y + tooltipHeight > window.innerHeight) {
                                y = point[1] - tooltipHeight - 10;
                            }
                        }
                        
                        return [x, y];
                    }
                },
                // 配置两个网格，一个用于折线图，一个用于柱状图
                grid: [
                    {
                        left: '0',
                        right: '15%',
                        top: '5%',
                        bottom: '30%'
                    },
                    {
                        left: '0',
                        right: '15%',
                        top: '65%',
                        bottom: '8%' // 增加bottom值，为时间标签留出足够空间
                    },
                ],
                // 配置两个x轴，分别对应两个网格
                xAxis: [
                    {
                        type: 'category',
                        data: dateList.value,
                        gridIndex: 0,
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        }
                    },
                    {
                        type: 'category',
                        data: dateList.value,
                        gridIndex: 1,
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            show: true,
                            color: '#8C8C8C',
                            fontSize: 12,
                            y: 30 // 调整标签位置，使其在柱状图下方
                        },
                        splitLine: {
                            show: false
                        }
                    }
                ],
                // 配置两个y轴，分别对应两个网格
                yAxis: [
                    {
                        type: 'value',
                        gridIndex: 0,
                        position: 'right',
                        axisLine: {
                            show: false
                        },
                        axisLabel: {
                            color: '#8C8C8C',
                            fontSize: 10,
                            formatter: function(value: number) {
                                // 确保显示的数值不会是负数，保留2位小数
                                return friendlyNumber(Math.max(0, value));
                            }
                        },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                type: 'dashed'
                            }
                        },
                        splitNumber: 4,
                        axisTick: {
                            show: false
                        },
                        // 应用计算出的y轴范围，放大波动效果
                        min: Math.max(0, yMin), // 确保y轴最小值不会小于0
                        max: yMax,
                        // 强制使用等间隔分割
                        interval: (yMax - Math.max(0, yMin)) / 4
                    },
                    {
                        type: 'value',
                        gridIndex: 1,
                        axisLine: {
                            show: false
                        },
                        axisLabel: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        // 放大柱状图的波动
                        min: Math.min(...volumeList.value) * 0.9,
                        max: Math.max(...volumeList.value) * 1.1
                    }
                ],
                series: [
                    {
                        type: 'line',
                        data: valueList.value,
                        xAxisIndex: 0,
                        yAxisIndex: 0,
                        showSymbol: false,
                        lineStyle: {
                            color: '#FFAA00',
                            width: 1
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgba(255, 170, 0, 0.4)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(255, 170, 0, 0.05)'
                                }
                            ])
                        },
                        smooth: false
                    },
                    {
                        type: 'bar',
                        data: volumeList.value,
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        itemStyle: {
                            color: '#444'
                        },
                        barWidth: '60%',
                        silent: true, // 禁用柱状图的交互功能
                        emphasis: {
                            disabled: true // 禁用高亮效果
                        },
                        select: {
                            disabled: true // 禁用选中效果
                        }
                    }
                ]
            };
            
            chartInstance.setOption(option);
            
            // 数据渲染完成后，自动滚动到最右侧，展示最新数据
            chartInstance.dispatchAction({
                type: 'dataZoom',
                start: 100 - (30 / valueList.value.length * 100),
                end: 100
            });
            
            // 移除之前的事件监听器，避免重复添加
            chartInstance.off('dataZoom');
            
            // 添加数据缩放事件监听，当左右滑动时重新计算y轴范围
            chartInstance.on('dataZoom', function(params: any) {
                if (!valueList.value || valueList.value.length === 0) return;
                
                // 获取当前显示的数据范围，确保索引在有效范围内
                const length = valueList.value.length;
                const startIndex = Math.max(0, Math.round(params.start / 100 * (length - 1)));
                const endIndex = Math.min(length - 1, Math.round(params.end / 100 * (length - 1)));
                
                // 提取当前显示的数据，确保有数据
                if (startIndex > endIndex) return;
                
                const visibleValues = valueList.value.slice(startIndex, endIndex + 1);
                
                // 确保有数据显示
                if (visibleValues.length === 0) return;
                
                // 计算当前显示数据的最小和最大值
                const min = Math.min(...visibleValues);
                const maxVal = Math.max(...visibleValues);
                
                // 确保右侧最大值能完整覆盖曲线图内的数据
                // 计算10%的增量，确保右侧有足够的空间显示数据
                const maxIncrease = maxVal * 0.1;
                let range = (maxVal + maxIncrease) - min;
                
                // 确保最右侧的差值最小为5
                if (range < 5) {
                    range = 5;
                }
                
                // 扩大y轴范围，缩小波动效果
                const padding = range * 0.4; // 40%的内边距，扩大范围，减小波动显示
                let yMin = min - padding;
                let yMax = maxVal + maxIncrease; // 将右侧最大值设置为最大值的10%，确保能完整显示数据
                
                // 确保最终差值最小为5
                let finalRange = yMax - yMin;
                if (finalRange < 5) {
                    const center = (min + maxVal) / 2;
                    const halfRange = 2.5;
                    yMin = center - halfRange;
                    yMax = center + halfRange;
                }
                
                // 更新y轴范围，确保最小值不小于0
                const finalMin = Math.max(0, yMin);
                const finalMax = yMax;
                chartInstance.setOption({
                    yAxis: [
                        {
                            gridIndex: 0,
                            min: finalMin, // 确保y轴最小值不会小于0
                            max: finalMax,
                            // 强制使用等间隔分割
                            interval: (finalMax - finalMin) / 4
                        }
                    ]
                });
            });
        }
    }, 0);
};

// 处理窗口大小变化
const handleResize = () => {
    chartInstance?.resize();
};

watch(() => props.symbolId, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        getKlineData(periods[0], +newVal);
    }
})

// 获取k线数据
const getKlineData = async (interval: string, id = +props.symbolId) => {
    activePeriod.value = interval;
    if (!id || id === Number.NAN) {
        return;
    }
    let isDay = dayList.includes(interval)
    const res = await getKlineApi({
        symbol_id: id,
        symbolId: id,
        interval,
        symbol_type: 'spot',
    });
    getChartData(res, isDay);
    initChart();
}

const getChartData = (list: any[], isDay: boolean) => {
    dateList.value = []
    valueList.value = []
    volumeList.value = []

    // 首先提取原始数据
    list.forEach(item => {
        dateList.value.push(dayjs(item.tl).format(isDay ? 'YYYY-MM-DD' : 'HH:00'));
        valueList.value.push(item.o);
        volumeList.value.push(item.v);
    })

}

defineExpose({
    initChart
})

// 组件挂载时初始化图表
onMounted(() => {
    window.addEventListener('resize', handleResize);
    
    // 组件挂载时加载初始数据，确保图表能正常渲染
    if (props.symbolId) {
        nextTick(() => {
            getKlineData(periods[0], +props.symbolId);
        });
    }
    
    // 监听组件可见性变化
    const checkVisibility = () => {
        if (chartRef.value) {
            const isVisible = chartRef.value.offsetParent !== null;
            if (isVisible && chartInstance) {
                // 当组件从隐藏变为可见时，重新渲染图表
                chartInstance.resize();
            }
        }
    };
    
    // 使用IntersectionObserver监听组件可见性变化
    if (chartRef.value) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && chartInstance) {
                    // 当组件进入视口时，重新渲染图表
                    chartInstance.resize();
                    // 如果图表还没有数据，重新加载数据
                    if (valueList.value.length === 0 && props.symbolId) {
                        getKlineData(periods[0], +props.symbolId);
                    }
                }
            });
        });
        
        observer.observe(chartRef.value);
        
        // 组件卸载时停止观察
        onUnmounted(() => {
            observer.disconnect();
        });
    }
});

// 组件卸载时销毁图表
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    chartInstance?.dispose();
    chartInstance = null;
});
</script>
<style scoped lang="scss">
.chart-container {
    width: 100%;
    background-color: #0e0e0e;
    box-sizing: border-box;

    .period-selector {
        display: flex;
        padding: 16px 16px 18px;
        gap: 5px;

        .period-btn {
            border-radius: 4px;
            box-sizing: border-box;
            width: 40px;
            height: 20px;
            font-size: 12px;
            line-height: 14px;
            padding-top: 2px;
            text-align: center;
            color: #8B939A;
            display: flex;
            align-items: center;
            justify-content: center;

            &.active {
                background-color: #1EB576;
                color: #fff;
            }
        }
    }

    .chart {
        width: calc(100% - 16px);
        height: 282px;
        overflow: hidden;
    }
}
</style>