<script setup lang="ts">
import logo from '@/assets/Logo.png'
</script>

<template>
  <header class="bg-ibc-navy px-8 py-3 flex items-center justify-between min-h-[100px]">

    <!-- Left: Logo -->
    <div class="flex items-center gap-5">
      <router-link to="/" class="flex-shrink-0">
      <img
        :src="logo"
        alt="Independence Baseball Club"
          class="h-20 w-20 object-contain
               drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]
               [image-rendering:crisp-edges]"
      />
      </router-link>

      <!-- Club Name text block -->
      <div class="flex flex-col leading-tight">
        <span class="text-white text-2xl font-black tracking-widest uppercase">Independence</span>
        <span class="text-ibc-red text-sm font-bold tracking-[4px] uppercase">Baseball Club</span>
      </div>
    </div>

    <!-- Vertical divider -->
    <div class="hidden md:block w-px h-14 bg-white/20 mx-6" />

    <!-- Right: Club full name -->
    <div class="hidden md:block text-white/60 text-xs font-bold tracking-[3px] uppercase text-right">
      Independence Baseball Club
    </div>

  </header>
</template>

