<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

type ChartType = 'bar' | 'doughnut' | 'radar'

type Dataset = {
  label: string
  data: number[]
}

const props = defineProps<{
  type: ChartType
  title?: string
  labels: string[]
  datasets: Dataset[]
  height?: number
  showLegend?: boolean
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const h = computed(() => props.height ?? 280)
const legend = computed(() => props.showLegend ?? true)

// App-Style Farben (Grün + warme Neutrals)
const PALETTE = [
  'rgba(47, 93, 76, 0.85)',   // brand green
  'rgba(63, 109, 87, 0.85)',  // accent green
  'rgba(31, 42, 36, 0.75)',   // dark
  'rgba(217, 210, 199, 0.95)',// nav beige
  'rgba(239, 231, 218, 0.95)',// hero beige
  'rgba(58, 110, 165, 0.75)', // blue-ish (sparingly)
  'rgba(163, 58, 58, 0.70)',  // red-ish (sparingly)
]

function buildColors(count: number) {
  const out: string[] = []
  for (let i = 0; i < count; i++) out.push(PALETTE[i % PALETTE.length])
  return out
}

function destroy() {
  if (chart) {
    chart.destroy()
    chart = null
  }
}

function render() {
  if (!canvasEl.value) return
  destroy()

  const ctx = canvasEl.value.getContext('2d')
  if (!ctx) return

  const datasets = props.datasets.map((ds, idx) => {
    const base = PALETTE[idx % PALETTE.length]
    const border = base.replace(/0\.85|0\.95|0\.75|0\.70/g, '1.0')

    // doughnut braucht pro slice colors
    const isDoughnut = props.type === 'doughnut'
    const bg = isDoughnut ? buildColors(ds.data.length) : base

    return {
      label: ds.label,
      data: ds.data,
      backgroundColor: bg,
      borderColor: border,
      borderWidth: props.type === 'doughnut' ? 0 : 2,
      pointRadius: props.type === 'radar' ? 3 : 0,
      pointHoverRadius: props.type === 'radar' ? 5 : 0,
      tension: props.type === 'bar' ? 0.25 : 0,
    }
  })

  chart = new Chart(ctx, {
    type: props.type,
    data: {
      labels: props.labels,
      datasets: datasets as any,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      animation: {
        duration: 900,
        easing: 'easeOutQuart',
      },

      plugins: {
        legend: {
          display: legend.value,
          labels: {
            font: { weight: '700' },
            color: 'rgba(31, 42, 36, 0.78)',
            boxWidth: 14,
            boxHeight: 14,
          },
        },
        title: {
          display: !!props.title,
          text: props.title || '',
          color: 'rgba(31, 42, 36, 0.85)',
          font: { size: 12, weight: '800' },
          padding: { bottom: 10 },
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(255,255,255,0.95)',
          titleColor: 'rgba(31, 42, 36, 0.9)',
          bodyColor: 'rgba(31, 42, 36, 0.85)',
          borderColor: 'rgba(47, 93, 76, 0.25)',
          borderWidth: 1,
          titleFont: { weight: '800' },
          bodyFont: { weight: '700' },
        },
      },

      scales:
        props.type === 'doughnut'
          ? {}
          : {
            x: {
              grid: { display: false },
              ticks: { color: 'rgba(31, 42, 36, 0.72)', font: { weight: '700' } },
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.06)' },
              ticks: { color: 'rgba(31, 42, 36, 0.72)', font: { weight: '700' } },
            },
            r:
              props.type === 'radar'
                ? {
                  beginAtZero: true,
                  grid: { color: 'rgba(0,0,0,0.06)' },
                  angleLines: { color: 'rgba(0,0,0,0.06)' },
                  pointLabels: { color: 'rgba(31, 42, 36, 0.75)', font: { weight: '800' } },
                  ticks: { display: false },
                }
                : undefined,
          },
    } as any,
  })
}

watch(
  () => [props.type, props.title, props.labels, props.datasets],
  () => render(),
  { deep: true }
)

onMounted(render)
onBeforeUnmount(destroy)
</script>

<template>
  <div class="wrap" :style="{ height: `${h}px` }">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<style scoped>
.wrap {
  width: 100%;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(40, 40, 40, 0.08);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.05);
  padding: 12px;
}
</style>
