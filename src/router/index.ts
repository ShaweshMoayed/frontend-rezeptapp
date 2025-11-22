import { createRouter, createWebHistory } from 'vue-router'
import RezeptView from '../views/RezeptView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'rezepte',
      component: RezeptView, // Hauptseite mit Rezeptübersicht
    },
  ],
})

export default router
