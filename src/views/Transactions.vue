<template>
  <AppLayout>
    <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg overflow-hidden border border-light-border dark:border-dark-border">
      <div class="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
        <h2 class="text-lg font-semibold">Historique des Transactions</h2>
        <button 
          @click="toggleFilters()"
          :class="[
            'p-2 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg transition-colors relative',
            transactionsTableRef?.hasActiveFilters ? 'text-blue-500' : 'text-gray-500'
          ]"
          title="Filtres"
        >
          <FunnelIcon class="w-5 h-5" />
          <span 
            v-if="transactionsTableRef?.activeFiltersCount > 0"
            class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {{ transactionsTableRef?.activeFiltersCount }}
          </span>
        </button>
      </div>
      
      <TransactionsTable 
        ref="transactionsTableRef"
        @toggle-filters="toggleFilters"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import TransactionsTable from '@/components/TransactionsTable.vue'
import { FunnelIcon } from '@heroicons/vue/24/outline'

const transactionsTableRef = ref()

const toggleFilters = () => {
  if (transactionsTableRef.value) {
    transactionsTableRef.value.toggleFilters()
  }
}
</script>