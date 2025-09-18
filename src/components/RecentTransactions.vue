<template>
  <div class="space-y-3">
    <div
      v-for="transaction in recentTransactions"
      :key="transaction.id"
      class="flex items-center justify-between p-2 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg"
    >
      <div>
        <p class="font-semibold">{{ getTransactionDescription(transaction) }}</p>
        <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {{ getRelativeTime(transaction.timestamp) }}
        </p>
      </div>
      <div class="text-right">
        <p class="font-semibold tabular-nums">{{ getTransactionValue(transaction) }}</p>
        <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary tabular-nums">
          {{ getTransactionAmount(transaction) }}
        </p>
      </div>
    </div>
    
    <p v-if="recentTransactions.length === 0" class="text-light-text-secondary dark:text-dark-text-secondary">
      Aucune transaction.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'

import { usePortfolioStore } from '@/stores/portfolioStore'
import { formatCurrency } from '@/utils/formatters'
import type { Transaction } from '@/types'

dayjs.extend(relativeTime)
dayjs.locale('fr')

const portfolioStore = usePortfolioStore()

const recentTransactions = computed(() => {
  return [...portfolioStore.transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
})

const getTransactionDescription = (tx: Transaction) => {
  const asset = portfolioStore.assets[tx.assetId]
  if (!asset) return tx.type
  
  switch (tx.type) {
    case 'BUY':
      return `Achat ${asset.symbol}`
    case 'SELL':
      return `Vente ${asset.symbol}`
    case 'DEPOSIT':
      return `Dépôt ${asset.symbol}`
    case 'WITHDRAW':
      return `Retrait ${asset.symbol}`
    default:
      return tx.type
  }
}

const getTransactionAmount = (tx: Transaction) => {
  const asset = portfolioStore.assets[tx.assetId]
  if (!asset) return ''
  
  switch (tx.type) {
    case 'SELL':
    case 'WITHDRAW':
      return `${tx.quantity.toFixed(4)} ${asset.symbol}`
    default:
      return `${tx.quantity.toFixed(4)} ${asset.symbol}`
  }
}

const getTransactionValue = (tx: Transaction) => {
  return formatCurrency(tx.quantity * tx.price, portfolioStore.settings.baseCurrency)
}

const getRelativeTime = (timestamp: string) => {
  return dayjs(timestamp).fromNow()
}
</script>