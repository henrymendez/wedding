<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { generateClient } from 'aws-amplify/data'
import { uploadData, getUrl, list } from 'aws-amplify/storage'
import type { Schema } from '../../amplify/data/resource'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/style.css'

const client = generateClient<Schema>()

// State management
const uploadedImages = ref<Array<{
  thumbnailUrl: string
  originalKey: string
  originalExtension: string
}>>([])
const isUploading = ref(false)
const isLoading = ref(true)
const uploadProgress = ref(0)
const error = ref('')
const success = ref('')
const photoSwipeInstance = ref<PhotoSwipe | null>(null)
const displayedImagesCount = ref(10) // Number of images to display initially
const IMAGES_PER_PAGE = 10 // Number of images to load per batch

// File input reference
const fileInput = ref<HTMLInputElement | null>(null)

// Load existing images on component mount
onMounted(async () => {
  await loadExistingImages()
})

// Clean up PhotoSwipe instance on unmount
onUnmounted(() => {
  if (photoSwipeInstance.value) {
    photoSwipeInstance.value.close()
    photoSwipeInstance.value = null
  }
})

// Load existing images from S3
const loadExistingImages = async () => {
  try {
    // Load thumbnails and originals in parallel
    const [thumbnailsResult, originalsResult] = await Promise.all([
      list({
        prefix: 'wedding-photos/thumbnails/',
        options: {
          listAll: true
        }
      }),
      list({
        prefix: 'wedding-photos/originals/',
        options: {
          listAll: true
        }
      })
    ])
    
    // Filter and create a map of originals by base filename for O(1) lookup
    const originalsMap = new Map<string, { key: string, extension: string }>()
    originalsResult.items.forEach(item => {
      if ((item.size ?? 0) > 0) {
        // Extract base filename (remove prefix and extension)
        const keyParts = item.key.split('/')
        const filename = keyParts[keyParts.length - 1]
        const baseFileName = filename.substring(0, filename.lastIndexOf('.'))
        if (baseFileName) {
          originalsMap.set(baseFileName, {
            key: item.key,
            extension: item.key.split('.').pop() ?? 'jpg'
          })
        }
      }
    })
    
    // Filter thumbnails
    const imageItems = thumbnailsResult.items.filter(item => {
      const isWebP = item.key.match(/\.webp$/i)
      return isWebP && (item.size ?? 0) > 0
    })
    
    // Initialize with empty array to show loading state
    uploadedImages.value = []
    
    // Batch URL generation (process in chunks to avoid overwhelming the API)
    const BATCH_SIZE = 20
    
    for (let i = 0; i < imageItems.length; i += BATCH_SIZE) {
      const batch = imageItems.slice(i, i + BATCH_SIZE)
      
      const batchPromises = batch.map(async (item) => {
        try {
          // Generate thumbnail URL
          const thumbnailUrl = await getUrl({
            key: item.key,
            options: {
              expiresIn: 3600 // 1 hour
            }
          })
          
          // Extract base filename from thumbnail key
          const keyParts = item.key.split('/')
          const filename = keyParts[keyParts.length - 1]
          const baseFileName = filename.replace('.webp', '')
          
          // Look up original in map (O(1) lookup)
          const original = originalsMap.get(baseFileName)
          
          if (original) {
            return {
              thumbnailUrl: thumbnailUrl.url.toString(),
              originalKey: original.key,
              originalExtension: original.extension
            }
          } else {
            // Fallback to thumbnail
            return {
              thumbnailUrl: thumbnailUrl.url.toString(),
              originalKey: item.key,
              originalExtension: 'webp'
            }
          }
        } catch (err) {
          console.error(`Error processing ${item.key}:`, err)
          return null
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      const validBatch = batchResults.filter(data => data !== null) as Array<{
        thumbnailUrl: string
        originalKey: string
        originalExtension: string
      }>
      
      // Update images array progressively - users see images appear as they load
      uploadedImages.value.push(...validBatch)
    }
    
  } catch (err) {
    console.error('Error loading images:', err)
    error.value = 'Failed to load existing photos'
  } finally {
    isLoading.value = false
  }
}

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (files && files.length > 0) {
    uploadFiles(Array.from(files))
  }
}

// Read EXIF orientation from image file
const getExifOrientation = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target?.result as ArrayBuffer)
        
        // Check JPEG header
        if (view.getUint16(0, false) !== 0xFFD8) {
          resolve(1) // Not a JPEG, default orientation
          return
        }
        
        const length = view.byteLength
        let offset = 2
        
        // Search for EXIF segment (0xFFE1)
        while (offset < length - 1) {
          const marker = view.getUint16(offset, false)
          
          // Check if this is an APP1 segment (0xFFE1)
          if (marker === 0xFFE1) {
            // Check for EXIF identifier (0x45786966 = "Exif")
            if (view.getUint32(offset + 4, false) === 0x45786966) {
              // Check byte order (0x4949 = Intel/Little-endian, 0x4D4D = Motorola/Big-endian)
              const little = view.getUint16(offset + 10, false) === 0x4949
              
              // Get IFD offset
              const ifdOffset = little 
                ? view.getUint32(offset + 14, little) 
                : view.getUint32(offset + 14, false)
              
              // Get number of directory entries
              const count = little 
                ? view.getUint16(offset + 18 + ifdOffset, little) 
                : view.getUint16(offset + 18 + ifdOffset, false)
              
              // Search for orientation tag (0x0112)
              for (let i = 0; i < count; i++) {
                const entryOffset = offset + 20 + ifdOffset + (i * 12)
                const tag = little 
                  ? view.getUint16(entryOffset, little) 
                  : view.getUint16(entryOffset, false)
                
                if (tag === 0x0112) { // Orientation tag
                  const value = little 
                    ? view.getUint16(entryOffset + 8, little) 
                    : view.getUint16(entryOffset + 8, false)
                  resolve(value)
                  return
                }
              }
              break
            }
          }
          
          // Move to next segment
          const segmentLength = view.getUint16(offset + 2, false)
          offset += 2 + segmentLength
        }
        
        resolve(1) // Default orientation if not found
      } catch (err) {
        console.warn('Error reading EXIF orientation:', err)
        resolve(1) // Default orientation on error
      }
    }
    reader.onerror = () => resolve(1)
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024)) // Read first 64KB
  })
}

// Apply EXIF orientation transformations to canvas
const applyOrientation = (ctx: CanvasRenderingContext2D, orientation: number, width: number, height: number) => {
  switch (orientation) {
    case 2:
      // Horizontal flip
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
      break
    case 3:
      // 180° rotation
      ctx.translate(width, height)
      ctx.rotate(Math.PI)
      break
    case 4:
      // Vertical flip
      ctx.translate(0, height)
      ctx.scale(1, -1)
      break
    case 5:
      // Vertical flip + 90° rotation (clockwise)
      ctx.translate(height, 0)
      ctx.rotate(Math.PI / 2)
      ctx.scale(1, -1)
      break
    case 6:
      // 90° rotation (clockwise)
      ctx.translate(height, 0)
      ctx.rotate(Math.PI / 2)
      break
    case 7:
      // Horizontal flip + 90° rotation (clockwise)
      ctx.translate(height, width)
      ctx.rotate(-Math.PI / 2)
      ctx.scale(-1, 1)
      break
    case 8:
      // 270° rotation (clockwise, or 90° counter-clockwise)
      ctx.translate(0, width)
      ctx.rotate(-Math.PI / 2)
      break
    default:
      // No transformation needed (orientation 1)
      break
  }
}

// Get dimensions after orientation is applied
const getOrientedDimensions = (orientation: number, width: number, height: number): { width: number, height: number } => {
  if (orientation >= 5 && orientation <= 8) {
    // These orientations swap width and height
    return { width: height, height: width }
  }
  return { width, height }
}

// Create high-quality WebP thumbnail from image file with proper EXIF orientation handling
const createWebPThumbnail = (file: File, maxWidth: number = 1200): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Read EXIF orientation
      const orientation = await getExifOrientation(file)
      
      // Load image
      const img = new Image()
      const imgLoadPromise = new Promise<void>((imgResolve, imgReject) => {
        img.onload = () => imgResolve()
        img.onerror = () => imgReject(new Error('Failed to load image'))
        img.src = URL.createObjectURL(file)
      })
      
      await imgLoadPromise
      
      // Get dimensions considering orientation (for calculating aspect ratio)
      const orientedDims = getOrientedDimensions(orientation, img.width, img.height)
      const aspectRatio = orientedDims.width / orientedDims.height
      
      // Calculate target dimensions for the final output
      let outputWidth = maxWidth
      let outputHeight = maxWidth / aspectRatio
      
      // If image is smaller than maxWidth, keep original size
      if (orientedDims.width < maxWidth) {
        outputWidth = orientedDims.width
        outputHeight = orientedDims.height
      }
      
      // Create canvas with correct dimensions (swapped for rotated orientations)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      // Set canvas dimensions - swap for orientations 5-8
      if (orientation >= 5 && orientation <= 8) {
        canvas.width = outputHeight
        canvas.height = outputWidth
      } else {
        canvas.width = outputWidth
        canvas.height = outputHeight
      }
      
      // Enable high-quality image rendering
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Save context, apply orientation transformation, draw image, restore context
      ctx.save()
      applyOrientation(ctx, orientation, canvas.width, canvas.height)
      
      // After transformation, draw image scaled to canvas size
      // For orientations 5-8, canvas is already swapped, so draw with swapped dimensions
      if (orientation >= 5 && orientation <= 8) {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.height, canvas.width)
      } else {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)
      }
      
      ctx.restore()
      
      // Clean up object URL
      URL.revokeObjectURL(img.src)
      
      // Convert to WebP blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create WebP thumbnail'))
        }
      }, 'image/webp', 0.9) // 90% quality for better image quality
    } catch (err) {
      reject(err instanceof Error ? err : new Error('Failed to process image'))
    }
  })
}

// Upload files to S3
const uploadFiles = async (files: File[]) => {
  isUploading.value = true
  error.value = ''
  success.value = ''
  uploadProgress.value = 0
  
  try {
    const uploadPromises = files.map(async (file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} is not an image file`)
      }
      
      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        throw new Error(`${file.name} is too large. Maximum size is 20MB`)
      }
      
      // Generate unique filename base
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split('.').pop()
      const baseFileName = `${timestamp}-${randomId}`
      
      // Upload original file (stored for future use/download)
      const originalFileName = `wedding-photos/originals/${baseFileName}.${fileExtension}`
      const originalResult = await uploadData({
        key: originalFileName,
        data: file,
        options: {
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              const progress = (transferredBytes / totalBytes) * 50 // First half of progress
              uploadProgress.value = Math.round(progress)
            }
          }
        }
      }).result
      
      console.log('Original uploaded (stored for future use):', originalResult.key)
      
      // Create and upload high-quality WebP thumbnail (used for display in lightbox)
      const thumbnailBlob = await createWebPThumbnail(file, 1200)
      const thumbnailFileName = `wedding-photos/thumbnails/${baseFileName}.webp`
      const thumbnailResult = await uploadData({
        key: thumbnailFileName,
        data: thumbnailBlob,
        options: {
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              const progress = 50 + (transferredBytes / totalBytes) * 50 // Second half of progress
              uploadProgress.value = Math.round(progress)
            }
          }
        }
      }).result
      
      console.log('Thumbnail uploaded (used for lightbox display):', thumbnailResult.key)
      
      // Get the public URL for the thumbnail (we'll display thumbnails)
      const url = await getUrl({
        key: thumbnailResult.key,
        options: {
          expiresIn: 3600 // 1 hour
        }
      })
      
      return {
        thumbnailUrl: url.url.toString(),
        originalKey: originalResult.key,
        thumbnailKey: thumbnailResult.key,
        originalExtension: fileExtension
      }
    })
    
    const results = await Promise.all(uploadPromises)
    
    // Add image data to the display array
    const imageData = results.map(result => ({
      thumbnailUrl: result.thumbnailUrl,
      originalKey: result.originalKey,
      originalExtension: result.originalExtension ?? 'jpg'
    }))
    uploadedImages.value.push(...imageData)
    
    success.value = `Successfully uploaded ${files.length} photo${files.length > 1 ? 's' : ''}!`
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = ''
    }, 3000)
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
  } catch (err) {
    console.error('Upload error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to upload photos'
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      error.value = ''
    }, 5000)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// Trigger file input
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// Handle image loading errors
const handleImageError = (imageUrl: string, index: number) => {
  console.error(`Failed to load image ${index + 1}:`, imageUrl)
  console.error('This could be due to:')
  console.error('1. Invalid URL format')
  console.error('2. Expired signed URL')
  console.error('3. Network connectivity issues')
  console.error('4. CORS issues')
  console.error('5. File not found in S3')
  
  // Optionally remove the failed image from the array
  // uploadedImages.value.splice(index, 1)
}

// Get original image URL from image data
const getOriginalImageUrl = async (imageData: { thumbnailUrl: string, originalKey: string, originalExtension: string }): Promise<string> => {
  try {
    console.log('Getting original URL for image:', imageData)
    
    // Use the stored original key directly
    const url = await getUrl({
      key: imageData.originalKey,
      options: {
        expiresIn: 3600
      }
    })
    
    const urlString = url.url.toString()
    console.log(`Successfully generated original URL: ${urlString}`)
    return urlString
  } catch (err) {
    console.error('Error getting original image URL:', err)
    console.log('Falling back to thumbnail URL')
    return imageData.thumbnailUrl
  }
}

// Get image dimensions dynamically
const getImageDimensions = (src: string): Promise<{ width: number, height: number }> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      // Fallback dimensions if image fails to load
      resolve({ width: 800, height: 600 })
    }
    img.src = src
  })
}

// Open PhotoSwipe lightbox
const openPhotoSwipe = async (index: number) => {
  if (uploadedImages.value.length === 0) return
  
  // Get dimensions for all images
  const itemsWithDimensions = await Promise.all(
    uploadedImages.value.map(async (imageData) => {
      const dimensions = await getImageDimensions(imageData.thumbnailUrl)
      return {
        src: imageData.thumbnailUrl,
        width: dimensions.width,
        height: dimensions.height,
        alt: 'Wedding photo'
      }
    })
  )
  
  // PhotoSwipe options
  const options = {
    dataSource: itemsWithDimensions,
    index: index,
    bgOpacity: 0.9,
    showHideOpacity: true,
    closeOnVerticalDrag: true,
    closeOnScroll: true,
    zoom: true,
    maxZoomLevel: 2,
    minZoomLevel: 0.8,
    spacing: 0.1,
    allowPanToNext: true,
    loop: true,
    keyboard: true,
    focus: true,
    escKey: true,
    arrowKeys: true,
    returnFocus: true,
    clickToCloseNonZoomable: true,
    imageClickAction: 'toggle-controls' as const,
    tapAction: 'toggle-controls' as const,
    doubleTapAction: 'zoom' as const,
    preloadFirstSlide: true,
    preload: [1, 1] as [number, number],
    // Prevent stretching and full-screen display
    padding: { top: 60, bottom: 60, left: 60, right: 60 },
    // Ensure images fit properly without stretching
    fitRatio: 0.8,
    // Don't force full viewport size
    autoFocus: false,
    // Prevent images from scaling to window size
    initialZoomLevel: 'fit' as const
  }
  
  // Create and open PhotoSwipe
  photoSwipeInstance.value = new PhotoSwipe(options)
  photoSwipeInstance.value.init()
}

// Close PhotoSwipe
const closePhotoSwipe = () => {
  if (photoSwipeInstance.value) {
    photoSwipeInstance.value.close()
    photoSwipeInstance.value = null
  }
}

// Computed property for displayed images (lazy loading)
const displayedImages = computed(() => {
  return uploadedImages.value.slice(0, displayedImagesCount.value)
})

// Check if there are more images to load
const hasMoreImages = computed(() => {
  return displayedImagesCount.value < uploadedImages.value.length
})

// Load more images
const loadMoreImages = () => {
  const nextCount = displayedImagesCount.value + IMAGES_PER_PAGE
  displayedImagesCount.value = Math.min(nextCount, uploadedImages.value.length)
}

</script>

<template>
  <div class="photo-collage-page">
    <!-- Header -->
    <header class="header">
      <p class="subtitle">Share your favorite memories!</p>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Upload Section -->
      <section class="upload-section">
        <div class="upload-card">
          
          <!-- Hidden file input -->
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="handleFileSelect"
            style="display: none"
          />
          
          <!-- Upload button -->
          <button 
            @click="triggerFileInput" 
            class="upload-button"
            :disabled="isUploading"
          >
            <span v-if="isUploading">Uploading...</span>
            <span v-else>📸 Upload Photos</span>
          </button>
          
          <!-- Upload progress -->
          <div v-if="isUploading" class="upload-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
            <p class="progress-text">{{ uploadProgress }}% uploaded</p>
          </div>
          
          <!-- Messages -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <div v-if="success" class="success-message">
            {{ success }}
          </div>
          
            <!-- Upload guidelines -->
            <div class="upload-guidelines">
              <p>You can select multiple photos at once</p>
            </div>
        </div>
      </section>

      <!-- Photo Collage Section -->
      <section class="collage-section">
        <div class="collage-container">
          
          <div v-if="isLoading" class="loading-state">
            <p>Loading photos...</p>
          </div>
          
          <div v-else-if="uploadedImages.length === 0" class="empty-state">
            <p>No photos uploaded yet. Be the first to share a memory!</p>
          </div>
          
          <div v-else>
            <div class="photo-grid">
              <div 
                v-for="(imageData, index) in displayedImages" 
                :key="index"
                class="photo-item"
                @click="openPhotoSwipe(index)"
              >
                <img 
                  :src="imageData.thumbnailUrl" 
                  :alt="`Wedding photo ${index + 1}`"
                  class="photo-image"
                  loading="lazy"
                  @load="console.log(`Successfully loaded image ${index + 1}:`, imageData.thumbnailUrl)"
                  @error="handleImageError(imageData.thumbnailUrl, index)"
                />
              </div>
            </div>
            
            <!-- Load More Button -->
            <div v-if="hasMoreImages" class="load-more-container">
              <button @click="loadMoreImages" class="load-more-button">
                Load More Photos ({{ uploadedImages.length - displayedImagesCount }} remaining)
              </button>
            </div>
            
            <!-- Show total count when all images are loaded -->
            <div v-else-if="uploadedImages.length > 0" class="all-loaded-message">
              <p>All {{ uploadedImages.length }} photos loaded</p>
            </div>
          </div>
        </div>
      </section>
    </main>


  </div>
</template>

<style scoped>
.photo-collage-page {
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
  padding: 1.5rem 2rem 1rem;
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

.upload-section {
  display: flex;
  justify-content: center;
}

.upload-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.section-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-weight: 400;
}

.upload-button {
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
  margin-bottom: 1.5rem;
}

.upload-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
}

.upload-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.upload-progress {
  margin: 1rem 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
}

.error-message {
  background: #ff6b6b;
  color: white;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  font-weight: 500;
  margin: 1rem 0;
}

.success-message {
  background: #4ecdc4;
  color: white;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  font-weight: 500;
  margin: 1rem 0;
}

.upload-guidelines {
  text-align: center;
}

.upload-guidelines p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.875rem;
  font-weight: 400;
}

.collage-section {
  display: flex;
  justify-content: center;
}

.collage-container {
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 1000px;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-style: italic;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.photo-item:hover {
  transform: scale(1.05);
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem;
}

.load-more-button {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  font-family: inherit;
}

.load-more-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
}

.all-loaded-message {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  font-style: italic;
  margin-top: 1rem;
}

.all-loaded-message p {
  margin: 0;
  font-size: 0.95rem;
}


/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .title {
    font-size: 2.5rem;
  }

  .upload-card,
  .collage-container {
    padding: 1.5rem;
  }

  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 1rem 1rem 0.75rem;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .upload-card,
  .collage-container {
    padding: 1rem;
  }

  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
  }
}
</style>
