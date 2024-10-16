<template>
    <VChart
      :option="options"
      :autoresize="true"
      :loading-options="showLoading"
      style="width: 100%; height: 50px; min-height: initial"
      :theme="chartTheme"
    />
  </template>
  
  <script>
  import { use } from 'echarts/core';
  import { BarChart } from 'echarts/charts';
  import { SVGRenderer } from 'echarts/renderers';
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
  } from 'echarts/components';
  import VChart from 'vue-echarts';
  
  use([
    SVGRenderer,
    BarChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
  ]);
  
  export default {
    components: {
      VChart,
    },
    props: ['chartTheme', 'showLoading','options'],
    computed: {
      options() {
        return {
          tooltip: {
            show: true,
            trigger: 'item',
          },
          grid: {
            left: '0%',
            right: '0%',
            top: '0%',
            bottom: '0%',
            containLabel: true,
          },
          xAxis: {
            type: 'value',
            show: false,
            max: 555, 
          },
          yAxis: {
            type: 'category',
            data: [''],  
            show: false,
          },
          series: [
            {
              name: 'RESERVE',
              type: 'bar',
              stack: 'total', 
              data: [77],  
              itemStyle: { color: '#2E64FE' },  
              label: {
                show: true,
                position: 'inside',
                formatter: 'RESERVE (77M)',
                color: '#fff',
              },
              barWidth: '100%',
            },
            {
              name: 'BOND',
              type: 'bar',
              stack: 'total',  
              data: [100],  
              itemStyle: { color: '#FE2E2E' },  
              label: {
                show: true,
                position: 'inside',
                formatter: 'BOND (100M)',
                color: '#fff',
              },
              barWidth: '100%',
            },
            {
              name: 'PROG',
              type: 'bar',
              stack: 'total',  
              data: [25],  
              itemStyle: { color: '#31B404' },  
              label: {
                show: true,
                position: 'inside',
                formatter: 'PROG (25M)',
                color: '#fff',
                fontSize: 10,  
              },
              barWidth: '100%',
            },
            {
              name: 'CEX',
              type: 'bar',
              stack: 'total', 
              data: [80],  
              itemStyle: { color: '#F4FA58' },  
              label: {
                show: true,
                position: 'inside',
                formatter: 'CEX (80M)',
                color: '#fff',
              },
              barWidth: '100%',
            },
            {
              name: 'BURNT',
              type: 'bar',
              stack: 'total', 
              data: [73],  
              itemStyle: { color: '#DF0101' },  
              label: {
                show: true,
                position: 'inside',
                formatter: 'BURNT (73M)',
                color: '#fff',
              },
              barWidth: '100%',
            },
            {
              name: 'FREE',
              type: 'bar',
              stack: 'total',  
              data: [200], 
              itemStyle: { color: '#848484' }, 
              label: {
                show: true,
                position: 'inside',
                formatter: 'FREE (200M)',
                color: '#fff',
              },
              barWidth: '100%',
            },
          ],
        };
      },
    },
  };
  </script>
  
  <style scoped>
  </style>
  