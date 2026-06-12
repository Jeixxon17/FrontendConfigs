<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigsStore } from '../stores/configs.store'
import { configsService } from '../services/configs.service'
import AdminDocForm from '../components/admin/AdminDocForm.vue'
import TagBadge from '../components/ui/TagBadge.vue'
import type { ConfigDoc } from '../types'

const store = useConfigsStore()
const router = useRouter()

const view = ref<'list' | 'create' | 'edit'>('list')
const editingDoc = ref<ConfigDoc | null>(null)
const deletingId = ref<string | null>(null)
const searchQuery = ref('')

const filteredDocs = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return store.docs
  return store.docs.filter(d =>
    d.title.toLowerCase().includes(q) ||
    d.category.toLowerCase().includes(q) ||
    d.slug.includes(q)
  )
})

function startEdit(doc: ConfigDoc) {
  editingDoc.value = doc
  view.value = 'edit'
}

function startCreate() {
  editingDoc.value = null
  view.value = 'create'
}

async function deleteDoc(id: string) {
  if (!confirm('Delete this configuration? This cannot be undone.')) return
  deletingId.value = id
  try {
    await configsService.delete(id)
    store.docs = store.docs.filter(d => d.id !== id)
    store.notify('success', 'Configuration deleted.')
  } catch {
    store.notify('error', 'Failed to delete. Check Firebase config.')
  } finally {
    deletingId.value = null
  }
}

function onSaved(id: string) {
  view.value = 'list'
  router.push({ name: 'config', params: { slug: store.docs.find(d => d.id === id)?.slug ?? '' } })
}
</script>

<template>
  <div class="h-full flex flex-col">

    <!-- List view -->
    <template v-if="view === 'list'">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-surface-800/60 shrink-0">
        <button @click="startCreate" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Agregar nueva configuración
        </button>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-y-auto">
        <table v-if="filteredDocs.length" class="w-full">
          <thead class="sticky top-0 bg-surface-950/95 backdrop-blur z-10">
            <tr class="border-b border-surface-800/60">
              <th class="text-left text-[10px] text-white  uppercase tracking-widest px-6 py-3">configuraciones</th>
              <th class="text-left text-[10px] text-white  uppercase tracking-widest px-4 py-3 hidden sm:table-cell">Categoria</th>
              <th class="text-left text-[10px] text-white  uppercase tracking-widest px-4 py-3 hidden lg:table-cell">Variantes</th>
              <th class="text-right text-[10px] text-white  uppercase tracking-widest px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-800/30">
            <tr v-for="doc in filteredDocs" :key="doc.id"
              class="group hover:bg-surface-900/40 transition-colors">
              <td class="px-6 py-3.5">
                <div>
                  <p class="text-sm font-medium text-surface-200 group-hover:text-white transition-colors">{{ doc.title }}</p>
                  <p class="text-[10px] text-surface-600   mt-0.5">/config/{{ doc.slug }}</p>
                </div>
              </td>
              <td class="px-4 py-3.5 hidden sm:table-cell">
                <TagBadge variant="accent">{{ doc.category }}</TagBadge>
              </td>
              <td class="px-4 py-3.5 hidden lg:table-cell">
                <span class="text-xs text-surface-600  ">
                  {{ doc.variants?.length ?? 0 }} Versiones
                </span>
              </td>
              <td class="px-6 py-3.5">
                <div class="flex items-center justify-end gap-1.5">
                  <RouterLink :to="{ name: 'config', params: { slug: doc.slug } }"
                    class="btn-ghost text-xs px-2.5 py-1.5">
                    Visualizar
                  </RouterLink>
                  <button @click="startEdit(doc)" class="btn-ghost text-xs px-2.5 py-1.5">
                    Editar
                  </button>
                  <button @click="deleteDoc(doc.id)"
                    :disabled="deletingId === doc.id"
                    class="px-2.5 py-1.5 text-xs rounded-lg text-surface-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-40">
                    {{ deletingId === doc.id ? '…' : 'Eliminar' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Create / Edit view -->
    <template v-else>
      <AdminDocForm
        :existing="editingDoc ?? undefined"
        @saved="onSaved"
        @cancel="view = 'list'"
        class="flex-1 overflow-hidden"
      />
    </template>
  </div>
</template>
