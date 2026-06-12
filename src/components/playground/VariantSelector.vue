<script setup lang="ts">
import type { ConfigVariant } from '../../types'
import TagBadge from '../ui/TagBadge.vue'

interface Props {
  variants: ConfigVariant[]
  activeId: string | null
}
const props = defineProps<Props>()
const emit = defineEmits<{ select: [v: ConfigVariant] }>()
</script>

<template>
  <div class="space-y-1">
    <!-- Variant cards -->
    <div class="px-3 py-2 space-y-2">
      <button
        v-for="variant in variants"
        :key="variant.id"
        @click="emit('select', variant)"
        class="w-full text-left p-3 rounded-xl border transition-all duration-150 space-y-1.5 group"
        :class="activeId === variant.id
          ? 'bg-accent-600/10 border-accent-500/40 ring-1 ring-accent-500/20'
          : 'bg-surface-800/30 border-surface-700/30 hover:bg-surface-800/60 hover:border-surface-600/50'"
      >
        <!-- Title row -->
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-semibold"
            :class="activeId === variant.id ? 'text-accent-300' : 'text-surface-300 group-hover:text-surface-200'">
            {{ variant.label }}
          </span>
        </div>

        <!-- Description -->
        <p v-if="variant.description" class="text-[11px] text-surface-500 leading-relaxed line-clamp-2">
          {{ variant.description }}
        </p>

        <!-- Tags -->
        <div v-if="variant.tags?.length" class="flex flex-wrap gap-1 pt-0.5">
          <TagBadge v-for="tag in variant.tags" :key="tag">#{{ tag }}</TagBadge>
        </div>

        <!-- Config preview -->
        <div class="mt-1.5 rounded-lg bg-surface-950/60 border border-surface-800/40 px-2.5 py-1.5 overflow-hidden">
          <div class="flex flex-wrap gap-x-3 gap-y-0.5">
            <span v-for="(val, key) in variant.values" :key="key"
              class="text-[10px]   whitespace-nowrap">
              <span class="text-violet-400">{{ key }}</span>
              <span class="text-surface-600">: </span>
              <span :class="typeof val === 'boolean' ? 'text-amber-400' : typeof val === 'number' ? 'text-blue-400' : 'text-emerald-400'">
                {{ JSON.stringify(val) }}
              </span>
            </span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
