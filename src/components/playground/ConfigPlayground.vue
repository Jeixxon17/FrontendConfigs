<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ConfigDoc, ConfigVariant } from '../../types'
import { useClipboard } from '../../composables/useClipboard'
import PlaygroundControls from './PlaygroundControls.vue'
import VariantSelector from './VariantSelector.vue'
import PreviewRenderer from './PreviewRenderer.vue'

const props = defineProps<{ doc: ConfigDoc }>()

const { copyJSON, isCopied } = useClipboard()

// ─── State ────────────────────────────────────────────────────────────────
const activeVariantId = ref<string | null>(props.doc.variants?.[0]?.id ?? null)
const liveValues = ref<Record<string, unknown>>({ ...(props.doc.playgroundDefault ?? {}) })
const leftTab = ref<'variants'>('variants')
const previewScale = ref(100)
const showCode = ref(true)

// ─── Derived ──────────────────────────────────────────────────────────────
const activeVariant = computed<ConfigVariant | null>(() =>
  props.doc.variants?.find(v => v.id === activeVariantId.value) ?? null
)

const previewImage = computed(() =>
  activeVariant.value?.previewImage ?? ''
)

// When user selects a variant → sync liveValues to that variant's values
function selectVariant(v: ConfigVariant) {
  activeVariantId.value = v.id
  liveValues.value = { ...v.values }
}

// When user tweaks a control → deselect active variant (custom state)
watch(liveValues, (newVals) => {
  // Check if newVals exactly matches a variant
  const match = props.doc.variants?.find(v =>
    JSON.stringify(v.values) === JSON.stringify(newVals)
  )
  if (match) {
    activeVariantId.value = match.id
  } else {
    activeVariantId.value = null // custom / mixed
  }
}, { deep: true })

// Reset to first variant on doc change
watch(() => props.doc.id, () => {
  activeVariantId.value = props.doc.variants?.[0]?.id ?? null
  liveValues.value = { ...(props.doc.playgroundDefault ?? {}) }
})

function copyCurrentConfig() {
  copyJSON(liveValues.value, 'playground')
}

const hasPlayground = computed(() =>
  (props.doc.variants && props.doc.variants.length > 0) ||
  (props.doc.controls && props.doc.controls.length > 0)
)
</script>

<template>
  <div v-if="hasPlayground" class="space-y-0">

    <!-- ── Playground Header ────────────────────────────────────────────── -->
    <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-surface-800/60 bg-surface-950/60 sticky top-0 z-10 backdrop-blur">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span class="text-sm font-semibold text-white font-display">Vista principal</span>
        </div>
        <!-- Custom state badge -->
        <span v-if="!activeVariantId && doc.variants?.length"
          class="text-[10px]   px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
          ✦ Custom
        </span>
        <span v-else-if="activeVariant"
          class="text-[10px]   px-2 py-0.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400">
          {{ activeVariant.label }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <!-- Scale controls -->
        <div class="hidden sm:flex items-center gap-1 bg-surface-800/60 border border-surface-700/40 rounded-lg px-2 py-1">
          <button @click="previewScale = Math.max(50, previewScale - 10)"
            class="text-xs text-surface-500 hover:text-surface-300 w-5 h-5 flex items-center justify-center rounded transition-colors">−</button>
          <span class="text-[10px]   text-surface-400 w-8 text-center">{{ previewScale }}%</span>
          <button @click="previewScale = Math.min(150, previewScale + 10)"
            class="text-xs text-surface-500 hover:text-surface-300 w-5 h-5 flex items-center justify-center rounded transition-colors">+</button>
        </div>

        <button @click="showCode = !showCode"
          class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
          :class="showCode ? 'bg-accent-600/15 text-accent-400 border border-accent-500/20' : 'text-surface-500 hover:text-surface-300 border border-transparent hover:border-surface-700'">
          <span class=" ">{}</span>
          {{ showCode ? 'Esconder' : 'Mostrar' }} codigo
        </button>

        <button @click="copyCurrentConfig"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="isCopied('playground')
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
            : 'bg-surface-800 text-surface-300 border border-surface-700/60 hover:bg-surface-700 hover:text-white'">
          <svg v-if="!isCopied('playground')" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ isCopied('playground') ? '¡Copiado!' : 'Copiar configuración' }}
        </button>
      </div>
    </div>

    <!-- ── Main 3-panel layout ───────────────────────────────────────────── -->
    <div class="flex flex-col lg:flex-row min-h-[520px]">

      <!-- LEFT PANEL: Variants + Controls ─────────────────────────────── -->
      <div class="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-surface-800/60 flex flex-col bg-surface-950/40">
        <!-- Tab switcher -->
        <div class="flex border-b border-surface-800/60">
          <button
            v-for="tab in ['variants'] as const"
            :key="tab"
            @click="leftTab = tab"
            class="flex-1 py-2.5 text-xs font-medium capitalize transition-all border-b-2 -mb-px"
            :class="leftTab === tab
              ? 'border-accent-500 text-accent-400'
              : 'border-transparent text-surface-600 hover:text-surface-400'"
          >
            {{ tab === 'variants' ? 'Versiones' : '' }}
            <span class="ml-1 text-[10px]   opacity-60">
              {{ tab === 'variants' ? doc.variants?.length ?? 0 : undefined }}
            </span>
          </button>
        </div>

        <!-- Panel content — scrollable -->
        <div class="flex-1 overflow-y-auto">
          <VariantSelector
            v-if="leftTab === 'variants' && doc.variants?.length"
            :variants="doc.variants"
            :active-id="activeVariantId"
            @select="selectVariant"
          />
          <div v-else-if="leftTab === 'variants'" class="flex flex-col items-center py-12 gap-2 px-4">
            <span class="text-2xl opacity-20">◎</span>
            <p class="text-xs text-surface-600 text-center">No hay versiones definidas para esta configuracion</p>
          </div>
        </div>
      </div>

      <!-- CENTER PANEL: Live Preview ───────────────────────────────────── -->
      <div class="flex-1 flex flex-col bg-surface-950 min-w-0">
        <!-- Preview area label -->
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-surface-800/40 bg-surface-900/30">
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-surface-600   uppercase tracking-widest">Preview</span>
            <span v-if="activeVariant" class="text-[10px] text-surface-700  ">· {{ activeVariant.label }}</span>
          </div>
        </div>

        <!-- Dotted canvas -->
        <div class="flex-1 flex items-center justify-center p-6 overflow-auto relative">
          <div class="transition-all duration-300 w-full max-w-xl"
            :style="`transform: scale(${previewScale / 100}); transform-origin: top center`">
            <img
              v-if="previewImage"
              :src="previewImage"
              :values="liveValues"
            />
            <div v-else class="rounded-xl border border-surface-700/40 border-dashed flex flex-col items-center justify-center py-20 gap-3 bg-surface-900/40">
              <p class="text-sm text-surface-600  ">Sin previsualizacion disponible</p>
            </div>
          </div>
        </div>

        <!-- Live description below preview -->
        <div v-if="activeVariant?.description"
          class="px-4 py-3 border-t border-surface-800/40 bg-surface-900/30">
          <p class="text-xs text-surface-500 leading-relaxed">{{ activeVariant.description }}</p>
        </div>
      </div>

      <!-- RIGHT PANEL: Live JSON ───────────────────────────────────────── -->
      <Transition name="slide-panel">
        <div v-if="showCode"
          class="w-full lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-surface-800/60 flex flex-col bg-surface-950/60">
          <!-- JSON -->
          <div class="flex-1 overflow-y-auto p-3">
            <div class="rounded-xl border border-surface-800/40 overflow-hidden">
              <!-- Minibar -->
              <div class="flex items-center justify-between px-3 py-2 bg-surface-900 border-b border-surface-800/40">
                <div class="flex gap-1">
                  <span class="w-2 h-2 rounded-full bg-rose-500/50" />
                  <span class="w-2 h-2 rounded-full bg-amber-500/50" />
                  <span class="w-2 h-2 rounded-full bg-emerald-500/50" />
                </div>
              </div>
              <pre class="p-3 text-[11px]   leading-relaxed text-surface-400 bg-surface-950/80 overflow-x-auto whitespace-pre">{{ JSON.stringify(liveValues, null, 2) }}</pre>
            </div>

            <!-- Diff indicator when custom -->
            <div v-if="!activeVariantId && doc.variants?.length"
              class="mt-3 rounded-lg bg-amber-500/5 border border-amber-500/15 px-3 py-2.5">
              <p class="text-[10px] text-amber-500   font-medium mb-1">✦ Custom configuration</p>
              <p class="text-[10px] text-amber-600/70">This combination doesn't match any predefined variant.</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>

  <!-- No playground state -->
  <div v-else class="flex flex-col items-center py-16 gap-3 text-center">
    <span class="text-4xl opacity-20">⚙️</span>
    <p class="text-sm text-surface-500">No playground configured for this doc.</p>
    <p class="text-xs text-surface-700">Add <code class=" ">controls</code> and <code class=" ">variants</code> fields to enable it.</p>
  </div>
</template>

<style scoped>
.slide-panel-enter-active, .slide-panel-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-panel-enter-from, .slide-panel-leave-to {
  opacity: 0;
  width: 0;
  min-width: 0;
}
</style>
