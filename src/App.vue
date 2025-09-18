<template>
  <div class="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text-main dark:text-dark-text-main font-sans antialiased">
    <div v-if="authStore.loading" class="flex items-center justify-center h-screen">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
    </div>
    
    <router-view v-else />

    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-[120%]"
      enter-to-class="transform translate-x-0"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-[120%]"
    >
      <div
        v-if="toastVisible"
        :class="[
          'fixed bottom-20 md:bottom-5 right-5 py-2 px-4 rounded-lg shadow-lg z-50',
          toastType === 'success' ? 'bg-green-500 text-white' :
          toastType === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        ]"
      >
        <p>{{ toastMessage }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useToast } from '@/composables/useToast'

const authStore = useAuthStore()
const portfolioStore = usePortfolioStore()
const { toastVisible, toastMessage, toastType } = useToast()

onMounted(async () => {
  await authStore.initAuth()
})

// Apply theme changes to document
watch(() => portfolioStore.settings.theme, (newTheme) => {
  const isDark = newTheme === 'dark'
  document.documentElement.classList.toggle('dark', isDark)
}, { immediate: true })

// Cleanup on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  portfolioStore.cleanup()
})
</script>