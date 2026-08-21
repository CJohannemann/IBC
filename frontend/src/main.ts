import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import api from './api/client'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(router)

// A session can expire or be revoked mid-visit. When the server rejects one,
// drop the local state and send the user to the login page rather than letting
// the admin screens sit there failing silently.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url: string = error?.config?.url ?? ''

    // /auth/me and /auth/login answer 401 as a normal result, not a session loss.
    const isAuthProbe = url.includes('/auth/me') || url.includes('/auth/login')

    if (status === 401 && !isAuthProbe) {
      useAuthStore(pinia).clear()

      if (router.currentRoute.value.meta.requiresAuth) {
        router.push({
          path: '/admin/login',
          query: { redirect: router.currentRoute.value.fullPath },
        })
      }
    }

    return Promise.reject(error)
  }
)

app.mount('#app')
