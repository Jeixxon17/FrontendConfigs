<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  imageUrl?: string
  title?: string
  alt?: string
}
const props = withDefaults(defineProps<Props>(), {})
const imgError = ref(false)
const loaded = ref(false)
</script>

<template>
  <div class="rounded-xl border border-surface-700/60 overflow-hidden bg-surface-900">
    <!-- Header bar -->
    <div class="flex items-center justify-between px-4 py-3 bg-surface-900 border-b border-surface-700/40">
      <span class="text-xs font-medium text-surface-400 font-display">Preview</span>
      <div class="flex gap-1.5">
        <span class="w-2 h-2 rounded-full bg-surface-700" />
        <span class="w-2 h-2 rounded-full bg-surface-700" />
        <span class="w-2 h-2 rounded-full bg-surface-700" />
      </div>
    </div>

    <!-- Image area -->
    <div class="relative bg-surface-950/60 min-h-[200px] flex items-center justify-center">
      <!-- Grid pattern background -->
      <div class="absolute inset-0 opacity-20"
        style="background-image: radial-gradient(circle, #4a5578 1px, transparent 1px); background-size: 24px 24px;" />

      <template v-if="imageUrl && !imgError">
        <div v-if="!loaded" class="absolute inset-0 animate-pulse bg-surface-800/40" />
        <img
          :src="imageUrl"
          :alt="alt || title"
          @load="loaded = true"
          @error="imgError = true"
          class="relative z-10 max-h-64 w-full object-contain transition-opacity duration-300"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
        />
      </template>

      <!-- Placeholder -->
      <div v-else class="relative z-10 flex flex-col items-center gap-3 py-12">
        <div class="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700/60 flex items-center justify-center">
          <svg class="w-7 h-7 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <p class="text-xs text-surface-600 font-mono">No preview available</p>
      </div>
    </div>
  </div>
</template>
