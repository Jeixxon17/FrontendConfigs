// src/stores/configs.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { configsService, buildCategories } from '../services/configs.service'
import type { ConfigDoc, Category, SearchResult, AppNotification } from '../types'

export const useConfigsStore = defineStore('configs', () => {
  const docs = ref<ConfigDoc[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const activeId = ref<string | null>(null)
  const favorites = ref<Set<string>>(new Set(JSON.parse(localStorage.getItem('favorites') || '[]')))
  const recentlyViewed = ref<string[]>(JSON.parse(localStorage.getItem('recentlyViewed') || '[]'))
  const notifications = ref<AppNotification[]>([])
  let unsubscribe: (() => void) | null = null

  const categories = computed<Category[]>(() => buildCategories(docs.value))

  const activeDoc = computed(() =>
    docs.value.find(d => d.id === activeId.value) || null
  )

  const searchResults = computed<SearchResult[]>(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return []
    return docs.value
      .filter(d => {
        const inTitle = d.title.toLowerCase().includes(q)
        const inDesc = d.description.toLowerCase().includes(q)
        const inCat = d.category.toLowerCase().includes(q)
        const inTags = d.tags.some(t => t.toLowerCase().includes(q))
        const inConfig = d.configs.some(c =>
          JSON.stringify(c.code).toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
        )
        return inTitle || inDesc || inCat || inTags || inConfig
      })
      .map(d => ({
        id: d.id,
        title: d.title,
        category: d.category,
        slug: d.slug,
        description: d.description,
        tags: d.tags,
        matchType: d.title.toLowerCase().includes(q)
          ? 'title' as const
          : d.tags.some(t => t.toLowerCase().includes(q))
          ? 'tag' as const
          : 'description' as const,
      }))
      .slice(0, 8)
  })

  const favoritesDocs = computed(() =>
    docs.value.filter(d => favorites.value.has(d.id))
  )

  const recentDocs = computed(() =>
    recentlyViewed.value
      .map(id => docs.value.find(d => d.id === id))
      .filter(Boolean) as ConfigDoc[]
  )

  async function fetchDocs() {
    loading.value = true
    error.value = null
    try {
      docs.value = await configsService.getAll()
    } catch (e) {
      error.value = 'Failed to load configurations'
    } finally {
      loading.value = false
    }
  }

  function subscribe() {
    loading.value = true
    unsubscribe = configsService.subscribeToAll((newDocs) => {
      docs.value = newDocs
      loading.value = false
    })
  }

  function unsubscribeAll() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  function setActive(id: string | null) {
    activeId.value = id
    if (id) {
      const recent = recentlyViewed.value.filter(r => r !== id)
      recent.unshift(id)
      recentlyViewed.value = recent.slice(0, 10)
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed.value))
    }
  }

  function toggleFavorite(id: string) {
    if (favorites.value.has(id)) {
      favorites.value.delete(id)
    } else {
      favorites.value.add(id)
    }
    localStorage.setItem('favorites', JSON.stringify([...favorites.value]))
  }

  function isFavorite(id: string) {
    return favorites.value.has(id)
  }

  function notify(type: AppNotification['type'], message: string, duration = 3000) {
    const notification: AppNotification = {
      id: Date.now().toString(),
      type,
      message,
      duration,
    }
    notifications.value.push(notification)
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== notification.id)
    }, duration)
  }

  return {
    docs, loading, error, searchQuery, activeId, favorites,
    recentlyViewed, notifications, categories, activeDoc,
    searchResults, favoritesDocs, recentDocs,
    fetchDocs, subscribe, unsubscribeAll, setActive,
    toggleFavorite, isFavorite, notify,
  }
})
