<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigsStore } from '../../stores/configs.store'
import TagBadge from '../ui/TagBadge.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const store = useConfigsStore()
const router = useRouter()
const inputRef = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(0)

watch(() => props.modelValue, async (v) => {
  if (v) {
    await nextTick()
    inputRef.value?.focus()
    selectedIndex.value = 0
  } else {
    store.searchQuery = ''
  }
})

watch(() => store.searchResults, () => { selectedIndex.value = 0 })

function close() { emit('update:modelValue', false) }

function select(id: string) {
  const doc = store.docs.find(d => d.id === id)
  if (doc) {
    router.push({ name: 'config', params: { slug: doc.slug } })
    store.setActive(id)
  }
  close()
}

function onKeydown(e: KeyboardEvent) {
  const len = store.searchResults.length
  if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex.value = (selectedIndex.value + 1) % len }
  if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex.value = (selectedIndex.value - 1 + len) % len }
  if (e.key === 'Enter' && store.searchResults[selectedIndex.value]) {
    select(store.searchResults[selectedIndex.value].id)
  }
  if (e.key === 'Escape') close()
}

const matchTypeLabel: Record<string, string> = {
  title: 'Name', tag: 'Tag', description: 'Description', config: 'Config',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="search-overlay">
      <div v-if="modelValue"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
        @mousedown.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-surface-950/80 backdrop-blur-md" />

        <!-- Panel -->
        <div class="relative w-full max-w-2xl bg-surface-900 rounded-2xl border border-surface-700/60 shadow-2xl overflow-hidden animate-fade-in">
          <!-- Search input -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-surface-800">
            <svg class="w-5 h-5 text-surface-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              ref="inputRef"
              v-model="store.searchQuery"
              @keydown="onKeydown"
              type="text"
              placeholder="Search configurations, variables, tags…"
              class="flex-1 bg-transparent text-surface-100 placeholder-surface-600 text-base outline-none"
            />
            <kbd class="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-surface-800 border border-surface-700 text-xs text-surface-500 font-mono">ESC</kbd>
          </div>

          <!-- Results -->
          <div class="max-h-[420px] overflow-y-auto py-2">
            <!-- No query: show recents -->
            <template v-if="!store.searchQuery && store.recentDocs.length">
              <div class="px-4 pt-2 pb-1">
                <span class="text-[10px] text-surface-600 font-mono uppercase tracking-widest">Recently Viewed</span>
              </div>
              <button
                v-for="doc in store.recentDocs.slice(0, 5)"
                :key="doc.id"
                @click="select(doc.id)"
                class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-800/60 transition-colors"
              >
                <span class="text-surface-500 text-sm">◷</span>
                <span class="text-sm text-surface-300 flex-1 text-left">{{ doc.category }} / {{ doc.title }}</span>
              </button>
            </template>

            <!-- Search results -->
            <template v-else-if="store.searchQuery && store.searchResults.length">
              <div class="px-4 pt-2 pb-1">
                <span class="text-[10px] text-surface-600 font-mono uppercase tracking-widest">
                  {{ store.searchResults.length }} result{{ store.searchResults.length !== 1 ? 's' : '' }}
                </span>
              </div>
              <button
                v-for="(result, i) in store.searchResults"
                :key="result.id"
                @click="select(result.id)"
                class="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                :class="i === selectedIndex ? 'bg-accent-600/10 border-l-2 border-accent-500' : 'hover:bg-surface-800/50'"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-sm font-medium text-surface-200">{{ result.title }}</span>
                    <TagBadge variant="accent">{{ result.category }}</TagBadge>
                  </div>
                  <p class="text-xs text-surface-500 truncate">{{ result.description }}</p>
                </div>
                <span class="text-[10px] text-surface-600 font-mono shrink-0">{{ matchTypeLabel[result.matchType] }}</span>
              </button>
            </template>

            <!-- Empty state -->
            <div v-else-if="store.searchQuery" class="flex flex-col items-center py-12 gap-2">
              <span class="text-3xl opacity-30">◎</span>
              <p class="text-sm text-surface-500">No results for <span class="text-surface-300 font-mono">"{{ store.searchQuery }}"</span></p>
            </div>

            <!-- Default empty -->
            <div v-else class="flex flex-col items-center py-10 gap-2">
              <p class="text-sm text-surface-600">Start typing to search…</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-5 py-3 border-t border-surface-800 bg-surface-900/50">
            <div class="flex items-center gap-4 text-[10px] text-surface-600">
              <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-surface-800 rounded border border-surface-700 font-mono">↑↓</kbd> Navigate</span>
              <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-surface-800 rounded border border-surface-700 font-mono">↵</kbd> Select</span>
            </div>
            <span class="text-[10px] text-surface-600 font-mono">⌘K to toggle</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-overlay-enter-active { transition: opacity 0.15s ease; }
.search-overlay-leave-active { transition: opacity 0.1s ease; }
.search-overlay-enter-from, .search-overlay-leave-to { opacity: 0; }
</style>
