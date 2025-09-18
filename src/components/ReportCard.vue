<template>
  <div class="bg-light-card dark:bg-dark-card p-4 rounded-2xl shadow-lg border border-light-border dark:border-dark-border flex items-center justify-between">
    <div class="flex items-center">
      <div :class="iconBgClass" class="p-3 rounded-lg mr-4">
        <component :is="iconComponent" :class="iconClass" />
      </div>
      <div>
        <h3 class="font-semibold">{{ title }}</h3>
        <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary">{{ description }}</p>
      </div>
    </div>
    <button class="text-sm font-semibold flex items-center bg-gray-100 dark:bg-slate-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-500">
      <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
      Générer
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  ChartBarIcon,
  DocumentTextIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

interface Props {
  title: string
  description: string
  icon: 'chart' | 'document' | 'pie' | 'dollar'
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const props = defineProps<Props>()

const iconComponent = computed(() => {
  switch (props.icon) {
    case 'chart': return ChartBarIcon
    case 'document': return DocumentTextIcon
    case 'pie': return ChartPieIcon
    case 'dollar': return CurrencyDollarIcon
    default: return ChartBarIcon
  }
})

const iconBgClass = computed(() => {
  switch (props.color) {
    case 'blue': return 'bg-blue-100 dark:bg-blue-900/50'
    case 'green': return 'bg-green-100 dark:bg-green-900/50'
    case 'purple': return 'bg-purple-100 dark:bg-purple-900/50'
    case 'orange': return 'bg-orange-100 dark:bg-orange-900/50'
    default: return 'bg-blue-100 dark:bg-blue-900/50'
  }
})

const iconClass = computed(() => {
  switch (props.color) {
    case 'blue': return 'w-6 h-6 text-blue-500'
    case 'green': return 'w-6 h-6 text-green-500'
    case 'purple': return 'w-6 h-6 text-purple-500'
    case 'orange': return 'w-6 h-6 text-orange-500'
    default: return 'w-6 h-6 text-blue-500'
  }
})
</script>