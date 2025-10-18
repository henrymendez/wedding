import { createRouter, createWebHistory } from 'vue-router'
import WeddingHome from '@/components/WeddingHome.vue'
import RSVPForm from '@/components/RSVPForm.vue'
import RehearsalDinner from '@/components/RehearsalDinner.vue'
import PhotoCollage from '@/components/PhotoCollage.vue'
import BridalParty from '@/components/BridalParty.vue'

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
  },
  {
    path: '/bridal-party',
    name: 'BridalParty',
    component: BridalParty
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 