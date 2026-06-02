import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: (_to, _from, savedPosition) => {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      component: () => import('../layouts/AppLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('../pages/HomePage.vue') },
        { path: 'config/:slug', name: 'config', component: () => import('../pages/ConfigPage.vue'), props: true },
        { path: 'category/:category', name: 'category', component: () => import('../pages/CategoryPage.vue'), props: true },
        { path: 'favorites', name: 'favorites', component: () => import('../pages/FavoritesPage.vue') },
        { path: 'search', name: 'search', component: () => import('../pages/SearchPage.vue') },
        { path: 'admin', name: 'admin', component: () => import('../pages/AdminPage.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
