<template>
  <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg border border-light-border dark:border-dark-border">
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">Gestion du compte</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
      
      <div class="space-y-6">
        <!-- Account Info -->
        <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
          <h3 class="font-semibold mb-3">Informations du compte</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-light-text-secondary dark:text-dark-text-secondary">Email:</span>
              <span class="font-medium">{{ authStore.user?.email }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-light-text-secondary dark:text-dark-text-secondary">Plan:</span>
              <span class="font-medium text-accent">Gratuit</span>
            </div>
            <div class="flex justify-between">
              <span class="text-light-text-secondary dark:text-dark-text-secondary">Actifs:</span>
              <span class="font-medium">{{ Object.keys(portfolioStore.assets).length }}/∞</span>
            </div>
            <div class="flex justify-between">
              <span class="text-light-text-secondary dark:text-dark-text-secondary">Transactions:</span>
              <span class="font-medium">{{ portfolioStore.transactions.length }}</span>
            </div>
          </div>
        </div>

        <!-- Portfolio Stats -->
        <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
          <h3 class="font-semibold mb-3">Statistiques du portefeuille</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-accent">{{ formatCurrency(portfolioStore.totalValue) }}</div>
              <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">Valeur totale</div>
            </div>
            <div class="text-center">
              <div 
                :class="[
                  'text-2xl font-bold',
                  portfolioStore.totalPnL >= 0 ? 'text-positive' : 'text-negative'
                ]"
              >
                {{ formatCurrency(portfolioStore.totalPnL) }}
              </div>
              <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">P&L Total</div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="space-y-2">
          <button 
            @click="exportData"
            class="w-full text-left p-3 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg border border-light-border dark:border-dark-border transition-colors"
          >
            <div class="flex items-center">
              <ArrowDownTrayIcon class="w-5 h-5 mr-3 text-accent" />
              <div>
                <div class="font-medium">Exporter les données</div>
                <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Télécharger votre portefeuille en JSON
                </div>
              </div>
            </div>
          </button>
          
          <button 
            @click="showImportModal = true"
            class="w-full text-left p-3 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg border border-light-border dark:border-dark-border transition-colors"
          >
            <div class="flex items-center">
              <ArrowUpTrayIcon class="w-5 h-5 mr-3 text-blue-500" />
              <div>
                <div class="font-medium">Importer des données</div>
                <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Restaurer depuis un fichier JSON
                </div>
              </div>
            </div>
          </button>

          <button 
            @click="showBackupModal = true"
            class="w-full text-left p-3 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg border border-light-border dark:border-dark-border transition-colors"
          >
            <div class="flex items-center">
              <CloudArrowUpIcon class="w-5 h-5 mr-3 text-green-500" />
              <div>
                <div class="font-medium">Sauvegarde automatique</div>
                <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Configurer les sauvegardes cloud
                </div>
              </div>
            </div>
          </button>
          
          <button 
            @click="clearAllData"
            class="w-full text-left p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 transition-colors"
          >
            <div class="flex items-center">
              <TrashIcon class="w-5 h-5 mr-3" />
              <div>
                <div class="font-medium">Effacer toutes les données</div>
                <div class="text-sm text-red-500/70">
                  Supprimer définitivement le portefeuille
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="showImportModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
        <div class="p-6">
          <h3 class="text-lg font-bold mb-4">Importer des données</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Fichier JSON</label>
              <input 
                ref="importFileInput"
                type="file" 
                accept=".json"
                @change="handleImport"
                class="w-full p-2 border border-light-border dark:border-dark-border rounded-lg"
              >
            </div>
            <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              ⚠️ Cette action remplacera toutes vos données actuelles.
            </div>
            <div class="flex justify-end space-x-3">
              <button 
                @click="showImportModal = false"
                class="px-4 py-2 bg-gray-200 dark:bg-slate-600 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Backup Modal -->
    <div v-if="showBackupModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
        <div class="p-6">
          <h3 class="text-lg font-bold mb-4">Sauvegarde automatique</h3>
          <div class="space-y-4">
            <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">Firebase Sync</span>
                <span class="text-green-500 text-sm">✓ Actif</span>
              </div>
              <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Vos données sont automatiquement sauvegardées dans le cloud Firebase.
              </p>
            </div>
            <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Dernière sauvegarde: {{ new Date().toLocaleString('fr-FR') }}
            </div>
            <div class="flex justify-end">
              <button 
                @click="showBackupModal = false"
                class="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/formatters'

import { 
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CloudArrowUpIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const portfolioStore = usePortfolioStore()
const { showToast } = useToast()

const showImportModal = ref(false)
const showBackupModal = ref(false)
const importFileInput = ref<HTMLInputElement>()

const exportData = () => {
  const data = {
    settings: portfolioStore.settings,
    assets: portfolioStore.assets,
    platforms: portfolioStore.platforms,
    transactions: portfolioStore.transactions,
    positions: portfolioStore.positions,
    liquidity: portfolioStore.liquidity,
    exportDate: new Date().toISOString(),
    version: '1.0'
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trackerpro-portfolio-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  showToast('Données exportées avec succès!', 'success')
}

const handleImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      
      // Validate data structure
      if (!data.assets || !data.transactions || !data.settings) {
        throw new Error('Format de fichier invalide')
      }
      
      // Import data
      if (data.settings) portfolioStore.settings = { ...portfolioStore.settings, ...data.settings }
      if (data.assets) portfolioStore.assets = data.assets
      if (data.platforms) portfolioStore.platforms = { ...portfolioStore.platforms, ...data.platforms }
      if (data.transactions) portfolioStore.transactions.splice(0, portfolioStore.transactions.length, ...data.transactions)
      if (data.liquidity) portfolioStore.liquidity = { ...portfolioStore.liquidity, ...data.liquidity }
      
      portfolioStore.calculatePositions()
      portfolioStore.saveState()
      
      showToast('Données importées avec succès!', 'success')
      showImportModal.value = false
      emit('close')
    } catch (error) {
      console.error('Import error:', error)
      showToast('Erreur lors de l\'importation', 'error')
    }
  }
  
  reader.readAsText(file)
}

const clearAllData = () => {
  if (confirm('⚠️ ATTENTION: Cette action supprimera définitivement toutes vos données (actifs, transactions, plateformes). Cette action est irréversible.\n\nÊtes-vous absolument sûr de vouloir continuer ?')) {
    if (confirm('Dernière confirmation: Voulez-vous vraiment effacer TOUTES vos données ?')) {
      // Clear all data
      portfolioStore.assets = {}
      portfolioStore.platforms = {
        'default-bank': {
          id: 'default-bank',
          name: 'Compte Bancaire',
          type: 'bank'
        }
      }
      portfolioStore.transactions.splice(0, portfolioStore.transactions.length)
      portfolioStore.positions = {}
      portfolioStore.liquidity = {
        'default-bank-eur': {
          id: 'default-bank-eur',
          platformId: 'default-bank',
          currency: 'EUR',
          balance: 0
        }
      }
      portfolioStore.prices = {}
      
      portfolioStore.calculatePositions()
      portfolioStore.saveState()
      
      showToast('Toutes les données ont été supprimées', 'success')
      emit('close')
    }
  }
}
</script>