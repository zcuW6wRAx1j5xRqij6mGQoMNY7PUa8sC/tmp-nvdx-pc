import { nextTick } from 'vue'
import { useECharts } from '@/hooks/useECharts'
import { getChartDataApi } from '@/api/data'

/**
 * 绘制曲线图函数，支持多个组件同时调用
 * @param list 要绘制的数据列表
 * @param symbol_type 交易类型（spot/futures）
 * @param hasSame 是否使用相同的setId
 */
export function serChartData(list, symbol_type = 'spot', hasSame = false) {
    // 深拷贝列表，避免修改原始数据
    const chartList = JSON.parse(JSON.stringify(list))
    
    nextTick(async () => {
        let ids = chartList.map(item => item.id)
        let bItems = {
            items: {},
            range: {},
        }
        if (ids.length === 0) {
            return
        }
        
        try {
            // 获取图表数据
            const data = await getChartDataApi({
                symbol_type,
                symbol_ids: ids,
            })
            bItems = data
            
            // 为每个图表项绘制曲线
            chartList.forEach(item => {
                // 准备图表参数（每次都创建新对象，避免共享状态）
                const params = {
                    grid: {
                        left: 0,
                        right: 10,
                        top: 5,
                        bottom: 5,
                    },
                    xAxis: {
                        type: 'time',
                        axisLine: { show: false },
                        axisTick: { show: false },
                        splitLine: { show: false },
                        axisLabel: { show: false },
                    },
                    yAxis: {
                        type: 'value',
                        axisLine: { show: false },
                        axisTick: { show: false },
                        splitLine: { show: false },
                        axisLabel: { show: false },
                    },
                }
                
                // 处理图表数据
                item.data = 
                    bItems?.items[item.symbol] &&
                    bItems.items[item.symbol].map(cel => {
                        return [+cel.t, +cel.p]
                    })
                item.params = bItems?.range[item.symbol] || {}
                
                // 获取DOM元素
                const chartElement = document.getElementById(`chart${hasSame ? item.setId : item.id}`)
                if (!chartElement) {
                    console.error(`Chart element not found: chart${hasSame ? item.setId : item.id}`)
                    return
                }
                
                // 初始化ECharts实例
                const setOptions = useECharts(chartElement)
                
                // 设置随机颜色
                const randomColor = '#F2BA3F'
                
                // 合并图表参数
                let echartParams = { ...params }
                echartParams.yAxis = {
                    ...echartParams.yAxis,
                    min: +item.params.min,
                    max: +item.params.max,
                }

                // 设置图表选项
                setOptions.setOptions({
                    ...echartParams,
                    series: [
                        {
                            data: item.data,
                            type: 'line',
                            smooth: true,
                            showSymbol: false,
                            color: randomColor,
                            areaStyle: {
                                color: {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [
                                        { offset: 0, color: '#F2BA3F' }, 
                                        { offset: 1, color: 'rgba(242, 186, 63, 0)' }
                                    ],
                                }
                            }
                        },
                    ],
                })
                
                // 更新原始列表中的数据（只更新必要的属性，避免状态污染）
                const originalItem = list.find(original => original.id === item.id)
                if (originalItem) {
                    originalItem.data = item.data
                    originalItem.params = item.params
                    originalItem.setOptions = setOptions
                }
            })
        } catch (error) {
            console.error('serChartData error:', error)
        }
    })
}
