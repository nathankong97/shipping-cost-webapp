<template>
  <div class="relative" @keydown.esc="open = false">
    <button type="button" @click="open = !open" class="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm
             border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50
             focus:outline-none focus:ring-2 focus:ring-indigo-500
             dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700
             dark:focus:ring-indigo-400" aria-haspopup="menu" :aria-expanded="open ? 'true' : 'false'" title="Theme">
      <span v-if="isDark" class="inline" aria-hidden="true">🌙</span>
      <span v-else class="inline" aria-hidden="true">☀️</span>
      <span class="hidden sm:inline">{{ label }}</span>
      <svg class="h-3 w-3 opacity-60" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 12l-4-4h8l-4 4z" />
      </svg>
    </button>

    <div v-if="open" class="absolute right-0 z-30 mt-2 w-44 rounded-xl border p-1 shadow-lg
             border-neutral-200 bg-white
             dark:border-neutral-700 dark:bg-neutral-900" role="menu" aria-label="Theme">
      <button v-for="opt in options" :key="opt.value" class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm
               text-neutral-800 hover:bg-neutral-50
               dark:text-neutral-100 dark:hover:bg-neutral-800
               focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        :class="theme.mode === opt.value ? 'font-medium' : ''" @click="pick(opt.value)" role="menuitem">
        <span class="flex items-center gap-2">
          <span aria-hidden="true">{{ opt.emoji }}</span>
          <span>{{ opt.label }}</span>
        </span>
        <span v-if="theme.mode === opt.value" aria-hidden="true">✓</span>
      </button>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useThemeStore, type ThemeMode } from '../stores/theme'

const theme = useThemeStore()
const open = ref(false)
const isDark = computed(() => theme.isDark)
const label = computed(() =>
  theme.mode === 'system' ? 'System' : theme.mode === 'dark' ? 'Dark' : 'Light'
)
const options: { value: ThemeMode; label: string; emoji: string }[] = [
  { value: 'light', label: 'Light', emoji: '☀️' },
  { value: 'dark', label: 'Dark', emoji: '🌙' },
  { value: 'system', label: 'System', emoji: '🖥️' },
]
function pick(v: ThemeMode) { theme.setMode(v); open.value = false }

function onDocClick(e: MouseEvent) {
  const el = e.target as Node
  // Close when clicking outside
  if (!(el as HTMLElement)?.closest) return
  if (open.value && !(el as HTMLElement).closest('[aria-label="Theme"]') &&
    !(el as HTMLElement).closest('[title="Theme"]')) {
    open.value = false
  }
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>
