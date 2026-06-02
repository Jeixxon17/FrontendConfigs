<script setup lang="ts">
import { computed, ref } from "vue";
import type { ConfigDoc } from "../../types";
import { useConfigsStore } from "../../stores/configs.store";
import TagBadge from "../ui/TagBadge.vue";
import BreadcrumbNavigation from "../ui/BreadcrumbNavigation.vue";
import PreviewCard from "../config/PreviewCard.vue";
import ConfigSnippet from "../config/ConfigSnippet.vue";
import DependencyCard from "../config/DependencyCard.vue";
import ConfigPlayground from "../playground/ConfigPlayground.vue";

const props = defineProps<{ doc: ConfigDoc }>();
const store = useConfigsStore();

const hasPlayground = computed(
  () =>
    (props.doc.variants?.length ?? 0) > 0 ||
    (props.doc.controls?.length ?? 0) > 0,
);

const tabs = computed(() => {
  const t: { id: string; label: string; count?: number }[] = [];
  if (hasPlayground.value)
    t.push({ id: "playground", label: "Vista principal" });
  t.push({ id: "configs", label: "Configuraciones" });
  t.push({
    id: "dependencies",
    label: "Dependencies",
    count: props.doc.dependencies?.length,
  });
  t.push({
    id: "changelog",
    label: "Changelog",
    count: props.doc.changelog?.length,
  });
  return t;
});

const activeTab = ref(hasPlayground.value ? "playground" : "configs");

const crumbs = computed(() => [
  { label: "Inicio", to: "/" },
  {
    label: props.doc.category,
    to: `/category/${props.doc.category.toLowerCase()}`,
  },
  { label: props.doc.title },
]);
</script>

<template>
  <article class="animate-fade-in">
    <!-- ── Doc Header (always visible) ─────────────────────────────────── -->
    <div class="mx-auto px-6 pt-8 pb-6 space-y-5">
      <BreadcrumbNavigation :crumbs="crumbs" />

      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-white font-display tracking-tight">
            {{ doc.title }}
          </h1>
          <p class="text-base text-surface-400 leading-relaxed max-w-2xl">
            {{ doc.description }}
          </p>
        </div>
      </div>

      <!-- Tags + meta row -->
      <div class="flex items-center gap-4 flex-wrap">
        <div v-if="doc.tags.length" class="flex flex-wrap gap-1.5">
          <TagBadge v-for="tag in doc.tags" :key="tag">#{{ tag }}</TagBadge>
        </div>
                  <div
            class="flex items-center gap-4 text-xs text-surface-600 ml-auto flex-wrap"
          >
            <span v-if="doc.author">by {{ doc.author }}</span>
            <span v-if="doc.updatedAt">
              {{
                doc.updatedAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }}
            </span>
            <span class="font-mono"
              >{{ doc.configs.length }} blocks ·
              {{ doc.dependencies?.length ?? 0 }} deps</span
            >
          </div>
      </div>
    </div>

    <!-- ── Tabs ──────────────────────────────────────────────────────────── -->
    <div
      class="border-b border-surface-800/60 px-6 sticky top-0 bg-surface-950/95 backdrop-blur z-20"
    >
      <div class="mx-auto flex items-center gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap shrink-0"
          :class="
            activeTab === tab.id
              ? 'border-accent-500 text-accent-400'
              : 'border-transparent text-surface-500 hover:text-surface-300 hover:border-surface-700'
          "
        >
          {{ tab.label }}
          <span
            v-if="tab.count"
            class="text-[10px] bg-surface-800 text-surface-500 px-1.5 py-0.5 rounded-full font-mono"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── Tab Content ────────────────────────────────────────────────────── -->

    <!-- PLAYGROUND TAB — full width, no max-w constraint -->
    <div
      v-if="activeTab === 'playground'"
      class="border border-surface-800/40 mx-6 mt-6 mb-8 rounded-2xl overflow-hidden"
    >
      <ConfigPlayground :doc="doc" :key="doc.id" />
    </div>

    <!-- CONFIGS TAB -->
    <div
      v-else-if="activeTab === 'configs'"
      class="max-w-4xl mx-auto px-6 py-6 space-y-5"
    >
      <PreviewCard
        v-if="doc.preview"
        :image-url="doc.preview"
        :title="doc.title"
      />
      <ConfigSnippet
        v-for="(config, i) in doc.configs"
        :key="i"
        :code="config.code"
        :title="config.title"
        :description="config.description"
        :label="`config-${i}`"
      />
    </div>

    <!-- DEPENDENCIES TAB -->
    <div
      v-else-if="activeTab === 'dependencies'"
      class="max-w-4xl mx-auto px-6 py-6"
    >
      <DependencyCard :dependencies="doc.dependencies || []" />
    </div>

    <!-- CHANGELOG TAB -->
    <div
      v-else-if="activeTab === 'changelog'"
      class="max-w-4xl mx-auto px-6 py-6 space-y-4"
    >
      <div v-if="doc.changelog?.length">
        <div
          v-for="(entry, i) in doc.changelog"
          :key="i"
          class="relative pl-6 pb-6 last:pb-0"
        >
          <div class="absolute left-0 top-2 bottom-0 w-px bg-surface-800" />
          <div
            class="absolute left-[-4px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-500 border-2 border-surface-950 shadow shadow-accent-500/30"
          />
          <div class="glass-card p-4 space-y-2">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="font-mono text-sm font-semibold text-accent-400"
                >v{{ entry.version }}</span
              >
              <span class="text-xs text-surface-600">{{ entry.date }}</span>
              <span v-if="entry.author" class="text-xs text-surface-600"
                >by {{ entry.author }}</span
              >
            </div>
            <ul class="space-y-1">
              <li
                v-for="(change, j) in entry.changes"
                :key="j"
                class="flex items-start gap-2 text-sm text-surface-400"
              >
                <span class="text-accent-500 mt-0.5 text-xs">▸</span
                >{{ change }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col items-center py-10 gap-2">
        <span class="text-2xl opacity-30">📋</span>
        <p class="text-sm text-surface-500">No changelog entries yet.</p>
      </div>
    </div>
  </article>
</template>
