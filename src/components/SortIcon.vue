<template>
  <svg 
    v-if="direction"
    :class="['w-4 h-4 inline-block ml-1 sort-icon active']"
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      :d="direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"
    />
  </svg>
  <svg 
    v-else
    class="w-4 h-4 inline-block ml-1 sort-icon"
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M8 9l4-4 4 4m0 6l-4 4-4-4"
    />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  direction: 'asc' | 'desc' | null
}

defineProps<Props>()
</script>