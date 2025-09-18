<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Schema } from '../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'

const router = useRouter()

const client = generateClient<Schema>()

// Form data
const formData = ref({
  numberOfGuests: 1,
  guestNames: [''],
  email: ''
})

// Form state
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const error = ref('')

// Validation
const validateForm = () => {
  // Check if all guest names are filled
  for (let i = 0; i < formData.value.numberOfGuests; i++) {
    if (!formData.value.guestNames[i] || !formData.value.guestNames[i].trim()) {
      error.value = `Guest ${i + 1} name is required`
      return false
    }
  }
  
  if (!formData.value.email.trim()) {
    error.value = 'Email is required'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    error.value = 'Please enter a valid email address'
    return false
  }
  if (formData.value.numberOfGuests < 1 || formData.value.numberOfGuests > 6) {
    error.value = 'Number of guests must be between 1 and 6'
    return false
  }
  return true
}

// Submit RSVP
const submitRSVP = async () => {
  error.value = ''
  
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // For now, we'll store the primary guest's name and all guest names in the Name field
    const allGuestNames = formData.value.guestNames.slice(0, formData.value.numberOfGuests).join(', ')
    
    console.log('Submitting RSVP with data:', {
      numberOfGuests: formData.value.numberOfGuests,
      Name: allGuestNames,
      email: formData.value.email.trim().toLowerCase(),
      submittedAt: new Date().toISOString(),
    })
    
    const result = await client.models.RSVP.create({
      numberOfGuests: formData.value.numberOfGuests,
      Name: allGuestNames,
      email: formData.value.email.trim().toLowerCase(),
      submittedAt: new Date().toISOString(),
    })
    
    console.log('RSVP submission result:', result)
    
    // Check if the result has errors
    if (result.errors && result.errors.length > 0) {
      console.error('GraphQL errors:', result.errors)
      error.value = `Submission failed: ${result.errors.map(e => e.message).join(', ')}`
      return
    }
    
    // Check if we actually got a created record
    if (!result.data) {
      console.error('No data returned from create operation')
      error.value = 'Submission failed: No data returned from server'
      return
    }
    
    console.log('RSVP successfully created with ID:', result.data.id)
    isSubmitted.value = true
  } catch (err) {
    console.error('Error submitting RSVP:', err)
    
    // More specific error messages
    if (err instanceof Error) {
      if (err.message.includes('Network')) {
        error.value = 'Network error. Please check your connection and try again.'
      } else if (err.message.includes('Unauthorized')) {
        error.value = 'Authentication error. Please refresh the page and try again.'
      } else {
        error.value = `Submission failed: ${err.message}`
      }
    } else {
      error.value = 'There was an unexpected error submitting your RSVP. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}

// Reset form
// Watch for changes in numberOfGuests and update guestNames array
watch(() => formData.value.numberOfGuests, (newCount) => {
  const currentNames = formData.value.guestNames
  if (newCount > currentNames.length) {
    // Add empty names for new guests
    for (let i = currentNames.length; i < newCount; i++) {
      currentNames.push('')
    }
  } else if (newCount < currentNames.length) {
    // Remove extra names
    formData.value.guestNames = currentNames.slice(0, newCount)
  }
})

const resetForm = () => {
  formData.value = {
    numberOfGuests: 1,
    guestNames: [''],
    email: ''
  }
  isSubmitted.value = false
  error.value = ''
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="rsvp-form-container">
    <div class="rsvp-form-card">
      <div v-if="!isSubmitted" class="form-content">
        <h2 class="form-title">RSVP</h2>
        <p class="form-subtitle">Please RSVP by September 30, 2025</p>
        
        <form @submit.prevent="submitRSVP" class="rsvp-form">
          <div class="form-group">
            <label for="numberOfGuests">Number of Guests Attending</label>
            <select 
              id="numberOfGuests" 
              v-model="formData.numberOfGuests"
              class="form-input"
              required
            >
              <option v-for="n in 6" :key="n" :value="n">{{ n }} {{ n === 1 ? 'Guest' : 'Guests' }}</option>
            </select>
          </div>
          
          <!-- Dynamic guest name fields -->
          <div 
            v-for="(name, index) in formData.guestNames.slice(0, formData.numberOfGuests)" 
            :key="index"
            class="form-group"
          >
            <label :for="`guestName${index + 1}`">Guest {{ index + 1 }}</label>
            <input 
              :id="`guestName${index + 1}`" 
              v-model="formData.guestNames[index]"
              type="text" 
              class="form-input"
              :placeholder="`First/Last name`"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email" 
              v-model="formData.email"
              type="email" 
              class="form-input"
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <button 
            type="submit" 
            class="submit-button"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Submitting...</span>
            <span v-else>Submit RSVP</span>
          </button>
        </form>
      </div>
      
      <div v-else class="success-content">
        <div class="success-icon">
          <img src="/images/coffee-bagel2.png" alt="Coffee meets bagel" class="success-image" />
        </div>
        <h2 class="success-title">Thank You!</h2>
        <p class="success-message">
          Your RSVP has been submitted successfully. We look forward to celebrating with you!
        </p>
        <div class="rsvp-details">
          <p><strong>Guests:</strong></p>
          <ul class="guest-list">
            <li v-for="(name, index) in formData.guestNames.slice(0, formData.numberOfGuests)" :key="index">
              {{ name }}
            </li>
          </ul>
          <p>{{ formData.numberOfGuests }} {{ formData.numberOfGuests === 1 ? 'Guest' : 'Guests' }} attending</p>
        </div>
        <div class="button-group">
          <button @click="resetForm" class="reset-button">
            Submit Another RSVP
          </button>
          <button @click="goBack" class="back-button">
            Back to Wedding Page
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rsvp-form-container {
  min-height: 100vh;
  background: #9CAF88;
  background-image: url('/border-1.svg');
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Playfair Display', serif;
}

.rsvp-form-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 500px;
}

.form-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 400;
}

.form-subtitle {
  text-align: center;
  margin-bottom: 2rem;
  color: #7f8c8d;
  font-style: italic;
}

.rsvp-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.form-input {
  padding: 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #bdc3c7;
}

.error-message {
  background: #ff6b6b;
  color: white;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  font-weight: 500;
}

.submit-button {
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
  font-family: inherit;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Success state */
.success-content {
  text-align: center;
}

.success-icon {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.success-image {
  width: 204px;
  height: 204px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.success-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 400;
}

.success-message {
  color: #7f8c8d;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.rsvp-details {
  background: rgba(102, 126, 234, 0.1);
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  border-left: 4px solid #DBA400;
}

.rsvp-details p {
  margin: 0.5rem 0;
  color: #2c3e50;
}

.guest-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}

.guest-list li {
  padding: 0.25rem 0;
  color: #2c3e50;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.guest-list li:last-child {
  border-bottom: none;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reset-button, .back-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.reset-button:hover, .back-button:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.back-button {
  background: #7f8c8d;
}

.back-button:hover {
  background: #6c7b7d;
}

/* Responsive design */
@media (max-width: 768px) {
  .rsvp-form-container {
    padding: 1rem;
  }
  
  .rsvp-form-card {
    padding: 2rem;
  }
  
  .form-title {
    font-size: 2rem;
  }
  
  .success-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .rsvp-form-card {
    padding: 1.5rem;
  }
  
  .form-title {
    font-size: 1.8rem;
  }
  
  .success-title {
    font-size: 1.8rem;
  }
}
</style> 
