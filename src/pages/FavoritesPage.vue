<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useConfigsStore } from '../stores/configs.store'
import TagBadge from '../components/ui/TagBadge.vue'
import EmptyState from '../components/ui/EmptyState.vue'

const store = useConfigsStore()
const router = useRouter()

function navigate(slug: string, id: string) {
  store.setActive(id)
  router.push({ name: 'config', params: { slug } })
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-10 space-y-6">
    <div>
      <p class="text-xs text-surface-600 uppercase tracking-widest   mb-1">Saved</p>
      <h1 class="text-3xl font-bold text-white font-display">Favorites</h1>
    </div>

    <div v-if="store.favoritesDocs.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        v-for="doc in store.favoritesDocs"
        :key="doc.id"
        @click="navigate(doc.slug, doc.id)"
        class="group text-left glass-card p-5 hover:border-rose-500/20 hover:bg-surface-800/40 transition-all space-y-3"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <TagBadge variant="accent" class="mb-1.5">{{ doc.category }}</TagBadge>
            <h3 class="text-base font-semibold text-surface-200 group-hover:text-white transition-colors">{{ doc.title }}</h3>
          </div>
          <button
            @click.stop="store.toggleFavorite(doc.id)"
            class="text-rose-400 hover:text-rose-300 p-1 transition-colors"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        </div>
        <p class="text-sm text-surface-500 line-clamp-2">{{ doc.description }}</p>
      </button>
    </div>

    <EmptyState
      v-else
      title="No favorites yet"
      description="Click the Save button on any configuration to add it here."
      icon="🤍"
    >
      <button @click="router.push('/')" class="btn-primary mt-4">Browse configs</button>
    </EmptyState>
  </div>
</template>
