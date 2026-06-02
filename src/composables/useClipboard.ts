// src/composables/useClipboard.ts
import { ref } from 'vue'
import { useConfigsStore } from '../stores/configs.store'

export function useClipboard() {
  const copied = ref<string | null>(null)
  const store = useConfigsStore()

  async function copy(text: string, label = 'id') {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = label
      store.notify('success', 'Copied to clipboard!')
      setTimeout(() => { copied.value = null }, 2000)
    } catch {
      store.notify('error', 'Failed to copy')
    }
  }

  function copyJSON(obj: unknown, label?: string) {
    copy(JSON.stringify(obj, null, 2), label)
  }

  function isCopied(label: string) {
    return copied.value === label
  }

  return { copy, copyJSON, isCopied }
}
