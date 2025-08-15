<template>
  <div class="relative" @keydown.esc="open = false">
    <button type="button" @click="open = !open" class="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm
             border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50
             focus:outline-none focus:ring-2 focus:ring-indigo-500
             dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700
             dark:focus:ring-indigo-400" aria-haspopup="dialog" :aria-expanded="open ? 'true' : 'false'"
      title="Worth-it threshold settings">
      <!-- gear icon -->
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-width="1.5" d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
        <path stroke-width="1.5"
          d="M19.4 15.5l1.1 1.9-1.6 1.6-1.9-1.1a7.7 7.7 0 01-2 .8l-.3 2.2h-2.2l-.3-2.2a7.7 7.7 0 01-2-.8l-1.9 1.1-1.6-1.6 1.1-1.9a7.7 7.7 0 01-.8-2l-2.2-.3v-2.2l2.2-.3a7.7 7.7 0 01.8-2L4.2 6l1.6-1.6 1.9 1.1a7.7 7.7 0 012-.8l.3-2.2h2.2l.3 2.2a7.7 7.7 0 012 .8l1.9-1.1L19.6 6l-1.1 1.9c.34.61.62 1.28.8 2l2.2.3v2.2l-2.2.3c-.18.72-.46 1.39-.8 2z" />
      </svg>
      <span class="hidden sm:inline">Settings</span>
    </button>

    <div v-if="open" class="absolute right-0 z-20 mt-2 w-72 rounded-xl border p-3 shadow-lg
             border-neutral-200 bg-white
             dark:border-neutral-700 dark:bg-neutral-900" role="dialog" aria-label="Worth-it threshold settings">
      <div class="space-y-2 text-sm">
        <div>
          <label class="block text-xs text-neutral-600 dark:text-neutral-300">Minimum savings (USD)</label>
          <input type="number" min="0" step="0.01" v-model.number="minUsdLocal" @change="onMinUsdChange" class="mt-1 w-full rounded-md border px-2 py-1.5 text-right
                   border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400
                   dark:focus:ring-indigo-400" />
        </div>

        <div>
          <label class="block text-xs text-neutral-600 dark:text-neutral-300">Minimum savings (%)</label>
          <div class="relative">
            <input type="number" min="0" max="100" step="0.1" v-model.number="minPctPercentLocal"
              @change="onMinPctChange" class="mt-1 w-full rounded-md border px-2 py-1.5 pr-8 text-right
                     border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                     dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400
                     dark:focus:ring-indigo-400" />
            <span
              class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-neutral-500 dark:text-neutral-400">%</span>
          </div>
          <p class="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">Example: enter 5 for 5%.</p>
        </div>

        <div>
          <label class="block text-xs text-neutral-600 dark:text-neutral-300">Neutral band (USD)</label>
          <input type="number" min="0" step="0.01" v-model.number="neutralBandLocal" @change="onNeutralChange" class="mt-1 w-full rounded-md border px-2 py-1.5 text-right
                   border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400
                   dark:focus:ring-indigo-400" />
          <p class="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">Treat |Δ| below this as “About the same”.
          </p>
        </div>

        <div class="flex items-center justify-between pt-1">
          <button type="button" @click="reset" class="text-xs text-neutral-600 hover:underline dark:text-neutral-300">
            Reset defaults
          </button>
          <button type="button" @click="open = false" class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700
                   focus:outline-none focus:ring-2 focus:ring-indigo-500
                   dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-400">
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { usePrefsStore } from '../stores/prefs'

const open = ref(false)
const prefs = usePrefsStore()

// Local UI models (USD and % views)
const minUsdLocal = ref<number>(prefs.minSavingsUsd)
const minPctPercentLocal = ref<number>(prefs.minSavingsPct * 100)
const neutralBandLocal = ref<number>(prefs.neutralBandUsd)

watchEffect(() => {
  // keep local in sync if store changes elsewhere
  minUsdLocal.value = prefs.minSavingsUsd
  minPctPercentLocal.value = Math.round(prefs.minSavingsPct * 10000) / 100
  neutralBandLocal.value = prefs.neutralBandUsd
})

function onMinUsdChange() { prefs.setMinSavingsUsd(minUsdLocal.value) }
function onMinPctChange() { prefs.setMinSavingsPctPercent(minPctPercentLocal.value) }
function onNeutralChange() { prefs.setNeutralBandUsd(neutralBandLocal.value) }
function reset() { prefs.resetDefaults() }
</script>
