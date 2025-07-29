<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Wedding details
const weddingDetails = {
  date: 'Friday, October 31, 2025',
  venue: 'The Palace at Somerset',
  time: '6:00 PM',
  dressCode: 'Formal'
}

// All wedding images from the public/images directory
const images = [
  '/images/PXL_20250221_172015897.jpg',
  '/images/PXL_20201221_003043066.NIGHT.jpg',
  '/images/PXL_20210814_002518125.NIGHT.jpg',
  '/images/PXL_20210911_191955906.jpg',
  '/images/PXL_20211219_033745888.NIGHT.jpg',
  '/images/PXL_20220101_051433994.PORTRAIT.jpg',
  '/images/PXL_20220707_161044318.jpg',
  '/images/PXL_20220711_200245282.jpg',
  '/images/PXL_20221028_163120890.jpg',
  '/images/PXL_20221104_161821898.jpg',
  '/images/PXL_20221210_024402467.NIGHT.jpg',
  '/images/PXL_20230528_233916713.jpg',
  '/images/PXL_20230930_135224496.jpg',
  '/images/PXL_20231001_213432746.NIGHT.jpg',
  '/images/PXL_20231003_163732272.jpg',
  '/images/PXL_20240203_202333638.jpg',
  '/images/PXL_20250219_165314687.PORTRAIT.jpg'
]

const currentImageIndex = ref(0)
let imageInterval: number | NodeJS.Timeout | null = null


const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.length
  // Disable auto-scroll when user manually navigates
  disableAutoScroll()
}

const previousImage = () => {
  currentImageIndex.value = currentImageIndex.value === 0 ? images.length - 1 : currentImageIndex.value - 1
  // Disable auto-scroll when user manually navigates
  disableAutoScroll()
}

const disableAutoScroll = () => {
  if (imageInterval) {
    clearInterval(imageInterval)
    imageInterval = null
  }
}

const goToImage = (index: number) => {
  currentImageIndex.value = index
}



const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

const loadAddCalScript = () => {
  // Check if script is already loaded
  if (document.querySelector('script[src*="addcal.co"]')) {
    return
  }
  
  const script = document.createElement('script')
  script.src = 'https://cdn.addcal.co/embed/1.1.0/button.min.js'
  script.async = true
  document.head.appendChild(script)
}

const goToRSVP = () => {
  router.push('/rsvp')
}

onMounted(() => {
  imageInterval = setInterval(nextImage, 3000)
  // Load AddCal script when component mounts
  loadAddCalScript()
})

onUnmounted(() => {
  if (imageInterval) {
    clearInterval(imageInterval)
  }
})
</script>

<template>
  <div class="wedding-homepage">
    <!-- Header -->
    <header class="header">
      <h1 class="title">Laura & Quique</h1>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Left Side - Wedding Details -->
      <section class="wedding-details">
        <div class="details-card">
          <h2 class="section-title">Wedding Details</h2>
          
          <div class="detail-item">
            <div class="detail-content">
              <h3>When</h3>
              <p class="date">{{ weddingDetails.date }}</p>
              <p class="time">{{ weddingDetails.time }}</p>
              
              <!-- Calendar Button -->
              <div class="calendar-container">
                <div class="addcal-btn" data-event="20dq5e64mkuc" data-base="undefined" data-theme="light"></div>
              </div>
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-content">
              <h3>Where</h3>
              <a href="https://maps.app.goo.gl/CamNr3zETk7c9nAb8" target="_blank" rel="noopener noreferrer" class="venue-link">
                <p>{{ weddingDetails.venue }}</p>
                <p class="address">333 Davidson Ave, Somerset, NJ 08873</p>
              </a>
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-content">
              <h3>Dress Code</h3>
              <p>{{ weddingDetails.dressCode }}</p>
            </div>
          </div>

          <div class="rsvp-section">
            <h3>RSVP</h3>
            <p>Please RSVP by September 30, 2025</p>
            <button class="rsvp-button" @click="goToRSVP">RSVP Now</button>
          </div>
        </div>
      </section>

      <!-- Right Side - Image Carousel -->
      <section class="image-gallery">
        <div class="carousel-wrapper">
          <div class="image-container">
            <img 
              :src="images[currentImageIndex]" 
              :alt="`Wedding image ${currentImageIndex + 1}`"
              class="carousel-image"
              @error="handleImageError"
            />
            
            <!-- Navigation Arrows -->
            <button class="nav-arrow nav-prev" @click="previousImage">
              <span>‹</span>
            </button>
            <button class="nav-arrow nav-next" @click="nextImage">
              <span>›</span>
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>See you there!</p>
    </footer>
  </div>
</template>

<style scoped>
.wedding-homepage {
  min-height: 100vh;
  background: #9CAF88 !important;
  background-image: url('/border-1.svg') !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  background-attachment: scroll !important;
  font-family: 'Playfair Display', serif;
  color: #2c3e50;
  position: relative;
  z-index: 1;
  /* Safari performance optimizations */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.header {
  text-align: center;
  padding: 3rem 2rem 2rem;
  background: rgba(244, 240, 235, 0.5);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  /* Safari performance optimizations */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.title {
  font-size: 3.5rem;
  font-weight: 400;
  margin: 0;
  background: #DBA400;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.5rem;
  margin: 0.5rem 0 0;
  color: #7f8c8d;
  font-style: italic;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 60vh;
}

.wedding-details {
  display: flex;
  align-items: center;
  justify-content: center;
}

.details-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 500px;
}

.section-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-weight: 400;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 15px;
  background: rgba(102, 126, 234, 0.05);
  border-left: 4px solid #667eea;
}

.detail-icon {
  font-size: 2rem;
  margin-right: 1rem;
  margin-top: 0.25rem;
}

.detail-content {
  position: relative;
}

.detail-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #667eea;
  font-weight: 600;
}

.detail-content p {
  margin: 0.25rem 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.time, .address {
  font-size: 0.9rem !important;
  color: #7f8c8d !important;
  font-style: italic;
}

.venue-link {
  text-decoration: none;
  color: inherit;
  transition: color 0.3s ease;
}

.venue-link:hover {
  color: #667eea;
}



.calendar-container {
  margin-top: 1rem;
}



.rsvp-section {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
}

.rsvp-section h3 {
  margin: 0 0 0.5rem 0;
  color: #667eea;
}

.rsvp-section p {
  margin: 0 0 1rem 0;
  color: #7f8c8d;
}

.rsvp-button {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.rsvp-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
}

.image-gallery {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.carousel-wrapper {
  width: 100%;
  max-width: 500px;
}

.image-container {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
}

.nav-arrow {
  position: absolute;
  bottom: 16px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 300;
  color: #2c3e50;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.nav-arrow:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  color: #667eea;
}

.nav-arrow:active {
  transform: translateY(0) scale(0.98);
}

.nav-prev {
  left: 16px;
}

.nav-next {
  right: 16px;
}

.footer {
  text-align: center;
  padding: 2rem;
  background: rgba(244, 240, 235, 0.5);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-style: italic;
  color: #7f8c8d;
  /* Safari performance optimizations */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .image-gallery {
    order: -1;
  }

  .image-container {
    height: 300px;
  }

  .nav-arrow {
    width: 40px;
    height: 40px;
    font-size: 18px;
    bottom: 12px;
  }

  .nav-prev {
    left: 12px;
  }

  .nav-next {
    right: 12px;
  }

  .title {
    font-size: 2.5rem;
  }

  .details-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 2rem 1rem 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .details-card {
    padding: 1rem;
  }

  .detail-item {
    flex-direction: column;
    text-align: center;
  }

  .detail-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }

  .detail-content h3 {
    text-align: left;
  }
}
</style> 