<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium text-neutral-900 dark:text-neutral-100">Items</h3>
      <button type="button" @click="addRow" class="rounded-lg border px-3 py-1.5 text-sm font-medium
               border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-50
               dark:border-neutral-700 dark:text-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700
               focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400">
        + Add row
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="text-left text-sm text-neutral-600 dark:text-neutral-300">
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4">Item name</th>
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right">Qty</th>
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right">Weight / item (g)</th>
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right">Price in Japan (USD)
            </th>
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right">Price in US (USD)</th>
            <th class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-0"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in items" :key="row.id" class="text-sm align-top">
            <!-- Name (optional) -->
            <td class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4">
              <input type="text" v-model.trim="row.name" @input="onEdit(row.id, { name: row.name })" class="w-full rounded-md border px-2 py-1
                       border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
                placeholder="e.g., Shampoo" />
            </td>

            <!-- Qty -->
            <td class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right tabular-nums">
              <input type="number" inputmode="numeric" min="1" step="1" v-model.number="row.qty"
                @input="onEdit(row.id, { qty: clampInt(row.qty, 1) })"
                :aria-invalid="isQtyInvalid(row) ? 'true' : 'false'"
                :aria-describedby="isQtyInvalid(row) ? ('err-qty-' + row.id) : undefined" class="rounded-md border px-2 py-1
                       border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
                :class="inputClass(isQtyInvalid(row), 'w-20')" />
              <p v-if="isQtyInvalid(row)" :id="'err-qty-' + row.id"
                class="mt-1 text-[11px] text-red-600 dark:text-red-400">
                Qty must be an integer ≥ 1.
              </p>
            </td>

            <!-- Weight / item -->
            <td class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right tabular-nums">
              <input type="number" inputmode="decimal" min="0" step="1" v-model.number="row.weightG"
                @input="onEdit(row.id, { weightG: toNum(row.weightG) })"
                :aria-invalid="isWeightInvalid(row) ? 'true' : 'false'"
                :aria-describedby="isWeightInvalid(row) ? ('err-w-' + row.id) : undefined" class="rounded-md border px-2 py-1
                       border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
                :class="inputClass(isWeightInvalid(row), 'w-28')" />
              <p v-if="isWeightInvalid(row)" :id="'err-w-' + row.id"
                class="mt-1 text-[11px] text-red-600 dark:text-red-400">
                Weight must be ≥ 0 g.
              </p>
              <p v-else class="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                Enter per-item weight in grams.
              </p>
            </td>

            <!-- Price JP (USD) -->
            <td class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right tabular-nums">
              <input type="number" inputmode="decimal" min="0" step="0.01" v-model.number="row.priceJP"
                @input="onEdit(row.id, { priceJP: toNum(row.priceJP) })"
                :aria-invalid="isPriceInvalid(row.priceJP) ? 'true' : 'false'"
                :aria-describedby="isPriceInvalid(row.priceJP) ? ('err-jp-' + row.id) : undefined" class="rounded-md border px-2 py-1
                       border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
                :class="inputClass(isPriceInvalid(row.priceJP), 'w-28')" />
              <p v-if="isPriceInvalid(row.priceJP)" :id="'err-jp-' + row.id"
                class="mt-1 text-[11px] text-red-600 dark:text-red-400">
                Price must be ≥ $0.00 (per item).
              </p>
              <p v-else class="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                Per-item price paid in Japan (USD).
              </p>
            </td>

            <!-- Price US (USD) -->
            <td class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-4 text-right tabular-nums">
              <input type="number" inputmode="decimal" min="0" step="0.01" v-model.number="row.priceUS"
                @input="onEdit(row.id, { priceUS: toNum(row.priceUS) })"
                :aria-invalid="isPriceInvalid(row.priceUS) ? 'true' : 'false'"
                :aria-describedby="isPriceInvalid(row.priceUS) ? ('err-us-' + row.id) : undefined" class="rounded-md border px-2 py-1
                       border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
                :class="inputClass(isPriceInvalid(row.priceUS), 'w-28')" />
              <p v-if="isPriceInvalid(row.priceUS)" :id="'err-us-' + row.id"
                class="mt-1 text-[11px] text-red-600 dark:text-red-400">
                Price must be ≥ $0.00 (per item).
              </p>
              <p v-else class="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                Comparable per-item US price.
              </p>
            </td>

            <!-- Actions -->
            <td class="border-b border-neutral-200 dark:border-neutral-800 py-2 pr-0 text-right">
              <button type="button" @click="removeRow(row.id)" class="rounded-md border px-2 py-1 text-xs
                       border-neutral-300 text-red-600 hover:bg-red-50
                       dark:border-neutral-700 dark:text-red-400 dark:hover:bg-red-500/10
                       focus:outline-none focus:ring-2 focus:ring-red-500/60 dark:focus:ring-red-400/60">
                Delete
              </button>
            </td>
          </tr>
        </tbody>

        <tfoot v-if="items.length">
          <tr class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            <td
              class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-4 text-neutral-600 dark:text-neutral-300">
              Totals:</td>
            <td class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-4 text-right tabular-nums">{{
              totalQty }}</td>
            <td class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-4 text-right tabular-nums">{{
              totalWeightG }}</td>
            <td class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-4 text-right tabular-nums">{{
              totalJP.toFixed(2) }}</td>
            <td class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-4 text-right tabular-nums">{{
              totalUS.toFixed(2) }}</td>
            <td class="border-t border-neutral-200 dark:border-neutral-800 pt-3 pr-0"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>


<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useItemsStore } from '../stores/items'

const store = useItemsStore()
const { items, totalWeightG, totalJP, totalUS, totalQty } = storeToRefs(store)

/* actions */
function addRow() { store.addRow() }
function removeRow(id: string) { store.removeRow(id) }
function onEdit(id: string, patch: Partial<ReturnType<typeof useItemsStore>['items'][number]>) {
  store.updateRow(id, patch)
}

/* validation + helpers */
function toNum(v: unknown) { const n = Number(v); return Number.isFinite(n) ? n : 0 }
function clampInt(v: unknown, min = 1) { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(min, n) : min }

function isQtyInvalid(r: any) { return !Number.isFinite(Number(r.qty)) || Math.floor(Number(r.qty)) < 1 }
function isWeightInvalid(r: any) { return !Number.isFinite(Number(r.weightG)) || Number(r.weightG) < 0 }
function isPriceInvalid(v: unknown) { const n = Number(v); return !Number.isFinite(n) || n < 0 }

function inputClass(invalid: boolean, w = 'w-28') {
  return [
    w, 'rounded-md', 'border', 'px-2', 'py-1', 'text-right',
    invalid ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
      : 'border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  ]
}
</script>
