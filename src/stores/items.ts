import { defineStore } from 'pinia'

export type Item = {
  id: string
  name: string
  weightG: number   // per-item grams
  priceJP: number   // per-item USD (Japan site)
  priceUS: number   // per-item USD (US market)
  qty: number       // quantity (>=1)
}

function uid() { return Math.random().toString(36).slice(2, 10) }

export const useItemsStore = defineStore('items', {
  state: () => ({
    items: [
      { id: uid(), name: 'Sample', weightG: 500, priceJP: 12, priceUS: 15, qty: 1 } as Item
    ]
  }),
  getters: {
    // IMPORTANT: totals now multiply by qty
    totalWeightG: (s) => s.items.reduce((acc, r) => acc + (Number(r.weightG) || 0) * (Number(r.qty) || 0), 0),
    totalJP:      (s) => s.items.reduce((acc, r) => acc + (Number(r.priceJP) || 0) * (Number(r.qty) || 0), 0),
    totalUS:      (s) => s.items.reduce((acc, r) => acc + (Number(r.priceUS) || 0) * (Number(r.qty) || 0), 0),
    totalQty:     (s) => s.items.reduce((acc, r) => acc + (Number(r.qty) || 0), 0),
  },
  actions: {
    addRow() {
      this.items.push({ id: uid(), name: '', weightG: 0, priceJP: 0, priceUS: 0, qty: 1 })
    },
    removeRow(id: string) { this.items = this.items.filter(r => r.id !== id) },
    updateRow(id: string, patch: Partial<Item>) {
      const i = this.items.findIndex(r => r.id === id)
      if (i !== -1) this.items[i] = { ...this.items[i], ...patch }
    }
  },
  persist: true
})
