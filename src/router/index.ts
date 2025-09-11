import { createRouter, createWebHistory } from 'vue-router'
import WeddingHome from '@/components/WeddingHome.vue'
import RSVPForm from '@/components/RSVPForm.vue'
import RehearsalDinner from '@/components/RehearsalDinner.vue'

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
  },
  {
    path: '/rehearsal-dinner',
    name: 'RehearsalDinner',
    component: RehearsalDinner
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 