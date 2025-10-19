<script setup lang="ts">
import { ref } from 'vue'


// Bridal party members - split into two groups
const bridesmaids = ref([
  { name: 'Sheina Plaza', role: 'Maid of Honor' },
  { name: 'Tanya Briones', role: 'Bridesmaid' },
  { name: 'Daniela Meza', role: 'Bridesmaid' },
  { name: 'Maria Risco', role: 'Bridesmaid' },
  { name: 'Victoria Jaghab', role: 'Junior Bridesmaid' },
  { name: 'Nina Lake', role: 'Flower Girl' }
])

const groomsmen = ref([
  { name: 'Alonso Mendez', role: 'Best Man' },
  { name: 'Marcos Mendez', role: 'Groomsman' },
  { name: 'Dave Amorin', role: 'Groomsman' },
  { name: 'Rob Amorin', role: 'Groomsman' },
  { name: 'Steven Lake', role: 'Groomsman' },
  { name: 'Kai Conforme', role: 'Ring Bearer' },
  { name: 'Aiden Jaghab', role: 'Ring Bearer' }
])
</script>

<template>
  <div class="rehearsal-dinner-page">
    <!-- Header -->
    <header class="header">
      <h1 class="title">Bridal Party</h1>
    </header>

    <!-- Main Content -->
    <main class="main-content">

      <!-- Bridal Party Section -->
      <section class="bridal-party-section">
        <div class="bridal-party-card">
          
          <div class="party-container">
            <!-- Bridesmaids Column -->
            <div class="party-column">
              <h3 class="column-title">👰 Bridesmaids</h3>
              <div class="party-grid">
                <div 
                  v-for="(member, index) in bridesmaids" 
                  :key="index"
                  class="party-member"
                >
                  <div class="member-info">
                    <h4 class="member-name">
                      {{ member.name }}
                      <span v-if="member.role === 'Flower Girl'" class="flower-emoji">🌸</span>
                      <span v-if="member.role === 'Ring Bearer'" class="ring-emoji">💍</span>
                    </h4>
                    <p class="member-role">{{ member.role }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Groomsmen Column -->
            <div class="party-column">
              <h3 class="column-title">🤵🏻 Groomsmen</h3>
              <div class="party-grid">
                <div 
                  v-for="(member, index) in groomsmen" 
                  :key="index"
                  class="party-member"
                >
                  <div class="member-info">
                    <h4 class="member-name">
                      {{ member.name }}
                      <span v-if="member.role === 'Flower Girl'" class="flower-emoji">🌸</span>
                      <span v-if="member.role === 'Ring Bearer'" class="ring-emoji">💍</span>
                    </h4>
                    <p class="member-role">{{ member.role }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

  </div>
</template>

<style scoped>
.rehearsal-dinner-page {
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}


.bridal-party-section {
  display: flex;
  justify-content: center;
}

.bridal-party-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 800px;
}

.party-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 1rem;
}

.party-column {
  display: flex;
  flex-direction: column;
}

.column-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #DBA400;
  text-align: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #DBA400;
  padding-bottom: 0.5rem;
}

.party-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.party-member {
  background: rgba(255, 255, 255, 0.8);
  padding: 1.5rem;
  border-radius: 15px;
  border: 4px solid rgba(156, 175, 136, 0.8);
  text-align: center;
  transition: transform 0.3s ease;
  backdrop-filter: blur(10px);
}

.party-member:hover {
  transform: translateY(-2px);
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.member-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.member-role {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-style: italic;
  margin: 0;
}

.flower-emoji {
  margin-left: 0.5rem;
  font-size: 1rem;
}

.ring-emoji {
  margin-left: 0.5rem;
  font-size: 1rem;
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
    padding: 1rem;
  }

  .title {
    font-size: 2.5rem;
  }

  .bridal-party-card {
    padding: 1.5rem;
  }

  .party-container {
    grid-template-columns: 1fr;
    gap: 2rem;
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

  .bridal-party-card {
    padding: 1rem;
  }
}
</style>
