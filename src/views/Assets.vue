<template>
  <AppLayout>
    <div class="flex flex-col h-full bg-light-card dark:bg-dark-card rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
      <!-- Tab Navigation -->
      <div class="border-b border-light-border dark:border-dark-border px-6">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="(tabName, tabKey) in categoryTabs"
            :key="tabKey"
            @click="activeTab = tabKey"
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === tabKey
                ? 'border-accent text-accent'
                : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:border-gray-300 dark:hover:border-dark-border'
            ]"
          >
            {{ tabName }}
          </button>
        </nav>
      </div>

      <!-- Search Bar -->
      <div class="p-4 px-6 border-b border-light-border dark:border-dark-border">
        <input
          type="search"
          v-model="searchTerm"
          placeholder="Rechercher par nom ou symbole..."
          class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-accent"
        >
      </div>

      <!-- Assets Table -->
      <div class="flex-1 overflow-y-auto">
        <AssetsTable :category="activeTab" :search-term="searchTerm" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AssetsTable from '@/components/AssetsTable.vue'

const activeTab = ref('crypto')
const searchTerm = ref('')

const categoryTabs = {
  'crypto': 'Cryptomonnaies',
  'action': 'Bourse',
  'obligation': 'Obligations',
  'epargne': 'Comptes Épargne'
}
</script>