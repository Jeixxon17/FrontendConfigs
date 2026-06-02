<script setup lang="ts">
interface Props {
  lines?: number
  width?: string
}
withDefaults(defineProps<Props>(), { lines: 3, width: 'w-full' })
</script>

<template>
  <div class="animate-pulse space-y-3">
    <div v-for="i in lines" :key="i"
      class="h-4 bg-surface-800 rounded-md"
      :class="[width, i === lines ? 'w-2/3' : '']"
    />
  </div>
</template>
