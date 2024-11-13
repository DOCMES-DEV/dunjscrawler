import { createRouter, createWebHistory } from 'vue-router'
import TestView from '@/views/TestView.vue'
import TestRyan from '@/views/TestRyan.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'test',
      component: TestView,
    },
    {
      path: '/testing',
      name: 'testing',
      component: TestRyan,
    },
  ],
})

export default router
