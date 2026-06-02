<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useConfigsStore } from '../stores/configs.store'
import TagBadge from '../components/ui/TagBadge.vue'

const store = useConfigsStore()
const router = useRouter()

function navigate(id: string) {
  const doc = store.docs.find(d => d.id === id)
  if (doc) {
    store.setActive(id)
    router.push({ name: 'config', params: { slug: doc.slug } })
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-10 space-y-6">
    <h1 class="text-2xl font-bold text-white font-display">Search</h1>

    <div class="relative">
      <input
        v-model="store.searchQuery"
        type="text"
        placeholder="Search configurations…"
        class="input-base pl-10 py-3 text-base"
        autofocus
      />
      <svg class="absolute left-3.5 top-3.5 w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    </div>

    <div v-if="store.searchResults.length" class="space-y-2">
      <p class="text-xs text-surface-600 font-mono">{{ store.searchResults.length }} result(s)</p>
      <div
        v-for="result in store.searchResults"
        :key="result.id"
        @click="navigate(result.id)"
        class="glass-card p-4 cursor-pointer hover:border-surface-600/60 hover:bg-surface-800/40 transition-all space-y-1"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-surface-200">{{ result.title }}</span>
          <TagBadge variant="accent">{{ result.category }}</TagBadge>
        </div>
        <p class="text-xs text-surface-500">{{ result.description }}</p>
      </div>
    </div>

    <div v-else-if="store.searchQuery" class="text-center py-10 text-surface-500">
      No results for "{{ store.searchQuery }}"
    </div>
  </div>
</template>
