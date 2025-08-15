<template>
  <section class="rounded-2xl border p-6 shadow-sm bg-white dark:bg-neutral-900 dark:border-neutral-800">
    <h2 class="mb-4 text-base font-medium text-neutral-900 dark:text-neutral-100">Per-item Breakdown</h2>

    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="text-left text-sm text-neutral-600 dark:text-neutral-300">
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4">Item</th>
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right">Qty</th>
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right">Price in Japan (USD)
            </th>
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right">Price in US (USD)</th>
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right">Ship (USD / item)</th>
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right">Landed (USD / item)
            </th>
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right">Δ vs US (USD)</th>
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-0  text-right">Verdict</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, idx) in rows" :key="row.id" class="text-sm">
            <!-- Item -->
            <td class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4">
              <span class="block truncate text-neutral-900 dark:text-neutral-100">{{ row.name || '—' }}</span>
            </td>

            <!-- Qty -->
            <td
              class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
              {{ clampInt(row.qty) }}
            </td>

            <!-- Price JP -->
            <td
              class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
              {{ formatUSD(toNum(row.priceJP)) }}
            </td>

            <!-- Price US -->
            <td
              class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
              {{ formatUSD(toNum(row.priceUS)) }}
            </td>

            <!-- Ship / item -->
            <td class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right tabular-nums">
              <span v-if="ready" class="text-neutral-900 dark:text-neutral-100">{{ formatUSD(shipPerItem(idx)) }}</span>
              <span v-else class="text-neutral-400 dark:text-neutral-500">—</span>
            </td>

            <!-- Landed / item -->
            <td class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right tabular-nums">
              <span v-if="ready" class="text-neutral-900 dark:text-neutral-100">{{ formatUSD(landedPerItem(idx))
                }}</span>
              <span v-else class="text-neutral-400 dark:text-neutral-500">—</span>
            </td>

            <!-- Δ vs US -->
            <td class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right tabular-nums">
              <span v-if="ready" :class="deltaClass(deltaPerItem(idx))">
                {{ formatUSD(deltaPerItem(idx)) }}
              </span>
              <span v-else class="text-neutral-400 dark:text-neutral-500">—</span>
            </td>

            <!-- Verdict -->
            <td class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-0 text-right">
              <span v-if="ready" :class="verdictFor(idx).class" :title="verdictFor(idx).title"
                :aria-label="verdictFor(idx).title">
                {{ verdictFor(idx).emoji }} {{ verdictFor(idx).label }}
              </span>
              <span v-else class="text-neutral-400 dark:text-neutral-500">—</span>
            </td>
          </tr>
        </tbody>

        <tfoot v-if="rows.length">
          <tr class="text-sm font-medium">
            <td
              class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-4 text-neutral-600 dark:text-neutral-300">
              Totals:</td>
            <td
              class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-4 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
              {{ totalQty }}</td>
            <td
              class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-4 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
              {{ formatUSD(totalJP) }}</td>
            <td
              class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-4 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
              {{ formatUSD(totalUS) }}</td>
            <td class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-4 text-right tabular-nums">
              <span class="text-neutral-900 dark:text-neutral-100">{{ ready ? formatUSD(allocUSD) : '—' }}</span>
            </td>
            <td class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-4 text-right tabular-nums">
              <span class="text-neutral-900 dark:text-neutral-100">{{ ready ? formatUSD(totalJP + allocUSD) : '—'
                }}</span>
            </td>
            <td class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-4 text-right tabular-nums"
              :class="ready ? deltaClass(totalDelta) : ''">
              {{ ready ? formatUSD(totalDelta) : '—' }}
            </td>
            <td class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-0 text-right">
              <span v-if="ready" :class="overallVerdict.class" :title="overallVerdict.title"
                :aria-label="overallVerdict.title">
                {{ overallVerdict.emoji }} {{ overallVerdict.label }}
              </span>
              <span v-else class="text-neutral-400 dark:text-neutral-500">—</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p class="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
      Shipping allocated by total weight (qty x grams). {{ includeService ? 'Includes service fee.' : 'Excludes service fee.' }}
    </p>
  </section>
</template>


<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useItemsStore } from '../stores/items'
import { useShippingStore } from '../stores/shipping'
import type { Item } from '../stores/items'
import { allocateByWeightExact } from '../lib/allocate'
import { usePrefsStore } from '../stores/prefs'

const prefs = usePrefsStore()
const itemsStore = useItemsStore()
const { items } = storeToRefs(itemsStore)
const ship = useShippingStore()

const includeService = computed(() => ship.includeServiceFee)
const rows = computed(() => items.value as Item[])

/* ---------- helpers ---------- */
const toNum = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const clampInt = (v: unknown) => Math.max(1, Math.floor(toNum(v)) || 1)

/* ---------- totals (respect qty) ---------- */
const totalQty = computed(() => rows.value.reduce((a, r) => a + clampInt(r.qty), 0))
const totalWeightG = computed(() => rows.value.reduce((a, r) => a + toNum(r.weightG) * clampInt(r.qty), 0))
const totalJP = computed(() => rows.value.reduce((a, r) => a + toNum(r.priceJP) * clampInt(r.qty), 0))
const totalUS = computed(() => rows.value.reduce((a, r) => a + toNum(r.priceUS) * clampInt(r.qty), 0))

/* ---------- allocation base (USD) ---------- */
const allocUSDRaw = computed(() => ship.shippingAllocBaseUSD)   // number | null
const allocUSD = computed(() => allocUSDRaw.value ?? 0)      // number (0 when null)
const ready = computed(() =>
  // “ready” once we’ve run a calc (even if base is 0) and there is weight,
  // and the base is not null (null means no FX/parse)
  !!ship.lastCalc?.tenso && totalWeightG.value > 0 && allocUSDRaw.value !== null
)

/* ---------- exact-cent allocation ---------- */
// Per-line total weights (qty × grams)
const weightsByRow = computed(() => rows.value.map(r => toNum(r.weightG) * clampInt(r.qty)))

// Per-line shipping (USD) that sums EXACTLY to allocUSD
const perLineShipUSD = computed<number[]>(() => {
  if (!ready.value) return rows.value.map(() => 0)
  return allocateByWeightExact(weightsByRow.value, allocUSD.value, 2)
})

/* ---------- per-item derived values ---------- */
function shipPerItem(idx: number): number {
  const lineShip = perLineShipUSD.value[idx] || 0
  const qty = clampInt(rows.value[idx].qty)
  if (qty <= 0) return 0
  return lineShip / qty
}
function landedPerItem(idx: number): number {
  return toNum(rows.value[idx].priceJP) + shipPerItem(idx)
}
function deltaPerItem(idx: number): number {
  return landedPerItem(idx) - toNum(rows.value[idx].priceUS)
}

/* ---------- totals row sanity ---------- */
const totalDelta = computed(() => (totalJP.value + allocUSD.value) - totalUS.value)

/* ---------- styling & verdicts ---------- */
const NEUTRAL_BAND_USD = 1
function deltaClass(n: number) {
  const abs = Math.abs(n)
  if (abs < NEUTRAL_BAND_USD) return 'text-neutral-600'
  return n < 0 ? 'text-emerald-600' : 'text-red-600'
}

function verdict(delta: number, usPrice: number) {
  const abs = Math.abs(delta)
  const threshold = Math.max(prefs.minSavingsUsd, prefs.minSavingsPct * usPrice)
  if (abs < prefs.neutralBandUsd) return { emoji: '⚖️', label: 'Same', class: 'text-neutral-600', title: 'About the same as US' }
  if (delta < 0 && abs >= threshold) return { emoji: '✅', label: 'Worth it', class: 'text-emerald-600', title: 'Cheaper than US' }
  if (delta > 0 && abs >= threshold) return { emoji: '❌', label: 'Not worth it', class: 'text-red-600', title: 'More expensive than US' }
  return { emoji: '⚖️', label: 'Same', class: 'text-neutral-600', title: 'About the same as US' }
}
function verdictFor(idx: number) {
  if (!ready.value) return { emoji: '—', label: '', class: 'text-neutral-400', title: 'No shipping yet' }
  return verdict(deltaPerItem(idx), toNum(rows.value[idx].priceUS))
}
const overallVerdict = computed(() => verdict(totalDelta.value, totalUS.value))

/* ---------- formatting ---------- */
function formatUSD(n: number) {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }
  catch { return `$${n.toFixed(2)}` }
}
</script>
