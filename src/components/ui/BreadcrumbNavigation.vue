<script setup lang="ts">
interface Crumb {
  label: string
  to?: string
}
defineProps<{ crumbs: Crumb[] }>()
</script>

<template>
  <nav class="flex items-center gap-1.5 text-xs text-surface-500">
    <template v-for="(crumb, i) in crumbs" :key="i">
      <RouterLink v-if="crumb.to" :to="crumb.to" class="hover:text-surface-300 transition-colors">
        {{ crumb.label }}
      </RouterLink>
      <span v-else class="text-surface-300 font-medium">{{ crumb.label }}</span>
      <svg v-if="i < crumbs.length - 1" class="w-3 h-3 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </template>
  </nav>
</template>
