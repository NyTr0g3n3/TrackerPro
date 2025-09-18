<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-40" @click="$emit('close')"></div>
  <div class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg border border-light-border dark:border-dark-border transform transition-all">
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ transaction ? 'Modifier la Transaction' : 'Nouvelle Transaction' }}
        </h2>

        <!-- Transaction Type -->
        <div>
          <label for="tx-type" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            Type
          </label>
          <select 
            id="tx-type" 
            v-model="form.type"
            @change="updateFormFields"
            required 
            class="mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent"
          >
            <option value="BUY">Achat (Buy)</option>
            <option value="SELL">Vente (Sell)</option>
            <option value="DEPOSIT">Dépôt (Transfert In)</option>
            <option value="WITHDRAW">Retrait (Transfert Out)</option>
          </select>
        </div>

        <!-- Date -->
        <div>
          <label for="tx-date" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            Date de la transaction (optionnel)
          </label>
          <input 
            type="datetime-local" 
            id="tx-date" 
            v-model="form.timestamp"
            class="mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent"
          >
        </div>

        <!-- Asset Search -->
        <div class="relative">
          <label for="asset-search" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            Actif
          </label>
          <input 
            type="text" 
            id="asset-search"
            v-model="assetSearchQuery"
            @input="searchAssets"
            autocomplete="off"
            placeholder="Rechercher (ex: BTC, Bitcoin...)"
            required
            class="mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent"
          >
          
          <!-- Search Results -->
          <div 
            v-if="searchResults.length > 0 && showSearchResults"
            class="absolute z-10 w-full mt-1 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-md shadow-lg max-h-48 overflow-y-auto"
          >
            <div
              v-for="crypto in searchResults"
              :key="crypto.id"
              @click="selectAsset(crypto)"
              class="p-2 hover:bg-accent hover:text-white cursor-pointer flex items-center"
            >
              <img :src="crypto.image" class="w-6 h-6 mr-3 rounded-full" :alt="crypto.name" />
              {{ crypto.name }} ({{ crypto.symbol.toUpperCase() }})
            </div>
          </div>
        </div>

        <!-- Platform -->
        <div>
          <label for="platform" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            Plateforme
          </label>
          <input 
            list="platform-list" 
            id="platform"
            v-model="form.platformName"
            placeholder="Choisir ou créer une plateforme"
            required
            class="mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent"
          >
          <datalist id="platform-list">
            <option v-for="platform in platforms" :key="platform.id" :value="platform.name" />
          </datalist>
        </div>

        <!-- Quantity and Price -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="quantity" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Quantité
            </label>
            <input 
              type="number" 
              id="quantity"
              v-model.number="form.quantity"
              step="any"
              required
              class="mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3"
            >
          </div>
          
          <div v-if="form.type !== 'WITHDRAW'">
            <label for="price" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Prix par unité ({{ portfolioStore.settings.baseCurrency }})
            </label>
            <input 
              type="number" 
              id="price"
              v-model.number="form.price"
              step="any"
              required
              class="mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3"
            >
          </div>
        </div>

        <!-- Fee (for BUY/SELL) -->
        <div v-if="['BUY', 'SELL'].includes(form.type)">
          <label for="fee" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            Frais ({{ portfolioStore.settings.baseCurrency }})
          </label>
          <input 
            type="number" 
            id="fee"
            v-model.number="form.fee"
            step="any"
            class="mt-1 block w-full bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3"
          >
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-light-border dark:border-dark-border">
          <button 
            type="button" 
            @click="$emit('close')"
            class="bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 font-bold py-2 px-4 rounded-lg"
          >
            Annuler
          </button>
          <button 
            type="submit"
            :disabled="!isFormValid"
            class="bg-accent hover:opacity-90 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { searchCrypto, fetchCoinGeckoList } from '@/services/coinGecko'
import type { Transaction, CryptoSearchResult } from '@/types'

interface Props {
  transaction?: Transaction
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  submitted: []
}>()

const portfolioStore = usePortfolioStore()

// Form state
const form = reactive({
  type: 'BUY' as Transaction['type'],
  assetId: '',
  platformName: '',
  quantity: 0,
  price: 0,
  fee: 0,
  timestamp: ''
})

// Asset search
const assetSearchQuery = ref('')
const searchResults = ref<CryptoSearchResult[]>([])
const showSearchResults = ref(false)
const selectedAsset = ref<CryptoSearchResult | null>(null)

// Platform list
const platforms = computed(() => Object.values(portfolioStore.platforms))

// Form validation
const isFormValid = computed(() => {
  return form.assetId && 
         form.platformName && 
         form.quantity > 0 && 
         (form.type === 'WITHDRAW' || form.price > 0)
})

// Initialize form if editing
onMounted(async () => {
  await fetchCoinGeckoList()
  
  if (props.transaction) {
    const tx = props.transaction
    form.type = tx.type
    form.assetId = tx.assetId
    form.quantity = tx.quantity
    form.price = tx.price
    form.fee = tx.fee || 0
    
    // Set platform name
    const platform = portfolioStore.platforms[tx.platformId]
    if (platform) {
      form.platformName = platform.name
    }
    
    // Set asset search display
    const asset = portfolioStore.assets[tx.assetId]
    if (asset) {
      assetSearchQuery.value = `${asset.name} (${asset.symbol.toUpperCase()})`
      selectedAsset.value = {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        image: asset.image
      }
    }
    
    // Set timestamp if exists
    if (tx.timestamp) {
      const date = new Date(tx.timestamp)
      form.timestamp = date.toISOString().slice(0, 16)
    }
  }
})

// Methods
const updateFormFields = () => {
  if (form.type === 'WITHDRAW') {
    form.price = 0
    form.fee = 0
  }
}

const searchAssets = () => {
  if (assetSearchQuery.value.length < 2) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }
  
  searchResults.value = searchCrypto(assetSearchQuery.value)
  showSearchResults.value = true
}

const selectAsset = (crypto: CryptoSearchResult) => {
  selectedAsset.value = crypto
  form.assetId = crypto.id
  assetSearchQuery.value = `${crypto.name} (${crypto.symbol.toUpperCase()})`
  searchResults.value = []
  showSearchResults.value = false
  
  // Add asset to store if not exists
  if (!portfolioStore.assets[crypto.id]) {
    portfolioStore.addAsset({
      ...crypto,
      category: 'crypto'
    })
  }
  
  // Update price with current market price
  if (portfolioStore.prices[crypto.id]) {
    form.price = portfolioStore.prices[crypto.id]
  }
}

const getOrCreatePlatform = (platformName: string): string => {
  const existingPlatform = Object.values(portfolioStore.platforms)
    .find(p => p.name.toLowerCase() === platformName.toLowerCase().trim())
    
  if (existingPlatform) {
    return existingPlatform.id
  }
  
  // Create new platform
  const platformId = platformName.toLowerCase().trim().replace(/\s+/g, '-')
  const newPlatform = {
    id: platformId,
    name: platformName,
    type: 'exchange' as const
  }
  
  portfolioStore.platforms[platformId] = newPlatform
  return platformId
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  const platformId = getOrCreatePlatform(form.platformName)
  
  const transactionData = {
    type: form.type,
    assetId: form.assetId,
    platformId,
    quantity: form.quantity,
    price: form.type === 'WITHDRAW' ? 0 : form.price,
    fee: ['BUY', 'SELL'].includes(form.type) ? form.fee : 0,
    ...(form.timestamp && { timestamp: new Date(form.timestamp).toISOString() })
  }
  
  if (props.transaction) {
    await portfolioStore.updateTransaction(props.transaction.id, transactionData)
  } else {
    await portfolioStore.addTransaction(transactionData)
  }
  
  emit('submitted')
}

// Close search results when clicking outside
const handleOutsideClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showSearchResults.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

watch(() => selectedAsset.value, (newAsset) => {
  if (newAsset && portfolioStore.prices[newAsset.id]) {
    form.price = portfolioStore.prices[newAsset.id]
  }
}, { immediate: true })

// Also update price when asset is selected initially
const updatePriceFromAsset = () => {
  if (form.assetId && portfolioStore.prices[form.assetId]) {
    form.price = portfolioStore.prices[form.assetId]
  }
}

// Watch for asset changes to update price
watch(() => form.assetId, () => {
  updatePriceFromAsset()
})
</script>