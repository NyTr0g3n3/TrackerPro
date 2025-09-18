<template>
  <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-6 border border-light-border dark:border-dark-border">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold flex items-center">
        <BellIcon class="w-5 h-5 mr-2 text-accent" />
        Alertes de Prix
      </h3>
      <button 
        @click="showCreateAlert = true"
        class="bg-accent hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg flex items-center"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Nouvelle Alerte
      </button>
    </div>

    <!-- Alerts List -->
    <div class="space-y-3">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="flex items-center justify-between p-4 bg-light-bg dark:bg-dark-bg rounded-lg"
      >
        <div class="flex items-center">
          <img 
            :src="getAssetImage(alert.assetId)" 
            class="w-8 h-8 mr-3 rounded-full"
            @error="handleImageError"
          />
          <div>
            <div class="font-semibold">
              {{ getAssetSymbol(alert.assetId) }} 
              {{ alert.condition === 'above' ? '>' : '<' }} 
              {{ formatCurrency(alert.targetPrice) }}
            </div>
            <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Prix actuel: {{ formatCurrency(portfolioStore.prices[alert.assetId] || 0) }}
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span 
            :class="[
              'px-2 py-1 text-xs font-semibold rounded-full',
              alert.active 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            ]"
          >
            {{ alert.active ? 'Actif' : 'Inactif' }}
          </span>
          <button 
            @click="toggleAlert(alert.id)"
            class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
          >
            <PowerIcon class="w-4 h-4" />
          </button>
          <button 
            @click="deleteAlert(alert.id)"
            class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
          >
            <TrashIcon class="w-4 h-4 text-negative" />
          </button>
        </div>
      </div>

      <div v-if="alerts.length === 0" class="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
        Aucune alerte configurée
      </div>
    </div>

    <!-- Create Alert Modal -->
    <div v-if="showCreateAlert" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
        <div class="p-6">
          <h3 class="text-lg font-bold mb-4">Nouvelle Alerte de Prix</h3>
          <form @submit.prevent="createAlert" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Actif</label>
              <select 
                v-model="newAlert.assetId"
                required
                class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3"
              >
                <option value="">Sélectionner un actif</option>
                <option 
                  v-for="asset in Object.values(portfolioStore.assets)"
                  :key="asset.id"
                  :value="asset.id"
                >
                  {{ asset.symbol.toUpperCase() }} - {{ asset.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Condition</label>
              <select 
                v-model="newAlert.condition"
                required
                class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3"
              >
                <option value="above">Prix au-dessus de</option>
                <option value="below">Prix en-dessous de</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">
                Prix cible ({{ portfolioStore.settings.baseCurrency }})
              </label>
              <input 
                type="number"
                v-model.number="newAlert.targetPrice"
                step="any"
                required
                class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3"
              >
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button 
                type="button"
                @click="showCreateAlert = false"
                class="px-4 py-2 bg-gray-200 dark:bg-slate-600 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500"
              >
                Annuler
              </button>
              <button 
                type="submit"
                class="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90"
              >
                Créer l'Alerte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/formatters'

import { 
  BellIcon, 
  PlusIcon, 
  PowerIcon, 
  TrashIcon 
} from '@heroicons/vue/24/outline'

interface PriceAlert {
  id: string
  assetId: string
  condition: 'above' | 'below'
  targetPrice: number
  active: boolean
  triggered: boolean
  createdAt: string
}

const portfolioStore = usePortfolioStore()
const { showToast } = useToast()

const alerts = ref<PriceAlert[]>([])
const showCreateAlert = ref(false)

const newAlert = reactive({
  assetId: '',
  condition: 'above' as 'above' | 'below',
  targetPrice: 0
})

// Load alerts from localStorage
onMounted(() => {
  const savedAlerts = localStorage.getItem('priceAlerts')
  if (savedAlerts) {
    alerts.value = JSON.parse(savedAlerts)
  }
})

// Save alerts to localStorage
const saveAlerts = () => {
  localStorage.setItem('priceAlerts', JSON.stringify(alerts.value))
}

// Watch for price changes and check alerts
watch(() => portfolioStore.prices, (newPrices) => {
  alerts.value.forEach(alert => {
    if (!alert.active || alert.triggered) return
    
    const currentPrice = newPrices[alert.assetId]
    if (!currentPrice) return
    
    const shouldTrigger = alert.condition === 'above' 
      ? currentPrice >= alert.targetPrice
      : currentPrice <= alert.targetPrice
    
    if (shouldTrigger) {
      alert.triggered = true
      const asset = portfolioStore.assets[alert.assetId]
      const symbol = asset?.symbol.toUpperCase() || alert.assetId
      
      showToast(
        `🔔 Alerte: ${symbol} ${alert.condition === 'above' ? 'a dépassé' : 'est tombé sous'} ${formatCurrency(alert.targetPrice)}`,
        'info'
      )
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(`Alerte Prix - ${symbol}`, {
          body: `Prix actuel: ${formatCurrency(currentPrice)}`,
          icon: asset?.image
        })
      }
      
      saveAlerts()
    }
  })
}, { deep: true })

const createAlert = () => {
  const alert: PriceAlert = {
    id: `alert_${Date.now()}`,
    assetId: newAlert.assetId,
    condition: newAlert.condition,
    targetPrice: newAlert.targetPrice,
    active: true,
    triggered: false,
    createdAt: new Date().toISOString()
  }
  
  alerts.value.push(alert)
  saveAlerts()
  
  // Reset form
  newAlert.assetId = ''
  newAlert.condition = 'above'
  newAlert.targetPrice = 0
  showCreateAlert.value = false
  
  showToast('Alerte créée avec succès!', 'success')
  
  // Request notification permission if not already granted
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

const toggleAlert = (alertId: string) => {
  const alert = alerts.value.find(a => a.id === alertId)
  if (alert) {
    alert.active = !alert.active
    if (alert.active) {
      alert.triggered = false // Reset triggered state when reactivating
    }
    saveAlerts()
    showToast(`Alerte ${alert.active ? 'activée' : 'désactivée'}`, 'success')
  }
}

const deleteAlert = (alertId: string) => {
  if (confirm('Supprimer cette alerte ?')) {
    alerts.value = alerts.value.filter(a => a.id !== alertId)
    saveAlerts()
    showToast('Alerte supprimée', 'success')
  }
}

const getAssetSymbol = (assetId: string) => {
  return portfolioStore.assets[assetId]?.symbol.toUpperCase() || assetId
}

const getAssetImage = (assetId: string) => {
  const asset = portfolioStore.assets[assetId]
  return asset?.image || `https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/${asset?.symbol.toLowerCase()}.png`
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48cGF0aCBkPSJNMTEgN2gzdjZoLTN6bTAgOGgydjJoLTJ6Ii8+PC9zdmc+'
}
</script>