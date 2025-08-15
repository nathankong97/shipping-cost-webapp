<template>
  <div class="space-y-2">
    <span class="block text-xs text-neutral-500 dark:text-neutral-400">Delivery Service</span>

    <!-- Segmented options -->
    <div role="radiogroup" aria-label="Delivery Service" class="flex flex-wrap gap-2">
      <label v-for="opt in options" :key="opt.value" class="cursor-pointer">
        <!-- Keep real radios for accessibility -->
        <input class="sr-only peer" type="radio" name="carrier" :value="opt.value" v-model="service" />
        <div class="rounded-lg border px-3 py-1.5 text-sm select-none
                 border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-50
                 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700
                 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500

                 dark:border-neutral-700 dark:text-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700
                 dark:peer-checked:border-indigo-400 dark:peer-checked:bg-indigo-500/15 dark:peer-checked:text-indigo-200
                 dark:peer-focus-visible:ring-indigo-400">
          {{ opt.label }}
        </div>
      </label>
    </div>

    <p class="text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
      Choose the carrier for rate rules. Default is ECMS.
    </p>
  </div>
</template>


<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useShippingStore, CARRIERS } from '../stores/shipping'

const ship = useShippingStore()
const { service } = storeToRefs(ship)
const options = CARRIERS
</script>
