import { useWindowDimensions } from 'react-native';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent, DataZoomComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';

import SvgChart, { SVGRenderer } from '@wuba/react-native-echarts/svgChart';
import { Text, Box } from '@ms-mobile-ui/themed';
import { getChartColor } from '@/plugin/utils';
import { useBasicChartEntity } from '@/plugin/hooks/useBasicChartEntity';

// 注册 ECharts 组件
echarts.use([TooltipComponent, GridComponent, DataZoomComponent, SVGRenderer, BarChart]);

const E_HEIGHT = 300; // 图表高度

export interface ViewProps {
    config: {
        entity?: EntityOptionType[];
        title?: string;
        time: number;
    };
    configJson: {
        isPreview?: boolean;
    };
}

const View = (props: ViewProps) => {
    const { config, configJson } = props;
    const { entity, title, time } = config || {};
    const { isPreview } = configJson || {};

    const { chartShowData, chartLabels } = useBasicChartEntity({
        entity,
        time,
        isPreview,
    });
    const { width: windowWidth } = useWindowDimensions();

    const svgRef = useRef(null);

    useEffect(() => {
        let chart: echarts.ECharts | null = null;
        const resultColor = getChartColor(chartShowData);

        if (svgRef.current) {
            chart = echarts.init(svgRef.current, 'light', {
                renderer: 'svg',
                width: isPreview ? windowWidth - 32 : windowWidth - 16, // 适应屏幕宽度
                height: E_HEIGHT,
            });

            // 检查是否有数据
            const hasData = chartShowData.length > 0 && chartLabels.length > 0;

            // 配置图表选项
            const option = {
                // title: {
                //     text: title || 'Title',
                //     left: 'center',
                //     textStyle: {
                //         fontSize: 16,
                //         fontWeight: 'bold',
                //     },
                // },
                grid: {
                    top: 40,
                    bottom: 40,
                    left: 40,
                    right: 16,
                    backgroundColor: '#f9f9f9', // 背景色
                    borderColor: '#e8e8e8', // 边框颜色
                },
                xAxis: {
                    type: 'category',
                    data: hasData ? chartLabels : ['No Data'],
                    axisLine: {
                        lineStyle: { color: '#ccc' },
                    },
                    axisTick: { show: false },
                    axisLabel: {
                        color: '#666',
                    },
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        lineStyle: { color: '#ccc' },
                    },
                    axisTick: { show: false },
                    axisLabel: {
                        color: '#666',
                        formatter: function (value: string | number | bigint) {
                            // 使用 Intl.NumberFormat 格式化数值
                            return new Intl.NumberFormat('en-US', {
                                notation: 'compact',
                                compactDisplay: 'short',
                            }).format(Number(value));
                        },
                    },
                    splitLine: {
                        lineStyle: { color: '#e8e8e8' },
                    },
                },
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', // 背景色
                    borderColor: '#ccc', // 边框颜色
                    textStyle: {
                        color: '#333',
                    },
                },
                series: hasData
                    ? chartShowData.map((chart: any, index: number) => ({
                        name: chart.entityLabel,
                        data: chart.entityValues,
                        type: 'bar',
                        itemStyle: {
                            color: resultColor[index],
                        },
                        barWidth: '50%', // 柱状图宽度
                    }))
                    : [
                        {
                            name: 'No Data',
                            data: [0],
                            type: 'bar',
                            itemStyle: {
                                color: '#d3d3d3',
                            },
                            barWidth: '50%', // 柱状图宽度
                        },
                    ],
            };

            chart.setOption(option);
        }

        return () => {
            // 销毁图表实例
            chart?.dispose();
        };
    }, [chartShowData, chartLabels, title]);

    return (
        <Box
            borderRadius={12}
            backgroundColor='#fff'
            borderColor='$borderLight200'
            borderWidth={1}
            mx={isPreview ? '$4' : 0}
            mt={isPreview ? '$2' : 0}
        >
            <Text fontSize='$fs_24' lineHeight='$lh_32' mt='$4' ml='$4'>{title || 'Title'}</Text>
            <SvgChart
                ref={svgRef}
                useRNGH
            />
        </Box>
    );
};

export default React.memo(View);
