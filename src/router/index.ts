import { createRouter, createWebHistory } from 'vue-router'
import WeddingHome from '@/components/WeddingHome.vue'
import RSVPForm from '@/components/RSVPForm.vue'
import RehearsalDinner from '@/components/RehearsalDinner.vue'
import PhotoCollage from '@/components/PhotoCollage.vue'

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
  },
  {
    path: '/photo-collage',
    name: 'PhotoCollage',
    component: PhotoCollage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 