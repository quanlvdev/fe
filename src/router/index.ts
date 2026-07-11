import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import TasksView from '@/views/TasksView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/tasks',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TasksView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async to => {
  const auth = useAuthStore()

  if (auth.state.token && !auth.state.user) {
    await auth.loadUser()
  }

  if (to.meta.requiresAuth && !auth.state.token) {
    return { name: 'login' }
  }

  if (to.meta.guest && auth.state.token) {
    return { name: 'tasks' }
  }

  return true
})

export default router
