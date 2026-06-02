<script setup lang="ts">
interface Props {
  variant?: 'default' | 'required' | 'optional' | 'compatible' | 'deprecated' | 'stable' | 'beta' | 'experimental' | 'accent'
  size?: 'sm' | 'md'
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
})

const variantClasses: Record<string, string> = {
  default: 'bg-surface-800 text-surface-400 border-surface-700/50',
  required: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  optional: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  compatible: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  deprecated: 'bg-surface-700/50 text-surface-500 border-surface-600/30 line-through',
  stable: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  beta: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  experimental: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  accent: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
}
</script>

<template>
  <span
    class="tag-badge border font-mono"
    :class="[variantClasses[variant], size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5']"
  >
    <slot />
  </span>
</template>
