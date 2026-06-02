<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  icon?: string
}
withDefaults(defineProps<Props>(), {
  title: 'Nothing here yet',
  description: 'No items to display.',
  icon: '📭',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="text-5xl mb-4 opacity-40">{{ icon }}</div>
    <h3 class="text-lg font-semibold text-surface-300 font-display mb-2">{{ title }}</h3>
    <p class="text-sm text-surface-500 max-w-xs">{{ description }}</p>
    <slot />
  </div>
</template>
