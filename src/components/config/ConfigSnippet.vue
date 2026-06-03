<script setup lang="ts">
import { computed, onMounted } from 'vue'
import CopyButton from '../ui/CopyButton.vue'

interface Props {
  code: Record<string, unknown>
  title?: string
  description?: string
  lang?: string
  label?: string
}
const props = withDefaults(defineProps<Props>(), { lang: 'json' })

const jsonString = computed(() => JSON.stringify(props.code, null, 2))

const highlighted = computed(() => {
  // Simple JSON syntax highlighting without Prism dependency issues
  return jsonString.value
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'text-blue-400' // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-violet-300' // key
          match = match.slice(0, -1) // remove colon
          return `<span class="${cls}">${match}</span>:`
        } else {
          cls = 'text-emerald-400' // string value
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-amber-400' // boolean
      } else if (/null/.test(match)) {
        cls = 'text-rose-400' // null
      }
      return `<span class="${cls}">${match}</span>`
    })
    .replace(/[{}\[\],]/g, m => `<span class="text-surface-500">${m}</span>`)
})
</script>

<template>
  <div class="rounded-xl border border-surface-700/60 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 bg-surface-900 border-b border-surface-700/60">
      <div class="flex items-center gap-3">
        <div class="flex gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <span v-if="title" class="text-xs font-medium text-surface-400 font-display">{{ title }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[10px] text-surface-600   uppercase tracking-widest">{{ lang }}</span>
        <CopyButton :text="jsonString" :label="title || 'snippet'" />
      </div>
    </div>

    <!-- Code area -->
    <div class="relative bg-surface-950/80 overflow-x-auto">
      <pre class="p-5 text-sm   leading-relaxed text-surface-300 whitespace-pre"><code v-html="highlighted" /></pre>
    </div>

    <!-- Description footer -->
    <div v-if="description" class="px-4 py-2.5 bg-surface-900/50 border-t border-surface-700/40">
      <p class="text-xs text-surface-500">{{ description }}</p>
    </div>
  </div>
</template>
