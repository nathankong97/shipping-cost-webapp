<template>
  <header class="border-b bg-white dark:bg-neutral-950 dark:border-neutral-800">
    <div class="mx-auto max-w-6xl px-6 py-3 flex items-center gap-3">
      <!-- Title + subtitle -->
      <div class="min-w-0">
        <h1 class="text-base font-semibold leading-6 truncate text-neutral-900 dark:text-neutral-100">
          {{ title }}
        </h1>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          Japan → US • Compare Japan price + shipping vs US price
        </p>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <!-- Env badge -->
        <span class="hidden sm:inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] text-neutral-700 dark:text-neutral-200
                 border-neutral-300 dark:border-neutral-700" :class="envBadgeClass" title="Build environment">
          {{ envLabel }}
        </span>

        <!-- Version badge (optional) -->
        <span v-if="version" class="hidden sm:inline-flex items-center rounded-md border px-2 py-0.5 text-[11px]
                 border-neutral-200 text-neutral-600
                 dark:border-neutral-700 dark:text-neutral-300" title="App version">
          v{{ version }}
        </span>

        <!-- Stale indicator -->
        <span v-if="ship.isStale" class="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px]
                 border-amber-300 bg-amber-50 text-amber-800
                 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200"
          title="Inputs changed since last calculation">
          Stale results
        </span>

        <ThemeToggle />

        <!-- Overall verdict pill -->
        <span v-if="ready" :class="[
          'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
          verdict.class
        ]" :title="verdict.title">
          <span class="tabular-nums">{{ formattedDelta }}</span>
          <span>•</span>
          <span>{{ verdict.emoji }} {{ verdict.label }}</span>
        </span>

        <!-- Settings gear -->
        <VerdictSettings />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import VerdictSettings from './VerdictSettings.vue'
import ThemeToggle from './ThemeToggle.vue'
import { usePrefsStore } from '../stores/prefs'
import { computed } from 'vue'
import { useItemsStore } from '../stores/items'
import { useShippingStore } from '../stores/shipping'

withDefaults(defineProps<{ title?: string; version?: string }>(), {
  title: 'Japan → US Import Value Calculator',   // ← was “Import Value Calculator”
  version: '',
})

const items = useItemsStore()
const ship = useShippingStore()

// Totals in USD (your items store already sums with qty)
const totalJP = computed(() => items.totalJP)
const totalUS = computed(() => items.totalUS)
const allocUSD = computed(() => ship.shippingAllocBaseUSD ?? 0)
const ready = computed(() => allocUSD.value > 0)

// Overall delta = Landed − US
const delta = computed(() => (totalJP.value + allocUSD.value) - totalUS.value)

const formattedDelta = computed(() => {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(delta.value) }
  catch { return `$${delta.value.toFixed(2)}` }
})

// Verdict logic (same thresholds as table)
const NEUTRAL = () => prefs.neutralBandUsd
const verdict = computed(() => {
  if (!ready.value) return { emoji: '—', label: 'No result', class: 'bg-neutral-100 text-neutral-600', title: 'No calculation yet' }
  const d = delta.value
  const abs = Math.abs(d)
  const threshold = Math.max(prefs.minSavingsUsd, prefs.minSavingsPct * totalUS.value)
  if (abs < NEUTRAL()) return { emoji: '⚖️', label: 'Same', class: 'bg-neutral-100 text-neutral-700', title: 'About the same as US' }
  if (d < 0 && abs >= threshold) return { emoji: '✅', label: 'Worth it', class: 'bg-emerald-50 text-emerald-700', title: 'Cheaper than US overall' }
  if (d > 0 && abs >= threshold) return { emoji: '❌', label: 'Not worth it', class: 'bg-red-50 text-red-700', title: 'More expensive than US overall' }
  return { emoji: '⚖️', label: 'Same', class: 'bg-neutral-100 text-neutral-700', title: 'About the same as US' }
})

// Environment badge
const mode = import.meta.env.MODE || 'production'
const envLabel = (mode === 'development') ? 'Dev' : (mode === 'production') ? 'Prod' : mode
const envBadgeClass = computed(() =>
  mode === 'development'
    ? 'border-emerald-200 bg-emerald-50'
    : 'border-neutral-200 bg-neutral-50'
)
const prefs = usePrefsStore()

</script>
