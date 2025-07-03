<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Wedding details
const weddingDetails = {
  date: 'October 31, 2025',
  venue: 'The Palace at Somerset',
  time: '6:00 PM',
  dressCode: 'Semi-Formal'
}

// Sample wedding images (you can replace these with actual images)
const images = [
  '/images/PXL_20230101_005501710.jpg',
  '/images/PXL_20210911_191955906.jpg',
  '/images/PXL_20211219_033745888.NIGHT.jpg',
  '/images/PXL_20250221_172015897.jpg'

]

const currentImageIndex = ref(0)
let imageInterval: number | NodeJS.Timeout | null = null

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.length
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

onMounted(() => {
  imageInterval = setInterval(nextImage, 3000)
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
      <h1 class="title">Quique & Laura</h1>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Left Side - Wedding Details -->
      <section class="wedding-details">
        <div class="details-card">
          <h2 class="section-title">Wedding Details</h2>
          
          <div class="detail-item">
            <div class="detail-icon">📅</div>
            <div class="detail-content">
              <h3>When</h3>
              <p>{{ weddingDetails.date }}</p>
              <p class="time">{{ weddingDetails.time }}</p>
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-icon">📍</div>
            <div class="detail-content">
              <h3>Where</h3>
              <p>{{ weddingDetails.venue }}</p>
              <p class="address">333 Davidson Ave, Somerset, NJ 08873</p>
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-icon">👔</div>
            <div class="detail-content">
              <h3>Dress Code</h3>
              <p>{{ weddingDetails.dressCode }}</p>
            </div>
          </div>

          <div class="rsvp-section">
            <h3>RSVP</h3>
            <p>Please RSVP by September 30, 2025</p>
            <button class="rsvp-button">RSVP Now</button>
          </div>
        </div>
      </section>

      <!-- Right Side - Rotating Images -->
      <section class="image-gallery">
        <div class="image-container">
          <img 
            :src="images[currentImageIndex]" 
            :alt="`Wedding image ${currentImageIndex + 1}`"
            class="rotating-image"
            @error="handleImageError"
          />
          <div class="image-overlay">
            <div class="image-indicators">
              <span 
                v-for="(image, index) in images" 
                :key="index"
                :class="['indicator', { active: index === currentImageIndex }]"
                @click="currentImageIndex = index"
              ></span>
            </div>
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
  background: rgb(212, 150, 125);
  font-family: 'Playfair Display', serif;
  color: #2c3e50;
}

.header {
  text-align: center;
  padding: 3rem 2rem 2rem;
  background: rgb(229, 227, 220);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.title {
  font-size: 3.5rem;
  font-weight: 400;
  margin: 0;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
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

.image-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.rotating-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
  padding: 2rem 1rem 1rem;
}

.image-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: white;
  transform: scale(1.2);
}

.footer {
  text-align: center;
  padding: 2rem;
  background: rgb(229, 227, 220);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-style: italic;
  color: #7f8c8d;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .title {
    font-size: 2.5rem;
  }

  .details-card {
    padding: 1.5rem;
  }

  .image-container {
    height: 300px;
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
}
</style>

