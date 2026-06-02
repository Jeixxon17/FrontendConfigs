<script setup lang="ts">
import type { Dependency } from '../../types'
import TagBadge from '../ui/TagBadge.vue'
import ConfigSnippet from './ConfigSnippet.vue'

defineProps<{ dependencies: Dependency[] }>()

const depVariant = (type: Dependency['type']) => {
  const map: Record<string, string> = {
    required: 'required', optional: 'optional',
    compatible: 'compatible', deprecated: 'deprecated',
  }
  return map[type] as any
}

const depIcon = (type: Dependency['type']) => {
  const icons = { required: '⚡', optional: '◎', compatible: '✦', deprecated: '⚠' }
  return icons[type]
}
</script>

<template>
  <div v-if="dependencies.length" class="space-y-4">
    <div
      v-for="dep in dependencies"
      :key="dep.type + JSON.stringify(dep.code)"
      class="rounded-xl border overflow-hidden"
      :class="{
        'border-rose-500/20 bg-rose-500/5': dep.type === 'required',
        'border-amber-500/20 bg-amber-500/5': dep.type === 'optional',
        'border-emerald-500/20 bg-emerald-500/5': dep.type === 'compatible',
        'border-surface-700/30 bg-surface-800/20': dep.type === 'deprecated',
      }"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b"
        :class="{
          'border-rose-500/10': dep.type === 'required',
          'border-amber-500/10': dep.type === 'optional',
          'border-emerald-500/10': dep.type === 'compatible',
          'border-surface-700/20': dep.type === 'deprecated',
        }"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-base">{{ depIcon(dep.type) }}</span>
          <span class="text-sm font-medium text-surface-200">{{ dep.label || dep.type }}</span>
          <TagBadge :variant="depVariant(dep.type)">{{ dep.type }}</TagBadge>
        </div>
      </div>

      <div class="p-4">
        <p v-if="dep.description" class="text-sm text-surface-400 mb-3">{{ dep.description }}</p>
        <ConfigSnippet :code="dep.code" :title="dep.label" />
      </div>
    </div>
  </div>

  <div v-else class="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800/30 border border-surface-700/30 text-sm text-surface-500">
    <span>✦</span>
    <span>No dependencies for this configuration.</span>
  </div>
</template>
