<template>
  <AppLayout>
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Rapports et analyses</h2>
        <select class="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent">
          <option>Year to Date</option>
          <option>Last 30 Days</option>
          <option>All Time</option>
        </select>
      </div>

      <!-- Report Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ReportCard
          title="Rapport de performance"
          description="Analyse détaillée avec rendements"
          icon="chart"
          color="blue"
        />
        
        <ReportCard
          title="Rapport fiscal"
          description="Rapport pour plus-values et dividendes"
          icon="document"
          color="green"
        />
        
        <ReportCard
          title="Allocation d'actifs"
          description="Répartition par catégorie et secteur"
          icon="pie"
          color="purple"
        />
        
        <ReportCard
          title="Historique des dividendes"
          description="Suivi et projections des dividendes"
          icon="dollar"
          color="orange"
        />
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SummaryCard title="Portfolio Summary">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Total Assets</span>
              <span>{{ Object.keys(portfolioStore.assets).length }}</span>
            </div>
            <div class="flex justify-between">
              <span>Total Transactions</span>
              <span>{{ portfolioStore.transactions.length }}</span>
            </div>
            <div class="flex justify-between">
              <span>Platforms</span>
              <span>{{ Object.keys(portfolioStore.platforms).length }}</span>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title="Performance Metrics">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Total Return</span>
              <span class="text-positive dark:text-positive-dark">
                {{ formatPercent(portfolioStore.totalValue > 0 ? (portfolioStore.totalPnL / portfolioStore.totalValue) * 100 : 0) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Best Performer</span>
              <span>{{ bestPerformer }}</span>
            </div>
            <div class="flex justify-between">
              <span>Volatility</span>
              <span>12.4%</span>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title="Tax Information">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Realized Gains</span>
              <span class="text-positive dark:text-positive-dark">
                {{ formatCurrency(2450, portfolioStore.settings.baseCurrency) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Dividends Received</span>
              <span>{{ formatCurrency(180.50, portfolioStore.settings.baseCurrency) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Tax Efficiency</span>
              <span>89%</span>
            </div>
          </div>
        </SummaryCard>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import ReportCard from '@/components/ReportCard.vue'
import SummaryCard from '@/components/SummaryCard.vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { formatCurrency, formatPercent } from '@/utils/formatters'

const portfolioStore = usePortfolioStore()

const bestPerformer = computed(() => {
  let maxPnlPercent = -Infinity
  let bestAsset = 'N/A'
  
  Object.values(portfolioStore.positions).forEach(pos => {
    const currentPrice = portfolioStore.prices[pos.assetId] || pos.avgCost
    const value = pos.quantity * currentPrice
    const pnlPercent = pos.totalCost > 0 ? ((value - pos.totalCost) / pos.totalCost) * 100 : 0
    
    if (pnlPercent > maxPnlPercent) {
      maxPnlPercent = pnlPercent
      const asset = portfolioStore.assets[pos.assetId]
      bestAsset = asset ? asset.symbol : 'N/A'
    }
  })
  
  return bestAsset
})
</script>