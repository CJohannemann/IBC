<script setup lang="ts">
import { ref } from 'vue'
import type { NavLink } from '@/types/nav'

defineProps<{ links: NavLink[] }>()

const openItem = ref<string | null>(null)
const mobileOpen = ref(false)

function closeAll() {
  openItem.value = null
}
</script>

<template>
  <!-- Desktop + mobile wrapper -->
  <div>

    <!-- ── Nav Bar ─────────────────────────────────────────────────── -->
    <nav
      class="bg-ibc-blue border-t-[3px] border-ibc-red flex items-stretch min-h-[52px] px-8 relative z-50"
      @mouseleave="closeAll"
    >
      <!-- Brand -->
      <div class="text-white text-lg font-black tracking-wide flex items-center pr-7 mr-2 border-r border-white/20 whitespace-nowrap">
        Baseball
      </div>

      <!-- Desktop Links -->
      <div class="hidden md:flex items-stretch flex-1">
        <template v-for="link in links" :key="link.label">

          <!-- Dropdown item -->
          <div
            v-if="link.children"
            class="relative flex items-center px-5 text-white text-sm font-semibold tracking-wide
                   border-r border-white/15 cursor-pointer select-none transition-colors
                   hover:bg-white/10"
            :class="{ 'bg-white/10': openItem === link.label }"
            @mouseenter="openItem = link.label"
          >
            {{ link.label }}
            <span
              class="ml-1.5 text-[10px] transition-transform duration-200 inline-block"
              :class="openItem === link.label ? 'rotate-180' : ''"
            >▼</span>

            <!-- Dropdown panel -->
            <div
              v-show="openItem === link.label"
              class="absolute top-full left-0 bg-ibc-navy border-t-[3px] border-ibc-red min-w-[180px]
                     shadow-xl z-50"
            >
              <RouterLink
                v-for="child in link.children"
                :key="child.label"
                :to="child.to ?? '#'"
                class="block px-5 py-3 text-slate-200 text-[13px] font-semibold tracking-wide
                       border-b border-white/[0.08] last:border-b-0
                       hover:bg-ibc-blue hover:text-ibc-gold transition-colors"
                @click="closeAll"
              >
                {{ child.label }}
              </RouterLink>
            </div>
          </div>

          <!-- Spacer -->
          <div v-else-if="link.label === '__spacer__'" class="flex-1" />

          <!-- Plain link -->
          <RouterLink
            v-else
            :to="link.to ?? '#'"
            class="flex items-center px-5 text-sm font-semibold tracking-wide border-r border-white/15
                   transition-colors hover:bg-white/10"
            :class="link.highlight
              ? 'text-ibc-gold font-bold'
              : 'text-white'"
          >
            {{ link.label }}
          </RouterLink>

        </template>
      </div>

      <!-- Mobile hamburger -->
      <button
        class="md:hidden ml-auto flex flex-col gap-[5px] justify-center p-2"
        aria-label="Toggle menu"
        @click="mobileOpen = !mobileOpen"
      >
        <span class="w-6 h-0.5 bg-white rounded transition-all" :class="mobileOpen ? 'rotate-45 translate-y-[7px]' : ''" />
        <span class="w-6 h-0.5 bg-white rounded transition-all" :class="mobileOpen ? 'opacity-0' : ''" />
        <span class="w-6 h-0.5 bg-white rounded transition-all" :class="mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''" />
      </button>
    </nav>

    <!-- ── Mobile Menu ─────────────────────────────────────────────── -->
    <div v-show="mobileOpen" class="md:hidden bg-ibc-navy flex flex-col">
      <template v-for="link in links" :key="link.label">
        <template v-if="link.children">
          <!-- Parent label -->
          <div class="px-6 py-3.5 text-white text-sm font-semibold border-b border-white/10">
            {{ link.label }}
          </div>
          <!-- Children indented -->
          <RouterLink
            v-for="child in link.children"
            :key="child.label"
            :to="child.to ?? '#'"
            class="pl-10 pr-6 py-3 text-white/70 text-[13px] font-semibold border-b border-white/[0.06]
                   hover:text-ibc-gold transition-colors"
            @click="mobileOpen = false"
          >
            {{ child.label }}
          </RouterLink>
        </template>

        <RouterLink
          v-else-if="link.label !== '__spacer__'"
          :to="link.to ?? '#'"
          class="px-6 py-3.5 text-sm font-semibold border-b border-white/10 transition-colors hover:text-ibc-gold"
          :class="link.highlight ? 'text-ibc-gold' : 'text-white'"
          @click="mobileOpen = false"
        >
          {{ link.label }}
        </RouterLink>
      </template>
    </div>

  </div>
</template>
