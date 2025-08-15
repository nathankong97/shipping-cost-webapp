import { defineStore } from 'pinia'
import { useItemsStore } from './items'

export type Box = {
  L: number
  W: number
  H: number
  // kept for compatibility; not used for actual calculation
  weightKg: number
}

const VOLUMETRIC_DIVISOR = 5000

export const useConfigStore = defineStore('config', {
  state: () => ({
    box: { L: 30, W: 20, H: 15, weightKg: 0 } as Box,
    volumetricDivisor: VOLUMETRIC_DIVISOR,
    overheadPct: 6 as number // default overhead %
  }),
  getters: {
    volumetricKg: (s) => (s.box.L * s.box.W * s.box.H) / s.volumetricDivisor,

    // Raw actual from items table: grams -> kg
    actualWeightKgRaw: () => {
      const items = useItemsStore()
      return (items.totalWeightG || 0) / 1000
    },

    // Apply overhead percentage
    actualWeightWithOverheadKg(): number {
      return this.actualWeightKgRaw * (1 + (this.overheadPct || 0) / 100)
    },

    // Chargeable = max(volumetric, actual + overhead)
    chargeableKg(): number {
      return Math.max(this.actualWeightWithOverheadKg, this.volumetricKg)
    }
  },
  actions: {
    setBox(patch: Partial<Box>) {
      this.box = { ...this.box, ...patch }
    },
    setOverheadPct(pct: number) {
      const n = Number(pct)
      this.overheadPct = Number.isFinite(n) ? Math.max(0, n) : 0
    }
  },
  persist: true
})
