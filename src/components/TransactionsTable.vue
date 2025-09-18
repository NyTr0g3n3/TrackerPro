<template>
    <!-- Filters Panel -->
    <div v-if="showFilters" class="p-4 bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Category Filter -->
        <div>
          <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Filtrer par catégorie
          </label>
          <select 
            v-model="filters.category"
            class="w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Toutes les catégories</option>
            <option value="crypto">Cryptomonnaies</option>
            <option value="staking">Staking</option>
            <option value="action">Actions</option>
            <option value="obligation">Obligations</option>
            <option value="epargne">Épargne</option>
            <option value="dividendes">Dividendes</option>
            <option value="interets">Intérêts</option>
          </select>
        </div>

        <!-- Type Filter -->
        <div>
          <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Filtrer par type
          </label>
          <select 
            v-model="filters.type"
            class="w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Tous les types</option>
            <option value="BUY">Achat</option>
            <option value="SELL">Vente</option>
            <option value="DEPOSIT">Dépôt</option>
            <option value="WITHDRAW">Retrait</option>
            <option value="TRANSFER">Transfert</option>
            <option value="SWAP">Échange</option>
          </select>
        </div>
      </div>

      <!-- Active Filters -->
      <div v-if="activeFilters.length > 0" class="flex flex-wrap gap-2 mb-4">
        <span class="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Filtres actifs:</span>
        <span
          v-for="filter in activeFilters"
          :key="`${filter.type}-${filter.value}`"
          class="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full"
        >
          {{ filter.label }}
          <button 
            @click="removeFilter(filter.type)"
            class="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
          >
            <XMarkIcon class="w-3 h-3" />
          </button>
        </span>
        <button 
          @click="clearAllFilters"
          class="text-xs text-red-500 hover:text-red-700 font-medium"
        >
          Effacer tout
        </button>
      </div>

      <!-- Results Count -->
      <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
        {{ filteredTransactions.length }} transaction{{ filteredTransactions.length > 1 ? 's' : '' }} trouvée{{ filteredTransactions.length > 1 ? 's' : '' }}
      </div>
    </div>

  <div class="overflow-x-auto">
    <table class="w-full text-left">
      <thead class="bg-light-bg dark:bg-dark-bg">
        <tr>
          <th class="p-4 font-semibold text-light-text-secondary dark:text-dark-text-secondary">Date</th>
          <th class="p-4 font-semibold text-light-text-secondary dark:text-dark-text-secondary">Type</th>
          <th class="p-4 font-semibold text-light-text-secondary dark:text-dark-text-secondary">Description</th>
          <th class="p-4 font-semibold text-right text-light-text-secondary dark:text-dark-text-secondary">Montant</th>
          <th class="p-4 font-semibold text-right text-light-text-secondary dark:text-dark-text-secondary">Valeur</th>
          <th class="p-4 font-semibold text-right text-light-text-secondary dark:text-dark-text-secondary">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="transaction in sortedTransactions"
          :key="transaction.id"
          class="border-b border-light-border dark:border-dark-border"
        >
          <td class="p-4">{{ formatDate(transaction.timestamp) }}</td>
          <td class="p-4">
            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary">
              {{ transaction.type }}
            </span>
          </td>
          <td class="p-4">{{ getTransactionDescription(transaction) }}</td>
          <td class="p-4 text-right tabular-nums">{{ getTransactionAmount(transaction) }}</td>
          <td class="p-4 text-right tabular-nums">{{ getTransactionValue(transaction) }}</td>
          <td class="p-4 text-right">
            <button 
              @click="editTransaction(transaction)"
              class="p-1 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600" 
              title="Modifier Transaction"
            >
              <PencilIcon class="w-5 h-5 text-gray-500 hover:text-accent transition-colors" />
            </button>
            <button 
              @click="deleteTransaction(transaction.id)"
              class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600" 
              title="Supprimer Transaction"
            >
              <TrashIcon class="w-5 h-5 text-gray-500 hover:text-negative transition-colors" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="sortedTransactions.length === 0" class="text-center p-8 text-light-text-secondary dark:text-dark-text-secondary">
      Aucune transaction.
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-light-text-main dark:text-dark-text-main flex items-center">
            <svg class="w-6 h-6 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Confirmer la suppression
          </h2>
          <button 
            @click="showDeleteModal = false"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="deleteModalData" class="space-y-4">
          <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p class="text-sm text-orange-800 dark:text-orange-200 mb-2">
              <strong>Cette action est irréversible</strong>
            </p>
            <p class="text-sm text-orange-700 dark:text-orange-300">
              Êtes-vous sûr de vouloir supprimer cette <strong>{{ deleteModalData.name }}</strong> ?
            </p>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-200 dark:bg-slate-600 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 font-medium"
            >
              Annuler
            </button>
            <button 
              @click="confirmDelete"
              class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Transaction Modal -->
  <TransactionModal 
    v-if="showEditTransactionModal && editingTransaction"
    :transaction="editingTransaction"
    @close="showEditTransactionModal = false"
    @submitted="onTransactionUpdated"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/formatters'
import type { Transaction } from '@/types'
import TransactionModal from './TransactionModal.vue'

// Icons
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

// Emit events to parent
const emit = defineEmits<{
  'toggle-filters': []
}>()

const portfolioStore = usePortfolioStore()
const { showToast } = useToast()

// Filter state
const showFilters = ref(false)
const filters = ref({
  category: '',
  type: ''
})

const showDeleteModal = ref(false)
const deleteModalData = ref<{ type: 'transaction', id: string, name: string } | null>(null)
const showEditTransactionModal = ref(false)
const editingTransaction = ref<Transaction | null>(null)

// Filter transactions based on active filters
const filteredTransactions = computed(() => {
  let transactions = [...portfolioStore.transactions]
  
  // Filter by category
  if (filters.value.category) {
    transactions = transactions.filter(tx => {
      const asset = portfolioStore.assets[tx.assetId]
      if (!asset) return false
      
      switch (filters.value.category) {
        case 'crypto':
          return asset.category === 'crypto' && !asset.name.toLowerCase().includes('staking')
        case 'staking':
          return asset.category === 'crypto' && asset.name.toLowerCase().includes('staking')
        case 'action':
          return asset.category === 'action'
        case 'obligation':
          return asset.category === 'obligation'
        case 'epargne':
          return asset.category === 'epargne'
        case 'dividendes':
          return tx.type === 'DEPOSIT' && asset.category === 'action'
        case 'interets':
          return tx.type === 'DEPOSIT' && (asset.category === 'epargne' || asset.category === 'obligation')
        default:
          return true
      }
    })
  }
  
  // Filter by type
  if (filters.value.type) {
    transactions = transactions.filter(tx => {
      switch (filters.value.type) {
        case 'BUY':
          return tx.type === 'BUY'
        case 'SELL':
          return tx.type === 'SELL'
        case 'DEPOSIT':
          return tx.type === 'DEPOSIT'
        case 'WITHDRAW':
          return tx.type === 'WITHDRAW'
        case 'TRANSFER':
          return tx.type === 'TRANSFER'
        case 'SWAP':
          return tx.type === 'SWAP'
        default:
          return true
      }
    })
  }
  
  return transactions
})

const sortedTransactions = computed(() => {
  return filteredTransactions.value.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
})

// Active filters for display
const activeFilters = computed(() => {
  const active = []
  if (filters.value.category) {
    active.push({
      type: 'category',
      value: filters.value.category,
      label: getCategoryLabel(filters.value.category)
    })
  }
  if (filters.value.type) {
    active.push({
      type: 'type',
      value: filters.value.type,
      label: getTypeLabel(filters.value.type)
    })
  }
  return active
})

const formatDate = (timestamp: string) => {
  return dayjs(timestamp).format('DD/MM/YYYY HH:mm')
}

const getTransactionDescription = (tx: Transaction) => {
  const asset = portfolioStore.assets[tx.assetId]
  const platform = portfolioStore.platforms[tx.platformId]
  
  if (!asset || !platform) return tx.type
  
  switch (tx.type) {
    case 'BUY':
      return `Achat ${asset.symbol} sur ${platform.name}`
    case 'SELL':
      return `Vente ${asset.symbol} sur ${platform.name}`
    case 'DEPOSIT':
      return `Dépôt de ${tx.assetId.toUpperCase()} sur ${platform.name}`
    case 'WITHDRAW':
      return `Retrait de ${tx.assetId.toUpperCase()} de ${platform.name}`
    default:
      return tx.type
  }
}

const getTransactionAmount = (tx: Transaction) => {
  switch (tx.type) {
    case 'SELL':
    case 'WITHDRAW':
      return `-${tx.quantity.toFixed(4)}`
    default:
      return `${tx.quantity.toFixed(4)}`
  }
}

const getTransactionValue = (tx: Transaction) => {
  return formatCurrency(tx.quantity * tx.price, portfolioStore.settings.baseCurrency)
}

const editTransaction = (transaction: Transaction) => {
  editingTransaction.value = transaction
  showEditTransactionModal.value = true
}

const deleteTransaction = async (txId: string) => {
  const tx = portfolioStore.transactions.find(t => t.id === txId)
  if (!tx) return
  
  deleteModalData.value = {
    type: 'transaction',
    id: txId,
    name: `Transaction du ${formatDate(tx.timestamp)}`
  }
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deleteModalData.value) return
  
  await portfolioStore.deleteTransaction(deleteModalData.value.id)
  showToast('Transaction supprimée avec succès!')
  
  showDeleteModal.value = false
  deleteModalData.value = null
}

const onTransactionUpdated = () => {
  showEditTransactionModal.value = false
  editingTransaction.value = null
  showToast('Transaction modifiée avec succès!')
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    crypto: 'Cryptomonnaies',
    staking: 'Staking',
    action: 'Actions',
    obligation: 'Obligations',
    epargne: 'Épargne',
    dividendes: 'Dividendes',
    interets: 'Intérêts'
  }
  return labels[category] || category
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    BUY: 'Achat',
    SELL: 'Vente',
    DEPOSIT: 'Dépôt',
    WITHDRAW: 'Retrait',
    TRANSFER: 'Transfert',
    SWAP: 'Échange'
  }
  return labels[type] || type
}

const removeFilter = (filterType: string) => {
  if (filterType === 'category') {
    filters.value.category = ''
  } else if (filterType === 'type') {
    filters.value.type = ''
  }
}

const clearAllFilters = () => {
  filters.value.category = ''
  filters.value.type = ''
}

// Expose methods and computed properties to parent
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const hasActiveFilters = computed(() => {
  return filters.value.category !== '' || filters.value.type !== ''
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.category) count++
  if (filters.value.type) count++
  return count
})

// Expose to parent component
defineExpose({
  toggleFilters,
  hasActiveFilters,
  activeFiltersCount
})
</script>