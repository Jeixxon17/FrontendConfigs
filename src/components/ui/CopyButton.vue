<script setup lang="ts">
interface Props {
  text: string
  label?: string
}
const props = withDefaults(defineProps<Props>(), { label: 'copy' })

import { useClipboard } from '../../composables/useClipboard'
const { copy, isCopied } = useClipboard()
</script>

<template>
  <button
    @click="copy(text, label)"
    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
    :class="isCopied(label)
      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
      : 'bg-surface-700/60 text-surface-400 hover:text-surface-200 hover:bg-surface-700 border border-surface-600/40'"
  >
    <svg v-if="!isCopied(label)" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
    </svg>
    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
    </svg>
    {{ isCopied(label) ? 'Copied!' : 'Copy' }}
  </button>
</template>
