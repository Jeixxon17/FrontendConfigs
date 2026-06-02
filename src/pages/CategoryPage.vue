<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigsStore } from '../stores/configs.store'
import TagBadge from '../components/ui/TagBadge.vue'
import EmptyState from '../components/ui/EmptyState.vue'

const props = defineProps<{ category: string }>()
const store = useConfigsStore()
const router = useRouter()

const docs = computed(() =>
  store.docs.filter(d => d.category.toLowerCase() === props.category.toLowerCase())
)

function navigate(slug: string, id: string) {
  store.setActive(id)
  router.push({ name: 'config', params: { slug } })
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-10 space-y-6">
    <div>
      <p class="text-xs text-surface-600 uppercase tracking-widest font-mono mb-1">Category</p>
      <h1 class="text-3xl font-bold text-white font-display capitalize">{{ category }}</h1>
    </div>

    <div v-if="docs.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        v-for="doc in docs"
        :key="doc.id"
        @click="navigate(doc.slug, doc.id)"
        class="group text-left glass-card p-5 hover:border-surface-600/60 hover:bg-surface-800/40 transition-all space-y-3"
      >
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-base font-semibold text-surface-200 group-hover:text-white transition-colors">{{ doc.title }}</h3>
          <TagBadge v-if="doc.status" :variant="doc.status as any">{{ doc.status }}</TagBadge>
        </div>
        <p class="text-sm text-surface-500 line-clamp-2">{{ doc.description }}</p>
        <div class="flex flex-wrap gap-1">
          <TagBadge v-for="tag in doc.tags.slice(0, 3)" :key="tag">#{{ tag }}</TagBadge>
        </div>
      </button>
    </div>

    <EmptyState v-else :title="`No configs in ${category}`" description="No configurations found for this category." />
  </div>
</template>
