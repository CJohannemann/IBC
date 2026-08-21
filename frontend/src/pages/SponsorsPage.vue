<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getSwag, type SwagItem } from '@/api/swag'
import { useSportStore } from '@/stores/sport'

const sportStore = useSportStore()
const items = ref<SwagItem[]>([])
const loading = ref(true)
const lightboxImage = ref<string | null>(null)

async function loadSwag() {
  loading.value = true
  try {
    items.value = await getSwag(sportStore.activeSport)
  } catch (e) {
    console.error('Failed to load swag:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadSwag)
watch(() => sportStore.activeSport, loadSwag)

function openLightbox(imagePath: string) {
  lightboxImage.value = imagePath
}

function closeLightbox() {
  lightboxImage.value = null
}
</script>

<template>
  <div class="min-h-screen bg-ibc-cream py-12 px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <h1 class="text-4xl font-black text-ibc-navy uppercase tracking-widest mb-8">Spirit Wear</h1>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-slate-500">Loading items...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="items.length === 0" class="text-center py-12">
        <p class="text-slate-500">No items available yet.</p>
      </div>

      <!-- Swag Grid (3 columns) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col"
        >
          <!-- Image -->
          <div v-if="item.image_path" class="w-full h-64 bg-slate-50 flex items-center justify-center">
            <img
              :src="item.image_path"
              :alt="item.title"
              @click="openLightbox(item.image_path)"
              class="max-w-full max-h-full object-contain cursor-pointer hover:opacity-90 transition"
            />
          </div>
          <div v-else class="w-full h-64 bg-slate-200 flex items-center justify-center">
            <p class="text-slate-400">No image</p>
          </div>

          <!-- Content -->
          <div class="p-6 flex-1 flex flex-col">
            <h2 v-if="item.url" class="text-xl font-black text-ibc-navy mb-2">
              <a :href="item.url" target="_blank" rel="noopener noreferrer" 
                class="hover:text-ibc-red transition underline">
                {{ item.title }}
              </a>
            </h2>
            <h2 v-else class="text-xl font-black text-ibc-navy mb-2">{{ item.title }}</h2>
            
            <p v-if="item.description" class="text-slate-600 text-sm mb-4 flex-1">
              {{ item.description }}
            </p>

            <div class="text-2xl font-black text-ibc-red">
              ${{ item.price.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <Teleport to="body">
      <div 
        v-if="lightboxImage" 
        @click="closeLightbox"
        class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      >
        <button 
          @click="closeLightbox"
          class="absolute top-4 right-4 text-white text-4xl hover:text-slate-300 transition z-10"
          aria-label="Close"
        >
          ×
        </button>
        
        <img 
          :src="lightboxImage" 
          @click.stop
          class="max-w-full max-h-full object-contain"
          alt="Full size image"
        />
        
        <p class="absolute bottom-4 text-white text-sm">Click anywhere to close</p>
      </div>
    </Teleport>
  </div>
</template>
