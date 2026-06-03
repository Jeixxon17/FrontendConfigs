<script setup lang="ts">
import type { PlaygroundControl } from '../../types'

interface Props {
  controls: PlaygroundControl[]
  modelValue: Record<string, unknown>
}
const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [v: Record<string, unknown>] }>()

function update(key: string, value: unknown) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function reset() {
  const defaults: Record<string, unknown> = {}
  props.controls.forEach(c => { defaults[c.key] = c.defaultValue })
  emit('update:modelValue', defaults)
}

function getVal(key: string) {
  return props.modelValue[key]
}
</script>

<template>
  <div class="space-y-1">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-surface-800/60">
      <div class="flex items-center gap-2">
        <span class="text-[10px] text-surface-600   uppercase tracking-widest">Controls</span>
        <span class="text-[10px] bg-surface-800 text-surface-500 px-1.5 py-0.5 rounded-full  ">{{ controls.length }}</span>
      </div>
      <button @click="reset"
        class="text-[10px] text-surface-600 hover:text-surface-300 transition-colors flex items-center gap-1  ">
        ↺ Reset
      </button>
    </div>

    <!-- Controls list -->
    <div class="px-3 py-2 space-y-3">
      <div v-for="ctrl in controls" :key="ctrl.key" class="space-y-1.5">
        <!-- Label + key -->
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium text-surface-300">{{ ctrl.label }}</label>
          <span class="text-[10px]   text-surface-600 bg-surface-800/60 px-1.5 py-0.5 rounded">{{ ctrl.key }}</span>
        </div>

        <!-- SELECT -->
        <select v-if="ctrl.type === 'select'"
          :value="getVal(ctrl.key) as string"
          @change="update(ctrl.key, (ctrl.options?.find(o => String(o.value) === ($event.target as HTMLSelectElement).value)?.value ?? ($event.target as HTMLSelectElement).value))"
          class="w-full bg-surface-800/80 border border-surface-700/60 rounded-lg px-3 py-2 text-xs text-surface-200 focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/20 transition-all appearance-none cursor-pointer"
        >
          <option v-for="opt in ctrl.options" :key="String(opt.value)"
            :value="String(opt.value)"
            :selected="getVal(ctrl.key) === opt.value">
            {{ opt.label }}
          </option>
        </select>

        <!-- TOGGLE -->
        <div v-else-if="ctrl.type === 'toggle'"
          class="flex items-center justify-between bg-surface-800/40 rounded-lg px-3 py-2 border border-surface-700/30">
          <span class="text-xs text-surface-400">{{ getVal(ctrl.key) ? 'Enabled' : 'Disabled' }}</span>
          <button
            @click="update(ctrl.key, !getVal(ctrl.key))"
            class="relative w-9 h-5 rounded-full transition-all duration-200 focus:outline-none"
            :class="getVal(ctrl.key) ? 'bg-accent-600' : 'bg-surface-700'"
          >
            <span class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
              :class="getVal(ctrl.key) ? 'left-[18px]' : 'left-0.5'" />
          </button>
        </div>

        <!-- RANGE -->
        <div v-else-if="ctrl.type === 'range'" class="space-y-1">
          <div class="flex items-center gap-3">
            <input
              type="range"
              :value="Number(getVal(ctrl.key))"
              :min="ctrl.min ?? 0"
              :max="ctrl.max ?? 100"
              :step="ctrl.step ?? 1"
              @input="update(ctrl.key, Number(($event.target as HTMLInputElement).value))"
              class="flex-1 accent-accent-500 h-1.5 rounded-full bg-surface-700 appearance-none cursor-pointer"
            />
            <span class="text-xs   text-accent-400 w-6 text-right">{{ getVal(ctrl.key) }}</span>
          </div>
          <div class="flex justify-between text-[10px] text-surface-700  ">
            <span>{{ ctrl.min }}</span><span>{{ ctrl.max }}</span>
          </div>
        </div>

        <!-- NUMBER -->
        <input v-else-if="ctrl.type === 'number'"
          type="number"
          :value="Number(getVal(ctrl.key))"
          :min="ctrl.min"
          :max="ctrl.max"
          :step="ctrl.step ?? 1"
          @input="update(ctrl.key, Number(($event.target as HTMLInputElement).value))"
          class="w-full bg-surface-800/80 border border-surface-700/60 rounded-lg px-3 py-2 text-xs text-surface-200 focus:outline-none focus:border-accent-500/60 transition-all  "
        />

        <!-- TEXT -->
        <input v-else-if="ctrl.type === 'text'"
          type="text"
          :value="String(getVal(ctrl.key))"
          @input="update(ctrl.key, ($event.target as HTMLInputElement).value)"
          class="w-full bg-surface-800/80 border border-surface-700/60 rounded-lg px-3 py-2 text-xs text-surface-200 focus:outline-none focus:border-accent-500/60 transition-all"
        />

        <!-- COLOR -->
        <div v-else-if="ctrl.type === 'color'" class="flex items-center gap-3">
          <input
            type="color"
            :value="String(getVal(ctrl.key))"
            @input="update(ctrl.key, ($event.target as HTMLInputElement).value)"
            class="w-9 h-9 rounded-lg border border-surface-700/60 bg-surface-800 cursor-pointer p-0.5"
          />
          <span class="text-xs   text-surface-400">{{ getVal(ctrl.key) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
