// src/stores/fx.ts
import { defineStore } from 'pinia'

type FxApiResponse = {
  result?: string
  rates?: Record<string, number>
  time_last_update_unix?: number
}

const LS_KEY_RATE = 'fx:jpyUsdRate'
const LS_KEY_TS = 'fx:jpyUsdTs'
const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000 // 12h; adjust if you want 24h

export const useFxStore = defineStore('fx', {
  state: () => ({
    jpyUsdRate: null as number | null,
    lastFetched: null as number | null, // unix ms
    isLoading: false as boolean,
    error: '' as string | '',
  }),
  getters: {
    hasFreshRate: (s) => {
      if (s.jpyUsdRate == null || s.lastFetched == null) return false
      return Date.now() - s.lastFetched < DEFAULT_TTL_MS
    },
  },
  actions: {
    loadFromStorage() {
      const r = localStorage.getItem(LS_KEY_RATE)
      const t = localStorage.getItem(LS_KEY_TS)
      const rate = r ? Number(r) : NaN
      const ts = t ? Number(t) : NaN
      if (Number.isFinite(rate) && Number.isFinite(ts)) {
        this.jpyUsdRate = rate
        this.lastFetched = ts
      }
    },
    saveToStorage() {
      if (this.jpyUsdRate != null && this.lastFetched != null) {
        localStorage.setItem(LS_KEY_RATE, String(this.jpyUsdRate))
        localStorage.setItem(LS_KEY_TS, String(this.lastFetched))
      }
    },
    /** Ensure we have a fresh JPY→USD rate in memory (uses TTL cache). */
    async ensureJPYUSD() {
      if (this.jpyUsdRate == null || this.lastFetched == null) {
        this.loadFromStorage()
      }
      if (this.hasFreshRate) return this.jpyUsdRate

      if (this.isLoading) return this.jpyUsdRate
      this.isLoading = true
      this.error = ''

      try {
        const res = await fetch('https://open.er-api.com/v6/latest/JPY', {
          method: 'GET',
          headers: { accept: 'application/json' },
        })
        if (!res.ok) {
          this.error = `HTTP ${res.status}`
          return this.jpyUsdRate
        }
        const data = (await res.json()) as FxApiResponse
        const usd = data?.rates?.USD
        if (typeof usd === 'number' && Number.isFinite(usd)) {
          this.jpyUsdRate = usd
          this.lastFetched = Date.now()
          this.saveToStorage()
        } else {
          this.error = 'Invalid FX payload'
        }
        return this.jpyUsdRate
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Network error'
        return this.jpyUsdRate
      } finally {
        this.isLoading = false
      }
    },
    /** Convert JPY → USD using current rate; returns null if missing. */
    fromJPY(amountJPY: number | null): number | null {
      if (amountJPY == null || this.jpyUsdRate == null) return null
      return amountJPY * this.jpyUsdRate
    },
  },
})
