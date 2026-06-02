<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfigsStore } from '../../stores/configs.store'
import type { Category } from '../../types'

const props = defineProps<{ category: Category; searchQuery?: string }>()
const emit = defineEmits<{ select: [id: string, slug: string]; search: [] }>()

const store = useConfigsStore()
const router = useRouter()
const open = ref(true)

const filteredItems = computed(() => {
  if (!props.searchQuery) return props.category.items
  const q = props.searchQuery.toLowerCase()
  return props.category.items.filter(i => i.title.toLowerCase().includes(q))
})

function navigate(item: { id: string; slug: string }) {
  store.setActive(item.id)
  router.push({ name: 'config', params: { slug: item.slug } })
  emit('select', item.id, item.slug)
}

function isActive(id: string) {
  return store.activeId === id
}
</script>

<template>
  <div v-if="filteredItems.length">
    <!-- Category header -->
    <button
      @click="open = !open"
      class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-800/40 transition-all duration-150 group"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-surface-400 group-hover:text-surface-300 uppercase tracking-widest font-display transition-colors">
          {{ category.name }}
        </span>
        <span class="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded-full">
          {{ filteredItems.length }}
        </span>
      </div>
      <svg
        class="w-3.5 h-3.5 text-surface-600 transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <!-- Items -->
    <Transition name="accordion">
      <div v-if="open" class="ml-3 mt-0.5 space-y-0.5 border-l border-surface-800/60 pl-2.5">
        <button
          v-for="item in filteredItems"
          :key="item.id"
          @click="navigate(item)"
          class="relative w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-sm transition-all duration-150"
          :class="isActive(item.id)
            ? 'bg-accent-600/15 text-accent-300 font-medium'
            : 'text-surface-500 hover:text-surface-200 hover:bg-surface-800/40'"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0 bg-surface-600"
            />
            <span class="truncate text-left">{{ item.title }}</span>
          </div>
          <svg v-if="isActive(item.id)" class="w-3 h-3 shrink-0 text-green-400" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3"/>
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.accordion-enter-active, .accordion-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.accordion-enter-from, .accordion-leave-to {
  opacity: 0;
  max-height: 0;
}
.accordion-enter-to, .accordion-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
