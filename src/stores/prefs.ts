import { defineStore } from 'pinia'

function toNum(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export const usePrefsStore = defineStore('prefs', {
  state: () => ({
    minSavingsUsd: 5,      // absolute savings required to be “worth it”
    minSavingsPct: 0.05,   // percentage (0.05 = 5%)
    neutralBandUsd: 1,     // |Δ| < band => “same”
  }),
  getters: {
    // Convenience getters if you want to show % in UI
    minSavingsPctPercent: (s) => Math.round(s.minSavingsPct * 10000) / 100, // 0.05 => 5.00
  },
  actions: {
    setMinSavingsUsd(v: unknown) {
      this.minSavingsUsd = clamp(toNum(v), 0, 1_000_000)
    },
    setMinSavingsPctFraction(v: unknown) {
      // expects fraction (0.08 for 8%)
      this.minSavingsPct = clamp(toNum(v), 0, 1)
    },
    setMinSavingsPctPercent(v: unknown) {
      // expects percent input (8 for 8%)
      this.minSavingsPct = clamp(toNum(v) / 100, 0, 1)
    },
    setNeutralBandUsd(v: unknown) {
      this.neutralBandUsd = clamp(toNum(v), 0, 1_000_000)
    },
    resetDefaults() {
      this.minSavingsUsd = 5
      this.minSavingsPct = 0.05
      this.neutralBandUsd = 1
    },
  },
  // Persist (works if you use pinia-plugin-persistedstate)
  persist: {
    key: 'prefs',
  } as any,
})
