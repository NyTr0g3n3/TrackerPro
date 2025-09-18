<template>
  <div class="p-4 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border">
    <div class="relative flex-1 max-w-full">
      <SearchIcon class="w-5 h-5 text-light-text-secondary absolute top-1/2 left-3 -translate-y-1/2" />
      <input 
        v-model="searchQuery"
        @input="handleSearch"
        @focus="showResults = true"
        type="search" 
        placeholder="Rechercher un actif, une transaction, une plateforme..."
        class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent"
      >
      
      <!-- Search Results Dropdown -->
      <div 
        v-if="showResults && searchQuery.length > 0"
        class="absolute z-50 w-full mt-1 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-xl max-h-96 overflow-y-auto"
      >
        <!-- Assets Results -->
        <div v-if="assetResults.length > 0" class="p-2">
          <h4 class="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2 px-2">ACTIFS</h4>
          <div
            v-for="asset in assetResults.slice(0, 5)"
            :key="asset.id"
            @click="navigateToAsset(asset.id)"
            class="flex items-center p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg cursor-pointer"
          >
            <img :src="asset.image" class="w-8 h-8 mr-3 rounded-full" :alt="asset.name" />
            <div class="flex-1">
              <div class="font-semibold">{{ asset.symbol.toUpperCase() }}</div>
              <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">{{ asset.name }}</div>
            </div>
            <div class="text-right">
              <div class="font-semibold tabular-nums">{{ formatCurrency(getAssetValue(asset.id)) }}</div>
              <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {{ getAssetQuantity(asset.id).toFixed(4) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Transactions Results -->
        <div v-if="transactionResults.length > 0" class="p-2 border-t border-light-border dark:border-dark-border">
          <h4 class="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2 px-2">TRANSACTIONS</h4>
          <div
            v-for="tx in transactionResults.slice(0, 3)"
            :key="tx.id"
            @click="navigateToTransaction(tx.id)"
            class="flex items-center p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg cursor-pointer"
          >
            <div class="w-8 h-8 mr-3 rounded-full bg-accent/20 flex items-center justify-center">
              <span class="text-xs font-bold text-accent">{{ tx.type.slice(0, 2) }}</span>
            </div>
            <div class="flex-1">
              <div class="font-semibold">{{ getTransactionDescription(tx) }}</div>
              <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {{ formatDate(tx.timestamp) }}
              </div>
            </div>
            <div class="text-right tabular-nums">
              {{ formatCurrency(tx.quantity * tx.price) }}
            </div>
          </div>
        </div>

        <!-- Platforms Results -->
        <div v-if="platformResults.length > 0" class="p-2 border-t border-light-border dark:border-dark-border">
          <h4 class="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2 px-2">PLATEFORMES</h4>
          <div
            v-for="platform in platformResults.slice(0, 3)"
            :key="platform.id"
            @click="navigateToPlatform(platform.id)"
            class="flex items-center p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg cursor-pointer"
          >
            <div class="w-8 h-8 mr-3 rounded-full bg-blue-500/20 flex items-center justify-center">
              <BuildingLibraryIcon class="w-4 h-4 text-blue-500" />
            </div>
            <div class="flex-1">
              <div class="font-semibold">{{ platform.name }}</div>
              <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary capitalize">{{ platform.type }}</div>
            </div>
            <div class="text-right tabular-nums">
              {{ formatCurrency(getPlatformValue(platform.id)) }}
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="assetResults.length === 0 && transactionResults.length === 0 && platformResults.length === 0" class="p-4 text-center text-light-text-secondary dark:text-dark-text-secondary">
          Aucun résultat trouvé
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { formatCurrency } from '@/utils/formatters'
import dayjs from 'dayjs'
import type { Transaction } from '@/types'

import { MagnifyingGlassIcon as SearchIcon, BuildingLibraryIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const portfolioStore = usePortfolioStore()

const searchQuery = ref('')
const showResults = ref(false)

// Search results
const assetResults = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return []
  
  const query = searchQuery.value.toLowerCase()
  return Object.values(portfolioStore.assets).filter(asset =>
    asset.name.toLowerCase().includes(query) || 
    asset.symbol.toLowerCase().includes(query)
  )
})

const transactionResults = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return []
  
  const query = searchQuery.value.toLowerCase()
  return portfolioStore.transactions.filter(tx => {
    const asset = portfolioStore.assets[tx.assetId]
    const platform = portfolioStore.platforms[tx.platformId]
    return asset?.name.toLowerCase().includes(query) ||
           asset?.symbol.toLowerCase().includes(query) ||
           platform?.name.toLowerCase().includes(query) ||
           tx.type.toLowerCase().includes(query)
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

const platformResults = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return []
  
  const query = searchQuery.value.toLowerCase()
  return Object.values(portfolioStore.platforms).filter(platform =>
    platform.name.toLowerCase().includes(query) ||
    platform.type.toLowerCase().includes(query)
  )
})

// Helper functions
const getAssetValue = (assetId: string) => {
  const positions = Object.values(portfolioStore.positions).filter(p => p.assetId === assetId)
  return positions.reduce((sum, pos) => {
    const currentPrice = portfolioStore.prices[pos.assetId] || pos.avgCost
    return sum + (pos.quantity * currentPrice)
  }, 0)
}

const getAssetQuantity = (assetId: string) => {
  const positions = Object.values(portfolioStore.positions).filter(p => p.assetId === assetId)
  return positions.reduce((sum, pos) => sum + pos.quantity, 0)
}

const getPlatformValue = (platformId: string) => {
  const positions = Object.values(portfolioStore.positions).filter(p => p.platformId === platformId)
  const liquidity = Object.values(portfolioStore.liquidity).filter(l => l.platformId === platformId)
  
  let total = 0
  positions.forEach(pos => {
    const currentPrice = portfolioStore.prices[pos.assetId] || pos.avgCost
    total += pos.quantity * currentPrice
  })
  
  liquidity.forEach(acc => {
    if (acc.currency.toLowerCase() === portfolioStore.settings.baseCurrency.toLowerCase()) {
      total += acc.balance
    }
  })
  
  return total
}

const getTransactionDescription = (tx: Transaction) => {
  const asset = portfolioStore.assets[tx.assetId]
  const platform = portfolioStore.platforms[tx.platformId]
  
  if (!asset || !platform) return tx.type
  
  switch (tx.type) {
    case 'BUY': return `Achat ${asset.symbol} sur ${platform.name}`
    case 'SELL': return `Vente ${asset.symbol} sur ${platform.name}`
    case 'DEPOSIT': return `Dépôt ${asset.symbol} sur ${platform.name}`
    case 'WITHDRAW': return `Retrait ${asset.symbol} de ${platform.name}`
    default: return tx.type
  }
}

const formatDate = (timestamp: string) => {
  return dayjs(timestamp).format('DD/MM/YYYY')
}

// Navigation functions
const navigateToAsset = (assetId: string) => {
  router.push('/assets')
  showResults.value = false
  searchQuery.value = ''
}

const navigateToTransaction = (txId: string) => {
  router.push('/transactions')
  showResults.value = false
  searchQuery.value = ''
}

const navigateToPlatform = (platformId: string) => {
  router.push('/assets')
  showResults.value = false
  searchQuery.value = ''
}

const handleSearch = () => {
  // Search is reactive through computed properties
}

// Close results when clicking outside
const handleOutsideClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showResults.value = false
  }
}

import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>