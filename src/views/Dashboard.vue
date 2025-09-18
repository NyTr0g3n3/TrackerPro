<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Summary Cards - Top Priority -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
          <h3 class="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            Valeur Totale
          </h3>
          <p class="text-3xl font-bold mt-1 tabular-nums">
            {{ formatCurrency(portfolioStore.totalValue, portfolioStore.settings.baseCurrency) }}
          </p>
        </div>
        
        <div class="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
          <h3 class="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            P&L (24h)
          </h3>
          <p 
            :class="[
              'text-3xl font-bold mt-1 tabular-nums',
              portfolioStore.totalPnL24h >= 0 
                ? 'text-positive dark:text-positive-dark' 
                : 'text-negative dark:text-negative-dark'
            ]"
          >
            {{ formatCurrency(portfolioStore.totalPnL24h, portfolioStore.settings.baseCurrency) }}
          </p>
        </div>
        
        <div class="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
          <h3 class="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            P&L Total (latent)
          </h3>
          <p 
            :class="[
              'text-3xl font-bold mt-1 tabular-nums',
              portfolioStore.totalPnL >= 0 
                ? 'text-positive dark:text-positive-dark' 
                : 'text-negative dark:text-negative-dark'
            ]"
          >
            {{ formatCurrency(portfolioStore.totalPnL, portfolioStore.settings.baseCurrency) }}
          </p>
        </div>
      </div>

      <!-- Main Content Row - Charts and Insights -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Assets Chart - Takes 2 columns on XL screens -->
        <div class="xl:col-span-2 bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
          <h3 class="text-lg font-semibold mb-4">Allocation par Actif</h3>
          <div class="h-80">
            <canvas ref="assetsChartCanvas"></canvas>
          </div>
        </div>

        <!-- Category Chart - Takes 1 column on XL screens -->
        <div class="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
          <h3 class="text-lg font-semibold mb-4">Répartition</h3>
          <div class="h-80">
            <canvas ref="categoryChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Secondary Content Row - Insights and Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Portfolio Insights -->
        <PortfolioInsights />
        
        <!-- Quick Stats -->
        <QuickStats />
      </div>

      <!-- Activity Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Transactions -->
        <div class="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
          <h3 class="text-lg font-semibold mb-4">Transactions Récentes</h3>
          <RecentTransactions />
        </div>

        <!-- Price Alerts -->
        <div class="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold flex items-center">
              <BellIcon class="w-5 h-5 mr-2 text-accent" />
              Alertes de Prix
            </h3>
            <button 
              @click="showCreateAlert = true"
              class="bg-accent hover:opacity-90 text-white font-bold py-1.5 px-3 rounded-lg flex items-center text-sm"
            >
              <PlusIcon class="w-4 h-4 mr-1" />
              Alerte
            </button>
          </div>
          
          <!-- Compact Alerts List -->
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div class="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary text-sm">
              <BellSlashIcon class="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Aucune alerte configurée</p>
              <button 
                @click="showCreateAlert = true"
                class="text-accent hover:underline text-xs mt-1"
              >
                Créer votre première alerte
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Cards - Quick Access -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link 
          to="/assets"
          class="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-lg border border-light-border dark:border-dark-border hover:shadow-xl transition-all duration-200 hover:scale-105 group"
        >
          <div class="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-3 group-hover:bg-accent/20 transition-colors">
            <BanknotesIcon class="w-6 h-6 text-accent" />
          </div>
          <h4 class="font-semibold text-sm">Gérer Actifs</h4>
          <p class="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
            {{ Object.keys(portfolioStore.assets).length }} actifs
          </p>
        </router-link>

        <router-link 
          to="/transactions"
          class="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-lg border border-light-border dark:border-dark-border hover:shadow-xl transition-all duration-200 hover:scale-105 group"
        >
          <div class="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mb-3 group-hover:bg-blue-500/20 transition-colors">
            <ArrowsRightLeftIcon class="w-6 h-6 text-blue-500" />
          </div>
          <h4 class="font-semibold text-sm">Transactions</h4>
          <p class="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
            {{ portfolioStore.transactions.length }} opérations
          </p>
        </router-link>

        <router-link 
          to="/reports"
          class="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-lg border border-light-border dark:border-dark-border hover:shadow-xl transition-all duration-200 hover:scale-105 group"
        >
          <div class="flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-lg mb-3 group-hover:bg-purple-500/20 transition-colors">
            <DocumentChartBarIcon class="w-6 h-6 text-purple-500" />
          </div>
          <h4 class="font-semibold text-sm">Rapports</h4>
          <p class="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Analyses détaillées
          </p>
        </router-link>

        <router-link 
          to="/analysis"
          class="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-lg border border-light-border dark:border-dark-border hover:shadow-xl transition-all duration-200 hover:scale-105 group"
        >
          <div class="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-3 group-hover:bg-green-500/20 transition-colors">
            <CpuChipIcon class="w-6 h-6 text-green-500" />
          </div>
          <h4 class="font-semibold text-sm">Analyse IA</h4>
          <p class="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Recommandations
          </p>
        </router-link>
      </div>
    </div>

    <!-- Create Alert Modal Placeholder -->
    <div v-if="showCreateAlert" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
        <div class="p-6">
          <h3 class="text-lg font-bold mb-4">Nouvelle Alerte de Prix</h3>
          <p class="text-light-text-secondary dark:text-dark-text-secondary mb-4">
            Fonctionnalité à venir - Vous pourrez configurer des alertes de prix pour vos actifs.
          </p>
          <div class="flex justify-end">
            <button 
              @click="showCreateAlert = false"
              class="bg-accent hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, type ChartConfiguration } from 'chart.js/auto'
import AppLayout from '@/components/AppLayout.vue'
import RecentTransactions from '@/components/RecentTransactions.vue'
import PortfolioInsights from '@/components/PortfolioInsights.vue'
import QuickStats from '@/components/QuickStats.vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { formatCurrency } from '@/utils/formatters'

import { 
  BellIcon,
  BellSlashIcon,
  PlusIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  DocumentChartBarIcon,
  CpuChipIcon
} from '@heroicons/vue/24/outline'

const portfolioStore = usePortfolioStore()

const assetsChartCanvas = ref<HTMLCanvasElement>()
const categoryChartCanvas = ref<HTMLCanvasElement>()
const showCreateAlert = ref(false)

let assetsChart: Chart | null = null
let categoryChart: Chart | null = null

const renderCharts = async () => {
  await nextTick()
  
  if (!assetsChartCanvas.value || !categoryChartCanvas.value) return

  // Prepare asset data
  const assetData = Object.values(portfolioStore.positions).map(pos => {
    const asset = portfolioStore.assets[pos.assetId]
    if (!asset) return { label: 'Inconnu', value: 0 }
    
    return {
      label: asset.symbol,
      value: pos.quantity * (portfolioStore.prices[pos.assetId] || pos.avgCost),
    }
  })

  // Add liquidity to asset data
  const liquidityValue = Object.values(portfolioStore.liquidity).reduce((sum, acc) => {
    if (acc.currency.toLowerCase() === portfolioStore.settings.baseCurrency.toLowerCase()) {
      return sum + acc.balance
    }
    return sum
  }, 0)
  
  if (liquidityValue > 0) {
    assetData.push({ label: 'Liquidités', value: liquidityValue })
  }

  // Prepare category data
  const categoryData = Object.values(portfolioStore.positions).reduce((acc, pos) => {
    const asset = portfolioStore.assets[pos.assetId]
    if (!asset) return acc
    
    const category = asset.category
    const value = pos.quantity * (portfolioStore.prices[pos.assetId] || pos.avgCost)
    acc[category] = (acc[category] || 0) + value
    return acc
  }, {} as Record<string, number>)
  
  if (liquidityValue > 0) {
    categoryData['liquidités'] = (categoryData['liquidités'] || 0) + liquidityValue
  }

  // Chart colors and styling
  const isDark = portfolioStore.settings.theme === 'dark'
  const chartColors = ['#14B8A6', '#22C55E', '#EF4444', '#64748B', '#94A3B8', '#E2E8F0']
  const borderColor = isDark ? '#334155' : '#FFFFFF'
  const textColor = isDark ? '#F1F5F9' : '#334155'

  // Destroy existing charts
  if (assetsChart) assetsChart.destroy()
  if (categoryChart) categoryChart.destroy()

  // Create assets chart
  const assetsConfig: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: assetData.map(d => d.label),
      datasets: [{
        data: assetData.map(d => d.value),
        backgroundColor: chartColors,
        borderColor,
        borderWidth: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            font: { family: 'Inter' }
          }
        }
      }
    }
  }

  assetsChart = new Chart(assetsChartCanvas.value, assetsConfig)

  // Create category chart
  const categoryConfig: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: Object.keys(categoryData),
      datasets: [{
        data: Object.values(categoryData),
        backgroundColor: chartColors,
        borderColor,
        borderWidth: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            font: { family: 'Inter' }
          }
        }
      }
    }
  }

  categoryChart = new Chart(categoryChartCanvas.value, categoryConfig)
}

onMounted(() => {
  renderCharts()
})

// Re-render charts when data changes
watch(() => [
  portfolioStore.positions,
  portfolioStore.prices,
  portfolioStore.liquidity,
  portfolioStore.settings.theme
], () => {
  renderCharts()
}, { deep: true })

onUnmounted(() => {
  if (assetsChart) assetsChart.destroy()
  if (categoryChart) categoryChart.destroy()
})
</script>