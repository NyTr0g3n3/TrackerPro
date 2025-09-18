<template>
  <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-6 border border-light-border dark:border-dark-border">
    <h3 class="text-lg font-semibold mb-6 flex items-center">
      <ChartBarIcon class="w-5 h-5 mr-2 text-accent" />
      Insights du Portefeuille
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Diversification Score -->
      <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-semibold">Score de Diversification</h4>
          <span 
            :class="[
              'px-2 py-1 text-xs font-bold rounded-full',
              diversificationScore >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              diversificationScore >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            ]"
          >
            {{ diversificationScore }}/100
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div 
            class="h-2 rounded-full transition-all duration-500"
            :class="[
              diversificationScore >= 80 ? 'bg-green-500' :
              diversificationScore >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            ]"
            :style="{ width: `${diversificationScore}%` }"
          ></div>
        </div>
        <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {{ getDiversificationMessage() }}
        </p>
      </div>

      <!-- Risk Level -->
      <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-semibold">Niveau de Risque</h4>
          <span 
            :class="[
              'px-2 py-1 text-xs font-bold rounded-full',
              riskLevel === 'Faible' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              riskLevel === 'Modéré' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            ]"
          >
            {{ riskLevel }}
          </span>
        </div>
        <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {{ getRiskMessage() }}
        </p>
      </div>

      <!-- Top Performer -->
      <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <h4 class="font-semibold mb-2">Meilleur Performeur</h4>
        <div v-if="topPerformer" class="flex items-center">
          <img 
            :src="topPerformer.image" 
            class="w-8 h-8 mr-3 rounded-full"
            @error="handleImageError"
          />
          <div class="flex-1">
            <div class="font-semibold">{{ topPerformer.symbol.toUpperCase() }}</div>
            <div class="text-sm text-positive dark:text-positive-dark">
              +{{ topPerformer.pnlPercent.toFixed(2) }}%
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold text-positive dark:text-positive-dark">
              {{ formatCurrency(topPerformer.pnl) }}
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Aucune position profitable
        </div>
      </div>

      <!-- Worst Performer -->
      <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <h4 class="font-semibold mb-2">Moins Bon Performeur</h4>
        <div v-if="worstPerformer" class="flex items-center">
          <img 
            :src="worstPerformer.image" 
            class="w-8 h-8 mr-3 rounded-full"
            @error="handleImageError"
          />
          <div class="flex-1">
            <div class="font-semibold">{{ worstPerformer.symbol.toUpperCase() }}</div>
            <div class="text-sm text-negative dark:text-negative-dark">
              {{ worstPerformer.pnlPercent.toFixed(2) }}%
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold text-negative dark:text-negative-dark">
              {{ formatCurrency(worstPerformer.pnl) }}
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Aucune position en perte
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <h4 class="font-semibold mb-3 text-blue-800 dark:text-blue-400">💡 Recommandations</h4>
      <ul class="space-y-2 text-sm text-blue-700 dark:text-blue-300">
        <li v-for="recommendation in recommendations" :key="recommendation" class="flex items-start">
          <span class="mr-2">•</span>
          <span>{{ recommendation }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { formatCurrency } from '@/utils/formatters'
import { ChartBarIcon } from '@heroicons/vue/24/outline'

const portfolioStore = usePortfolioStore()

// Calculate diversification score
const diversificationScore = computed(() => {
  const positions = Object.values(portfolioStore.positions)
  if (positions.length === 0) return 0
  
  const totalValue = portfolioStore.totalValue
  if (totalValue === 0) return 0
  
  // Calculate Herfindahl-Hirschman Index (HHI) for concentration
  let hhi = 0
  positions.forEach(pos => {
    const currentPrice = portfolioStore.prices[pos.assetId] || pos.avgCost
    const value = pos.quantity * currentPrice
    const share = value / totalValue
    hhi += share * share
  })
  
  // Convert HHI to diversification score (0-100)
  const diversificationIndex = 1 - hhi
  return Math.round(diversificationIndex * 100)
})

// Calculate risk level
const riskLevel = computed(() => {
  const cryptoValue = Object.values(portfolioStore.positions).reduce((sum, pos) => {
    const asset = portfolioStore.assets[pos.assetId]
    if (asset?.category === 'crypto') {
      const currentPrice = portfolioStore.prices[pos.assetId] || pos.avgCost
      return sum + (pos.quantity * currentPrice)
    }
    return sum
  }, 0)
  
  const cryptoPercentage = portfolioStore.totalValue > 0 ? (cryptoValue / portfolioStore.totalValue) * 100 : 0
  
  if (cryptoPercentage > 70) return 'Élevé'
  if (cryptoPercentage > 30) return 'Modéré'
  return 'Faible'
})

// Get top and worst performers
const topPerformer = computed(() => {
  let maxPnlPercent = -Infinity
  let bestAsset = null
  
  Object.values(portfolioStore.positions).forEach(pos => {
    const asset = portfolioStore.assets[pos.assetId]
    if (!asset) return
    
    const currentPrice = portfolioStore.prices[pos.assetId] || pos.avgCost
    const value = pos.quantity * currentPrice
    const pnl = value - pos.totalCost
    const pnlPercent = pos.totalCost > 0 ? (pnl / pos.totalCost) * 100 : 0
    
    if (pnlPercent > maxPnlPercent) {
      maxPnlPercent = pnlPercent
      bestAsset = {
        ...asset,
        pnl,
        pnlPercent
      }
    }
  })
  
  return bestAsset && bestAsset.pnlPercent > 0 ? bestAsset : null
})

const worstPerformer = computed(() => {
  let minPnlPercent = Infinity
  let worstAsset = null
  
  Object.values(portfolioStore.positions).forEach(pos => {
    const asset = portfolioStore.assets[pos.assetId]
    if (!asset) return
    
    const currentPrice = portfolioStore.prices[pos.assetId] || pos.avgCost
    const value = pos.quantity * currentPrice
    const pnl = value - pos.totalCost
    const pnlPercent = pos.totalCost > 0 ? (pnl / pos.totalCost) * 100 : 0
    
    if (pnlPercent < minPnlPercent) {
      minPnlPercent = pnlPercent
      worstAsset = {
        ...asset,
        pnl,
        pnlPercent
      }
    }
  })
  
  return worstAsset && worstAsset.pnlPercent < 0 ? worstAsset : null
})

// Generate recommendations
const recommendations = computed(() => {
  const recs = []
  
  if (diversificationScore.value < 60) {
    recs.push('Considérez diversifier votre portefeuille avec plus d\'actifs différents')
  }
  
  if (riskLevel.value === 'Élevé') {
    recs.push('Votre exposition aux cryptomonnaies est élevée, pensez à équilibrer avec des actifs plus stables')
  }
  
  const liquidityRatio = Object.values(portfolioStore.liquidity).reduce((sum, acc) => sum + acc.balance, 0) / portfolioStore.totalValue
  if (liquidityRatio < 0.1) {
    recs.push('Maintenez au moins 10% de liquidités pour les opportunités et urgences')
  }
  
  if (Object.keys(portfolioStore.positions).length < 5) {
    recs.push('Un portefeuille avec au moins 5-10 actifs différents offre une meilleure diversification')
  }
  
  if (recs.length === 0) {
    recs.push('Votre portefeuille semble bien équilibré, continuez à surveiller les performances')
  }
  
  return recs
})

const getDiversificationMessage = () => {
  if (diversificationScore.value >= 80) return 'Excellente diversification'
  if (diversificationScore.value >= 60) return 'Bonne diversification'
  return 'Diversification à améliorer'
}

const getRiskMessage = () => {
  if (riskLevel.value === 'Faible') return 'Portefeuille conservateur avec peu de volatilité'
  if (riskLevel.value === 'Modéré') return 'Équilibre entre croissance et stabilité'
  return 'Forte exposition aux actifs volatils'
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48cGF0aCBkPSJNMTEgN2gzdjZoLTN6bTAgOGgydjJoLTJ6Ii8+PC9zdmc+'
}
</script>