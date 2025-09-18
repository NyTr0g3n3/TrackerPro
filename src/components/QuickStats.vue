<template>
  <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-6 border border-light-border dark:border-dark-border">
    <h3 class="text-lg font-semibold mb-6 flex items-center">
      <ChartPieIcon class="w-5 h-5 mr-2 text-accent" />
      Statistiques Rapides
    </h3>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Total Assets -->
      <div class="text-center p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <div class="text-2xl font-bold text-accent">{{ totalAssets }}</div>
        <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">Actifs</div>
      </div>

      <!-- Total Platforms -->
      <div class="text-center p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <div class="text-2xl font-bold text-blue-500">{{ totalPlatforms }}</div>
        <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">Plateformes</div>
      </div>

      <!-- Total Transactions -->
      <div class="text-center p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <div class="text-2xl font-bold text-purple-500">{{ totalTransactions }}</div>
        <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">Transactions</div>
      </div>

      <!-- Average Position Size -->
      <div class="text-center p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <div class="text-2xl font-bold text-orange-500">{{ formatCurrency(avgPositionSize) }}</div>
        <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">Taille Moy.</div>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Meilleur Jour</span>
          <span class="text-sm text-positive dark:text-positive-dark font-semibold">
            {{ formatCurrency(bestDay) }}
          </span>
        </div>
      </div>

      <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Pire Jour</span>
          <span class="text-sm text-negative dark:text-negative-dark font-semibold">
            {{ formatCurrency(worstDay) }}
          </span>
        </div>
      </div>

      <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Volatilité</span>
          <span class="text-sm font-semibold">
            {{ volatility.toFixed(1) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="mt-6">
      <h4 class="font-semibold mb-3">Activité Récente</h4>
      <div class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span>Dernière transaction</span>
          <span class="text-light-text-secondary dark:text-dark-text-secondary">
            {{ lastTransactionDate }}
          </span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span>Nouvel actif ajouté</span>
          <span class="text-light-text-secondary dark:text-dark-text-secondary">
            {{ lastAssetAdded }}
          </span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span>Mise à jour des prix</span>
          <span class="text-light-text-secondary dark:text-dark-text-secondary">
            {{ lastPriceUpdate }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { formatCurrency } from '@/utils/formatters'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'

import { ChartPieIcon } from '@heroicons/vue/24/outline'

dayjs.extend(relativeTime)
dayjs.locale('fr')

const portfolioStore = usePortfolioStore()

const totalAssets = computed(() => Object.keys(portfolioStore.assets).length)
const totalPlatforms = computed(() => Object.keys(portfolioStore.platforms).length)
const totalTransactions = computed(() => portfolioStore.transactions.length)

const avgPositionSize = computed(() => {
  const positions = Object.values(portfolioStore.positions)
  if (positions.length === 0) return 0
  
  const totalValue = positions.reduce((sum, pos) => {
    const currentPrice = portfolioStore.prices[pos.assetId] || pos.avgCost
    return sum + (pos.quantity * currentPrice)
  }, 0)
  
  return totalValue / positions.length
})

// Simulate performance metrics (in a real app, you'd track daily values)
const bestDay = computed(() => {
  // Simulate best day as 5% of current portfolio value
  return portfolioStore.totalValue * 0.05
})

const worstDay = computed(() => {
  // Simulate worst day as -3% of current portfolio value
  return portfolioStore.totalValue * -0.03
})

const volatility = computed(() => {
  // Calculate volatility based on crypto exposure
  const cryptoValue = Object.values(portfolioStore.positions).reduce((sum, pos) => {
    const asset = portfolioStore.assets[pos.assetId]
    if (asset?.category === 'crypto') {
      const currentPrice = portfolioStore.prices[pos.assetId] || pos.avgCost
      return sum + (pos.quantity * currentPrice)
    }
    return sum
  }, 0)
  
  const cryptoPercentage = portfolioStore.totalValue > 0 ? (cryptoValue / portfolioStore.totalValue) * 100 : 0
  
  // Base volatility on crypto exposure (crypto is more volatile)
  return 5 + (cryptoPercentage * 0.3) // 5% base + up to 30% for full crypto portfolio
})

const lastTransactionDate = computed(() => {
  if (portfolioStore.transactions.length === 0) return 'Aucune'
  
  const lastTx = [...portfolioStore.transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  
  return dayjs(lastTx.timestamp).fromNow()
})

const lastAssetAdded = computed(() => {
  const assets = Object.values(portfolioStore.assets)
  if (assets.length === 0) return 'Aucun'
  
  // Since we don't track asset creation date, use the first transaction for each asset
  const assetFirstTx = new Map<string, string>()
  
  portfolioStore.transactions.forEach(tx => {
    if (!assetFirstTx.has(tx.assetId)) {
      assetFirstTx.set(tx.assetId, tx.timestamp)
    } else {
      const existing = assetFirstTx.get(tx.assetId)!
      if (new Date(tx.timestamp) < new Date(existing)) {
        assetFirstTx.set(tx.assetId, tx.timestamp)
      }
    }
  })
  
  if (assetFirstTx.size === 0) return 'Aucun'
  
  const latestAsset = Array.from(assetFirstTx.entries())
    .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())[0]
  
  return dayjs(latestAsset[1]).fromNow()
})

const lastPriceUpdate = computed(() => {
  // Simulate last price update (in a real app, you'd track this)
  return dayjs().subtract(Math.floor(Math.random() * 10), 'minutes').fromNow()
})
</script>