<script setup lang="ts">
import { useConfigsStore } from '../../stores/configs.store'
const store = useConfigsStore()

const iconMap = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}
const colorMap = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  info: 'border-accent-500/30 bg-accent-500/10 text-accent-300',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
        <div
          v-for="n in store.notifications"
          :key="n.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl backdrop-blur-xl min-w-[220px]"
          :class="colorMap[n.type]"
        >
          <span class="text-base font-bold">{{ iconMap[n.type] }}</span>
          <span>{{ n.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active { transition: all 0.25s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateY(12px) scale(0.95); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
