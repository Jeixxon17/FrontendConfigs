<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useConfigsStore } from "../../stores/configs.store";
import CategoryAccordion from "./CategoryAccordion.vue";

const props = defineProps<{ collapsed: boolean }>();
const emit = defineEmits<{ "update:collapsed": [v: boolean]; search: [] }>();

const store = useConfigsStore();
const router = useRouter();
const localSearch = ref("");

const categories = computed(() => store.categories);

function goHome() {
  router.push({ name: "home" });
  store.setActive(null);
}

function goFavorites() {
  router.push({ name: "favorites" });
  store.setActive(null);
}

function openSearch() {
  emit("update:collapsed", false);
}
</script>

<template>
  <aside
    class="flex flex-col h-full bg-surface-950 border-r border-surface-800/60 transition-all duration-300 ease-in-out overflow-hidden"
    :style="
      collapsed
        ? 'width: 0; min-width: 0; border: none'
        : 'width: var(--sidebar-width); min-width: var(--sidebar-width)'
    "
  >
    <div class="flex flex-col h-full min-w-[260px]">
      <!-- Logo -->
      <div class="flex items-center justify-center px-4 pt-5 pb-4 shrink-0">
        <button @click="goHome" class="flex items-center gap-3 group">
          <div class="leading-tight">
            <div
              class="text-lg font-bold text-surface-100 font-display group-hover:text-white transition-colors"
            >
              { Frontend Configs }
            </div>
          </div>
        </button>
      </div>

      <!-- Inline filter -->
      <div class="px-3 mb-2 shrink-0">
        <div class="relative">
          <input
            v-model="localSearch"
            type="text"
            placeholder="Buscar configuraciones"
            class="w-full bg-surface-800/30 border border-surface-700/30 rounded-lg px-3 py-1.5 text-xs text-surface-300 placeholder-surface-600 focus:outline-none focus:border-accent-500/40 transition-all"
          />
        </div>
      </div>

      <!-- Categories scroll area -->
      <div class="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
        <div v-if="store.loading" class="space-y-2 px-2">
          <div
            v-for="i in 5"
            :key="i"
            class="h-7 bg-surface-800/50 rounded-lg animate-pulse"
          />
        </div>

        <template v-else>
          <CategoryAccordion
            v-for="cat in categories"
            :key="cat.id"
            :category="cat"
            :search-query="localSearch"
            @search="$emit('search')"
          />
        </template>
      </div>

      <!-- Admin link + Footer -->
      <div class="shrink-0 border-t border-surface-800/40">
        <div class="flex flex-col items-center p-2 text-[12px] text-surface-700 font-mono">
          <span>&copy; 2026 Jeison Martinez.</span>
          <span>Todos los derechos reservados.</span>
        </div>
      </div>
    </div>
  </aside>
</template>
