<template>
  <div class="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
    <!-- Desktop Sidebar -->
    <nav class="hidden md:flex flex-col w-64 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border p-4 space-y-2">
      <div class="text-2xl font-bold text-accent mb-6">TrackerPro</div>
      
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.path"
        :class="[
          'nav-link flex items-center p-2 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg transition-colors',
          $route.path === item.path ? 'active bg-light-bg dark:bg-dark-bg text-accent' : ''
        ]"
      >
        <component :is="item.icon" class="w-6 h-6 mr-3" />
        {{ item.name }}
      </router-link>
      
      <div class="flex-grow"></div>
      
      <!-- Settings -->
      <div class="p-2 space-y-2">
        <button 
          @click="toggleCurrency"
          class="w-full text-left p-2 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg"
        >
          Devise: <span class="font-bold">{{ portfolioStore.settings.baseCurrency }}</span>
        </button>
        <div class="text-xs text-light-text-secondary dark:text-dark-text-secondary break-words">
          {{ authStore.user?.email }}
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="flex items-center justify-between p-4 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border gap-4">
        <h1 class="text-xl font-semibold hidden sm:block">{{ pageTitle }}</h1>
        
        <div class="flex items-center space-x-2 sm:space-x-4 ml-auto">
          <!-- Add Transaction Button -->
          <button 
            v-if="showAddButton"
            @click="openTransactionModal"
            :disabled="addButtonDisabled"
            :class="[
              'bg-accent hover:opacity-90 text-white font-bold p-2.5 rounded-lg flex items-center transition-opacity',
              addButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
            ]"
          >
            <PlusIcon class="w-5 h-5" />
          </button>

          <!-- Import CSV Button -->
          <button
            v-if="showImportButton" 
            @click="triggerCsvImport"
            class="bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 font-bold p-2.5 rounded-lg flex items-center"
            title="Importer CSV"
          >
            <UploadIcon class="w-5 h-5" />
          </button>
          <input 
            ref="csvFileInput"
            type="file" 
            class="hidden" 
            accept=".csv"
            @change="handleCsvImport"
          >

          <div class="h-6 w-px bg-light-border dark:bg-dark-border"></div>

          <!-- Theme Toggle -->
          <label class="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              class="sr-only"
              :checked="portfolioStore.settings.theme === 'dark'"
              @change="toggleTheme" />
            <div class="relative">
              <div class="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full shadow-inner"></div>
              <div :class="[
                'absolute w-4 h-4 bg-white rounded-full shadow transform transition-transform top-1',
                portfolioStore.settings.theme === 'dark' ? 'translate-x-5' : 'translate-x-1'
              ]"></div>
              <SunIcon v-if="portfolioStore.settings.theme === 'light'" class="absolute w-3 h-3 text-yellow-500 top-1.5 left-1.5" />
              <MoonIcon v-else class="absolute w-3 h-3 text-blue-400 top-1.5 right-1.5" />
            </div>
          </label>

          <!-- Notifications -->
          <button 
            @click="showNotifications = !showNotifications"
            class="relative p-2.5 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg"
            title="Notifications"
          >
            <BellIcon class="w-5 h-5" />
            <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ unreadCount }}
            </span>
          </button>

          <!-- Account Management -->
          <button 
            @click="showAccountModal = true"
            class="p-2.5 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg"
            title="Gestion du compte"
          >
            <UserCircleIcon class="w-5 h-5" />
          </button>

          <!-- Logout -->
          <button 
            @click="logout"
            class="p-2.5 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg text-red-500 hover:text-red-600 dark:hover:text-red-400"
            title="Déconnexion"
          >
            <ArrowRightOnRectangleIcon class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Search Bar -->
      <GlobalSearch v-if="showSearchBar" />

      <!-- Page Content -->
      <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-light-bg dark:bg-dark-bg">
        <slot />
      </div>
    </main>

    <!-- Mobile Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border flex justify-around p-2">
      <!-- Mobile nav items would go here -->
    </nav>
  </div>

  <!-- Transaction Modal -->
  <TransactionModal 
    v-if="showTransactionModal"
    :transaction="editingTransaction"
    @close="showTransactionModal = false"
    @submitted="onTransactionSubmitted"
  />

  <!-- Account Management Modal -->
  <div v-if="showAccountModal" class="fixed inset-0 bg-black bg-opacity-50 z-40" @click="showAccountModal = false"></div>
  <div v-if="showAccountModal" class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <AccountModal @close="showAccountModal = false" />
  </div>

  <!-- Notifications Panel -->
  <div v-if="showNotifications" class="fixed inset-0 bg-black bg-opacity-50 z-40" @click="showNotifications = false"></div>
  <div v-if="showNotifications" class="fixed top-16 right-4 z-50">
    <NotificationsPanel @close="showNotifications = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useToast } from '@/composables/useToast'
import TransactionModal from './TransactionModal.vue'
import GlobalSearch from './GlobalSearch.vue'
import AccountModal from './AccountModal.vue'
import NotificationsPanel from './NotificationsPanel.vue'
import { useNotifications } from '@/composables/useNotifications'

// Icons (simplified - in a real app you'd use an icon library)
import {
  HomeIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  DocumentChartBarIcon,
  CpuChipIcon,
  PlusIcon,
  ArrowUpTrayIcon as UploadIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon as SearchIcon,
  UserCircleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const portfolioStore = usePortfolioStore()
const { showToast } = useToast()
const { unreadCount, loadNotifications, initDemoNotifications } = useNotifications()

const csvFileInput = ref<HTMLInputElement>()
const showTransactionModal = ref(false)
const showAccountModal = ref(false)
const showNotifications = ref(false)
const editingTransaction = ref(null)

// Initialize notifications on mount
import { onMounted } from 'vue'
onMounted(() => {
  loadNotifications()
  initDemoNotifications()
})

// Navigation items
const navigationItems = [
  { name: 'Tableau de bord', path: '/dashboard', icon: HomeIcon },
  { name: 'Actifs', path: '/assets', icon: BanknotesIcon },
  { name: 'Transactions', path: '/transactions', icon: ArrowsRightLeftIcon },
  { name: 'Rapports', path: '/reports', icon: DocumentChartBarIcon },
  { name: 'Analyse IA', path: '/analysis', icon: CpuChipIcon }
]

// Computed properties
const pageTitle = computed(() => {
  const item = navigationItems.find(item => item.path === route.path)
  return item ? item.name : 'TrackerPro'
})

const showAddButton = computed(() => {
  return ['/dashboard', '/transactions'].includes(route.path)
})

const showImportButton = computed(() => {
  return route.path === '/assets'
})

const showSearchBar = computed(() => {
  return ['/dashboard', '/assets', '/transactions'].includes(route.path)
})

const addButtonDisabled = computed(() => {
  // Disable for non-crypto categories in assets view
  return false // For now, always enabled
})

// Methods
const toggleCurrency = () => {
  const newCurrency = portfolioStore.settings.baseCurrency === 'EUR' ? 'USD' : 'EUR'
  portfolioStore.updateSettings({ baseCurrency: newCurrency })
  // Trigger price updates with new currency
  portfolioStore.updateAllCryptoPrices()
  showToast(`Devise changée vers ${newCurrency}`)
}

const toggleTheme = () => {
  const newTheme = portfolioStore.settings.theme === 'dark' ? 'light' : 'dark'
  portfolioStore.updateSettings({ theme: newTheme })
}

const openTransactionModal = () => {
  if (addButtonDisabled.value) return
  showTransactionModal.value = true
}

const onTransactionSubmitted = () => {
  showTransactionModal.value = false
  editingTransaction.value = null
  showToast(editingTransaction.value ? 'Transaction modifiée avec succès!' : 'Transaction ajoutée avec succès!')
}

const triggerCsvImport = () => {
  csvFileInput.value?.click()
}

const handleCsvImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // TODO: Implement CSV import logic
  showToast('Import CSV - Fonctionnalité à venir', 'info')
  
  // Clear the input
  target.value = ''
}

const logout = async () => {
  await authStore.logout()
  router.push('/auth')
  showToast('Déconnecté avec succès!')
}
</script>