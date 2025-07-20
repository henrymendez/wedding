import { createRouter, createWebHistory } from 'vue-router'
import WeddingHome from '@/components/WeddingHome.vue'
import RSVPForm from '@/components/RSVPForm.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: WeddingHome
  },
  {
    path: '/rsvp',
    name: 'RSVP',
    component: RSVPForm
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 