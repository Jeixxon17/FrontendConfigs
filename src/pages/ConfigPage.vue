<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigsStore } from '../stores/configs.store'
import DocumentationSection from '../components/config/DocumentationSection.vue'
import LoadingSkeleton from '../components/ui/LoadingSkeleton.vue'
import EmptyState from '../components/ui/EmptyState.vue'

const props = defineProps<{ slug: string }>()
const store = useConfigsStore()
const router = useRouter()

const doc = computed(() => store.docs.find(d => d.slug === props.slug) || null)

watch(() => props.slug, (slug) => {
  const found = store.docs.find(d => d.slug === slug)
  if (found) store.setActive(found.id)
}, { immediate: true })

watch(doc, (d) => {
  if (d) store.setActive(d.id)
})
</script>

<template>
  <div>
    <template v-if="store.loading">
      <div class="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <LoadingSkeleton :lines="2" />
        <div class="h-10 bg-surface-800 rounded-xl animate-pulse" />
        <LoadingSkeleton :lines="4" />
        <div class="h-40 bg-surface-800 rounded-xl animate-pulse" />
        <LoadingSkeleton :lines="5" />
      </div>
    </template>

    <DocumentationSection v-else-if="doc" :doc="doc" :key="doc.id" />

    <EmptyState
      v-else
      title="Configuration not found"
      description="This configuration doesn't exist or may have been removed."
      icon="🔍"
    >
      <button @click="router.push('/')" class="btn-primary mt-4">
        ← Back to overview
      </button>
    </EmptyState>
  </div>
</template>
