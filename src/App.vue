<template>
  <div class="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
    <!-- Header -->
    <HeaderBar version="1.0" />

    <!-- Main content -->
    <main class="mx-auto max-w-6xl px-6 py-8 space-y-6">
      <!-- Inputs grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BoxInputs />
        <DeliveryService />
      </div>

      <!-- Items table (full width) -->
      <ItemsTable />

      <!-- Divider between inputs and results -->
      <SectionDivider label="Results (Japan → US)" />

      <!-- Results toolbar (desktop) -->
      <div class="hidden md:flex items-center justify-between">
        <div class="flex items-center gap-3 ml-auto">
          <!-- staleness badge -->
          <span v-if="ship.isStale" class="inline-flex items-center rounded-md border px-2 py-1 text-xs
                   border-amber-300 bg-amber-50 text-amber-800
                   dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200"
            title="Inputs changed since last calculation">
            Results may be outdated
          </span>

          <!-- validation hint -->
          <span v-if="formInvalid" class="text-xs text-red-600 dark:text-red-400">
            Fix highlighted fields to calculate.
          </span>

          <!-- Calculate button -->
          <button type="button" :disabled="ship.isLoading || formInvalid" @click="onCalculate" class="!cursor-pointer inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium
                   bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none
                   focus:ring-2 focus:ring-indigo-500
                   dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-400
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors select-none">
            <svg v-if="ship.isLoading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span>{{ ship.isStale ? 'Recalculate' : 'Calculate' }}</span>
          </button>
        </div>
      </div>

      <!-- Results -->
      <ResultsCard v-if="hasResult || ship.isLoading" />
      <ResultsTable />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

import HeaderBar from './components/HeaderBar.vue'
import SectionDivider from './components/SectionDivider.vue'
import BoxInputs from './components/BoxInputs.vue'
import ItemsTable from './components/ItemsTable.vue'
import DeliveryService from './components/DeliveryService.vue'
import ResultsCard from './components/ResultsCard.vue'
import ResultsTable from './components/ResultsTable.vue'
import { useFxStore } from './stores/fx'
import { useShippingStore } from './stores/shipping'
import { useItemsStore } from './stores/items'
import { useConfigStore } from './stores/config'
import { useThemeStore } from './stores/theme'

const ship = useShippingStore()
const items = useItemsStore()
const fx = useFxStore()
const cfg = useConfigStore()
const theme = useThemeStore()

const hasResult = computed(() => !!ship.lastCalc?.tenso)

// Inline validation summary (Calculate disabled when true)
const hasItemErrors = computed(() =>
  items.items.some(r =>
    !Number.isFinite(Number(r.qty)) || Math.floor(Number(r.qty)) < 1 ||
    !Number.isFinite(Number(r.weightG)) || Number(r.weightG) < 0 ||
    !Number.isFinite(Number(r.priceJP)) || Number(r.priceJP) < 0 ||
    !Number.isFinite(Number(r.priceUS)) || Number(r.priceUS) < 0
  )
)
const hasBoxErrors = computed(() =>
  Number(cfg.box.L) <= 0 || Number(cfg.box.W) <= 0 || Number(cfg.box.H) <= 0 ||
  Number(cfg.overheadPct) < 0 || Number(cfg.overheadPct) > 100
)
const formInvalid = computed(() => hasItemErrors.value || hasBoxErrors.value)

async function onCalculate() {
  await ship.calculate()
}

// Keyboard shortcut: Cmd/Ctrl + Enter to (Re)Calculate
onMounted(() => {
  theme.init()
  fx.ensureJPYUSD()
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'enter') {
      if (!ship.isLoading && !formInvalid.value) onCalculate()
    }
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})
</script>
