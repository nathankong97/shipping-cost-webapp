<template>
  <section class="rounded-2xl border p-6 shadow-sm bg-white dark:bg-neutral-900 dark:border-neutral-800">
    <h2 class="mb-4 text-base font-medium text-neutral-900 dark:text-neutral-100">Box & Weight</h2>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <!-- Length -->
      <div>
        <label class="block text-xs text-neutral-600 dark:text-neutral-300">Length (cm)</label>
        <input type="number" inputmode="decimal" min="0.1" step="0.1" v-model.number="box.L" class="w-full rounded-lg border bg-white text-neutral-900 placeholder-neutral-400
                 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400 dark:border-neutral-700"
          :class="fieldClass(invalidL)" :aria-invalid="invalidL ? 'true' : 'false'"
          :aria-describedby="invalidL ? 'err-L' : undefined" />
        <p v-if="invalidL" id="err-L" class="mt-1 text-[11px] text-red-600 dark:text-red-400">Must be &gt; 0 cm.</p>
        <p v-else class="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">Inner length in centimeters.</p>
      </div>

      <!-- Width -->
      <div>
        <label class="block text-xs text-neutral-600 dark:text-neutral-300">Width (cm)</label>
        <input type="number" inputmode="decimal" min="0.1" step="0.1" v-model.number="box.W" class="w-full rounded-lg border bg-white text-neutral-900 placeholder-neutral-400
                 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400 dark:border-neutral-700"
          :class="fieldClass(invalidW)" :aria-invalid="invalidW ? 'true' : 'false'"
          :aria-describedby="invalidW ? 'err-W' : undefined" />
        <p v-if="invalidW" id="err-W" class="mt-1 text-[11px] text-red-600 dark:text-red-400">Must be &gt; 0 cm.</p>
        <p v-else class="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">Inner width in centimeters.</p>
      </div>

      <!-- Height -->
      <div>
        <label class="block text-xs text-neutral-600 dark:text-neutral-300">Height (cm)</label>
        <input type="number" inputmode="decimal" min="0.1" step="0.1" v-model.number="box.H" class="w-full rounded-lg border bg-white text-neutral-900 placeholder-neutral-400
                 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400 dark:border-neutral-700"
          :class="fieldClass(invalidH)" :aria-invalid="invalidH ? 'true' : 'false'"
          :aria-describedby="invalidH ? 'err-H' : undefined" />
        <p v-if="invalidH" id="err-H" class="mt-1 text-[11px] text-red-600 dark:text-red-400">Must be &gt; 0 cm.</p>
        <p v-else class="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">Inner height in centimeters.</p>
      </div>

      <!-- Overhead -->
      <div>
        <label class="block text-xs text-neutral-600 dark:text-neutral-300">Overhead (%)</label>
        <input type="number" inputmode="decimal" min="0" max="100" step="0.1" v-model.number="cfg.overheadPct" class="w-full rounded-lg border bg-white text-neutral-900 placeholder-neutral-400
                 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400 dark:border-neutral-700"
          :class="fieldClass(invalidOverhead)" :aria-invalid="invalidOverhead ? 'true' : 'false'"
          :aria-describedby="invalidOverhead ? 'err-oh' : undefined" />
        <p v-if="invalidOverhead" id="err-oh" class="mt-1 text-[11px] text-red-600 dark:text-red-400">Enter 0-100.</p>
        <p v-else class="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">Adds % to actual item weight (e.g.,
          packaging).</p>
      </div>
    </div>

    <!-- Summary mini-card -->
    <div class="mt-4 rounded-xl border p-4 border-neutral-200 bg-neutral-50
                dark:border-neutral-700 dark:bg-neutral-800">
      <dl class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt class="text-neutral-500 dark:text-neutral-400">Volumetric (kg)</dt>
          <dd class="font-medium text-neutral-900 dark:text-neutral-100">{{ volumetricKg.toFixed(2) }}</dd>
        </div>
        <div>
          <dt class="text-neutral-500 dark:text-neutral-400">Chargeable (kg)</dt>
          <dd class="font-medium text-neutral-900 dark:text-neutral-100">{{ chargeableKg.toFixed(2) }}</dd>
        </div>
      </dl>
      <p class="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
        Weight auto-sums from the Items table. Overhead increases the actual weight before quoting.
      </p>
    </div>
  </section>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '../stores/config'

const cfg = useConfigStore()
const box = cfg.box

/* Validation flags */
const invalidL = computed(() => Number(box.L) <= 0)
const invalidW = computed(() => Number(box.W) <= 0)
const invalidH = computed(() => Number(box.H) <= 0)
const invalidOverhead = computed(() => Number(cfg.overheadPct) < 0 || Number(cfg.overheadPct) > 100)

/* Derived weights you already compute in the store */
const volumetricKg = computed(() => cfg.volumetricKg)
const chargeableKg = computed(() => cfg.chargeableKg)

/* Styling */
function fieldClass(invalid: boolean) {
  return [
    'mt-1 w-full rounded-md border px-2 py-1.5 text-right',
    invalid ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
      : 'border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500',
  ]
}
</script>
