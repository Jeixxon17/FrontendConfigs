// src/composables/useSearch.ts
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigsStore } from '../stores/configs.store'

export function useSearch() {
  const store = useConfigsStore()
  const router = useRouter()
  const isOpen = ref(false)

  function open() { isOpen.value = true }
  function close() {
    isOpen.value = false
    store.searchQuery = ''
  }

  function selectResult(id: string) {
    const doc = store.docs.find(d => d.id === id)
    if (doc) {
      router.push({ name: 'config', params: { slug: doc.slug } })
      store.setActive(id)
    }
    close()
  }

  // Keyboard shortcut
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        isOpen.value = !isOpen.value
      }
      if (e.key === 'Escape') close()
    })
  }

  return { isOpen, open, close, selectResult }
}
