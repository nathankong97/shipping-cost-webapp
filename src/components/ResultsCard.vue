<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useShippingStore } from '../stores/shipping'
import { useFxStore } from '../stores/fx'

const ship = useShippingStore()
const fx = useFxStore()

const { lastCalc } = storeToRefs(ship)
const loading = computed(() => ship.isLoading)
const picked = computed(() => lastCalc.value?.tenso?.picked ?? null)

function formatJPY(n: number | null) {
  if (n == null || Number.isNaN(n)) return '—'
  try { return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(n) }
  catch { return `${n.toLocaleString()} JPY` }
}
function formatUSD(n: number | null) {
  if (n == null || Number.isNaN(n)) return '—'
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }
  catch { return `$${n.toFixed(2)}` }
}
const rateInfo = computed(() => {
  if (fx.jpyUsdRate == null) return null
  return { rate: fx.jpyUsdRate, ts: fx.lastFetched }
})
function jpyToUsd(n: number | null) {
  return n == null ? null : fx.fromJPY(n)
}
</script>

<template>
  <section class="rounded-2xl border p-6 shadow-sm bg-white dark:bg-neutral-900 dark:border-neutral-800">
    <h2 class="mb-4 text-base font-medium text-neutral-900 dark:text-neutral-100">Results</h2>

    <!-- Loading skeleton -->
    <div v-if="loading" class="animate-pulse space-y-3">
      <div class="h-4 w-40 rounded bg-neutral-200 dark:bg-neutral-800"></div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="h-16 rounded bg-neutral-200 dark:bg-neutral-800"></div>
        <div class="h-16 rounded bg-neutral-200 dark:bg-neutral-800"></div>
        <div class="h-16 rounded bg-neutral-200 dark:bg-neutral-800"></div>
      </div>
    </div>

    <!-- Loaded -->
    <div v-else-if="picked" class="space-y-3 text-sm">
      <div class="flex flex-wrap gap-x-6 gap-y-2">
        <p>
          <span class="text-neutral-500 dark:text-neutral-400">Carrier:</span>
          <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ picked.name }}</span>
        </p>
        <p>
          <span class="text-neutral-500 dark:text-neutral-400">Deliverable:</span>
          <span :class="picked.canUse ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
            {{ picked.canUse ? 'Yes' : 'No' }}
          </span>
        </p>
        <p v-if="picked.deliveryDays">
          <span class="text-neutral-500 dark:text-neutral-400">Days:</span>
          <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ picked.deliveryDays }}</span>
        </p>
      </div>

      <div class="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="rounded-lg border p-3 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <div class="text-xs text-neutral-500 dark:text-neutral-400">Shipping Fee</div>
          <div class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{{ formatJPY(picked.shippingFeeJPY)
            }}</div>
          <div class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">≈ {{
            formatUSD(jpyToUsd(picked.shippingFeeJPY)) }}</div>
        </div>
        <div class="rounded-lg border p-3 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <div class="text-xs text-neutral-500 dark:text-neutral-400">Service Fee</div>
          <div class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{{ formatJPY(picked.serviceFeeJPY)
            }}</div>
          <div class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">≈ {{
            formatUSD(jpyToUsd(picked.serviceFeeJPY)) }}</div>
        </div>
        <div class="rounded-lg border p-3 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <div class="text-xs text-neutral-500 dark:text-neutral-400">Total</div>
          <div class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{{ formatJPY(picked.totalFeeJPY) }}
          </div>
          <div class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">≈ {{
            formatUSD(jpyToUsd(picked.totalFeeJPY)) }}</div>
        </div>
      </div>

      <p v-if="rateInfo" class="text-[11px] text-neutral-500 dark:text-neutral-400">
        FX: 1&nbsp;JPY ≈ {{ rateInfo.rate.toFixed(6) }}&nbsp;USD
        <span v-if="rateInfo.ts">&nbsp;•&nbsp;updated {{ new Date(rateInfo.ts).toLocaleString() }}</span>
      </p>
      <p v-else class="text-[11px] text-amber-600 dark:text-amber-400">
        FX rate unavailable — USD shown as “—”. (Check network / try again.)
      </p>
    </div>

    <div v-else class="text-sm text-neutral-600 dark:text-neutral-300">
      No matching method found for the selected carrier.
    </div>
  </section>

  <div v-if="ship.isStale" class="mb-3 rounded-md border px-3 py-2 text-sm
           border-amber-300 bg-amber-50 text-amber-800
           dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">
    Results may be outdated.
    <button
      class="underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-amber-500/60 dark:focus:ring-amber-400/60"
      @click="$emit('recalc')">
      Recalculate
    </button>
  </div>
</template>
