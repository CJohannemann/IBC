<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getNews, type NewsArticle } from '@/api/news'
import { useSportStore } from '@/stores/sport'

const sportStore = useSportStore()
const articles = ref<NewsArticle[]>([])
const loading = ref(true)
const lightboxImage = ref<string | null>(null)

async function loadNews() {
  loading.value = true
  try {
    articles.value = await getNews(sportStore.activeSport)
  } catch (e) {
    console.error('Failed to load news:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadNews)
watch(() => sportStore.activeSport, loadNews)

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function openLightbox(imagePath: string) {
  lightboxImage.value = imagePath
}

function closeLightbox() {
  lightboxImage.value = null
}
</script>

<template>
  <div class="min-h-screen bg-ibc-cream py-12 px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <h1 class="text-4xl font-black text-ibc-navy uppercase tracking-widest mb-8">News</h1>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-slate-500">Loading news...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="articles.length === 0" class="text-center py-12">
        <p class="text-slate-500">No news articles yet.</p>
      </div>

      <!-- News Articles -->
      <div v-else class="space-y-8">
        <article
          v-for="article in articles"
          :key="article.id"
          class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
        >
          <!-- Image (if exists) -->
          <img
            v-if="article.image_path"
            :src="article.image_path"
            :alt="article.title"
            @click="openLightbox(article.image_path)"
            class="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition"
          />

          <!-- Content -->
          <div class="p-6">
            <div class="flex items-center gap-2 text-xs text-slate-500 mb-3">
              <span>{{ formatDate(article.created_at) }}</span>
              <span v-if="article.author">• by {{ article.author }}</span>
            </div>

            <h2 class="text-2xl font-black text-ibc-navy mb-4">{{ article.title }}</h2>

            <div class="text-slate-700 whitespace-pre-wrap">{{ article.content }}</div>
          </div>
        </article>
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
