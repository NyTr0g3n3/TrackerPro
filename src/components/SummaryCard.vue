<template>
  <div class="bg-light-card dark:bg-dark-card p-4 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
    <h3 class="font-semibold mb-3">{{ title }}</h3>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>