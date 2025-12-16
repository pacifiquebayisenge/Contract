import { defineNuxtPlugin } from '#app'
import { BarChart, HeatmapChart, LineChart, ScatterChart } from 'echarts/charts'
import {
	GridComponent,
	LegendComponent,
	TooltipComponent,
	VisualMapComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VueECharts from 'vue-echarts'

use([
	CanvasRenderer,
	BarChart,
	LineChart,
	ScatterChart,
	HeatmapChart,
	GridComponent,
	TooltipComponent,
	LegendComponent,
	VisualMapComponent,
])

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.component('VChart', VueECharts)
})
