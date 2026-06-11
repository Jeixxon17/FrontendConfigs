<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConfigsStore } from '../stores/configs.store'
import SidebarNavigation from '../components/layout/SidebarNavigation.vue'
import SearchInput from '../components/layout/SearchInput.vue'
import NotificationToast from '../components/ui/NotificationToast.vue'

const store = useConfigsStore()
const sidebarCollapsed = ref(false)
const mobileDrawerOpen = ref(false)
const searchOpen = ref(false)

onMounted(() => {
  store.subscribe()
})

function toggleSidebar() {
  if (window.innerWidth < 768) {
    mobileDrawerOpen.value = !mobileDrawerOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}
</script>

<template>
  <div class="flex h-screen bg-surface-950 overflow-hidden">

    <!-- Mobile overlay -->
    <Transition name="fade">
      <div
        v-if="mobileDrawerOpen"
        class="fixed inset-0 z-40 bg-surface-950/80 backdrop-blur-sm md:hidden"
        @click="mobileDrawerOpen = false"
      />
    </Transition>

    <!-- Sidebar (desktop) -->
    <div class="hidden md:flex shrink-0 transition-all duration-300 relative z-10"
      :style="sidebarCollapsed ? 'width: 0' : 'width: var(--sidebar-width)'">
      <SidebarNavigation
        :collapsed="sidebarCollapsed"
        @update:collapsed="sidebarCollapsed = $event"
        @search="searchOpen = true"
      />
    </div>

    <!-- Mobile Drawer -->
    <Transition name="drawer">
      <div v-if="mobileDrawerOpen"
        class="fixed top-0 left-0 h-full z-50 md:hidden shadow-2xl"
        style="width: var(--sidebar-width)"
      >
        <SidebarNavigation
          :collapsed="false"
          @search="searchOpen = true; mobileDrawerOpen = false"
          @select="mobileDrawerOpen = false"
        />
      </div>
    </Transition>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top bar -->
      <header class="shrink-0 md:hidden flex items-center justify-between px-4 sm:px-6 border-b border-surface-800/60 bg-surface-950/80 backdrop-blur-md z-10"
        style="height: var(--header-height)">
        <div class="flex items-center gap-3">
          <!-- Hamburger / collapse toggle -->
          <button
            @click="toggleSidebar"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Mobile logo -->
          <div class="flex items-center gap-2 md:hidden">
            <span class="text-sm font-bold text-surface-100 font-display">{ Frontend Configs }</span>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
    <!-- Notifications -->
    <NotificationToast />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.drawer-enter-active, .drawer-leave-active { transition: transform 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(-100%); }

.page-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-leave-active { transition: opacity 0.15s ease; }
.page-enter-from { opacity: 0; transform: translateY(6px); }
.page-leave-to { opacity: 0; }
</style>
