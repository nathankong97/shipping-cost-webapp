// src/stores/shipping.ts
import { defineStore } from 'pinia'
import { useConfigStore } from './config'
import { useItemsStore } from './items'
import { useFxStore } from './fx'

/** Supported carriers in the UI */
export type Carrier = 'ecms' | 'dhl' | 'ems'

export const CARRIERS: { value: Carrier; label: string }[] = [
  { value: 'ecms', label: 'ECMS' },
  { value: 'dhl',  label: 'DHL'  },
  { value: 'ems',  label: 'EMS'  },
]

/** Map our carrier enum → Tenso's "name" value */
export const TENSO_NAME_BY_CARRIER: Record<Carrier, string> = {
  ecms: 'ECMS',
  dhl: 'DHL',
  ems: 'EMS',
}

type TensoRequest = {
  weight: string
  length: string
  width: string
  height: string
  country_id: string
}

type TensoMethodRaw = {
  shipping_method_id?: number
  name?: string
  can_use?: boolean
  delivery_days?: string | number
  shipping_fee?: string | number
  service_fee?: string | number
  total_fee?: string | number
  original_total_fee?: number
  original_shipping_fee?: number
  original_service_fee?: number
  is_ecms?: boolean
}

type Picked = {
  methodId: number
  name: string
  canUse: boolean
  deliveryDays: string
  shippingFeeJPY: number | null
  serviceFeeJPY: number | null
  totalFeeJPY: number | null
}

type Dims = { L: number; W: number; H: number }

type LastCalc = {
  service: Carrier
  rawKg: number
  overheadPct: number
  actualPlusOverheadKg: number
  volumetricKg: number
  chargeableKg: number
  totalItems: number
  dims: Dims
  inputHash: string
  tenso?: {
    ok: boolean
    status?: number
    error?: string
    data?: unknown
    picked?: Picked
  }
}

/* ---------------------------- helpers ---------------------------- */

function parseJPY(v: string | number | undefined): number | null {
  if (v === undefined || v === null) return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  const s = String(v).trim()
  if (s === '' || s === '--') return null
  const n = Number(s.replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

function pickMethod(data: unknown, carrier: Carrier): TensoMethodRaw | undefined {
  if (!Array.isArray(data)) return undefined
  const target = TENSO_NAME_BY_CARRIER[carrier]
  const list = data as TensoMethodRaw[]
  // For ECMS, also accept the boolean flag
  return list.find((r) =>
    (carrier === 'ecms' && (r?.is_ecms || r?.name === target)) ||
    (carrier !== 'ecms' && r?.name === target)
  )
}

/** Compact fingerprint of inputs used for the current calculation. */
function snapHash(s: { service: Carrier; dims: Dims; actualPlusOverheadKg: number }): string {
  return JSON.stringify({
    s: s.service,
    L: Math.round(s.dims.L),
    W: Math.round(s.dims.W),
    H: Math.round(s.dims.H),
    g: Math.round(s.actualPlusOverheadKg * 1000), // grams
  })
}

/* ------------------------------ store ------------------------------ */

export const useShippingStore = defineStore('shipping', {
  state: () => ({
    service: 'ecms' as Carrier,
    includeServiceFee: true as boolean, // allocate shipping + service by default
    lastCalc: null as LastCalc | null,
    isLoading: false as boolean,
  }),
  getters: {
    /** Snapshot current inputs used for calculation/results (getter, not action). */
    inputSnapshot(): Omit<LastCalc, 'tenso' | 'inputHash'> {
      const cfg = useConfigStore()
      const items = useItemsStore()
      return {
        service: this.service,
        rawKg: cfg.actualWeightKgRaw,
        overheadPct: cfg.overheadPct,
        actualPlusOverheadKg: cfg.actualWeightWithOverheadKg,
        volumetricKg: cfg.volumetricKg,
        chargeableKg: cfg.chargeableKg,
        totalItems: items.items.length,
        dims: { L: cfg.box.L, W: cfg.box.W, H: cfg.box.H },
      }
    },

    /** Base JPY amount used for allocation (null if no result yet). */
    shippingAllocBaseJPY(state): number | null {
      const p = state.lastCalc?.tenso?.picked
      if (!p) return null
      return state.includeServiceFee ? (p.totalFeeJPY ?? null) : (p.shippingFeeJPY ?? null)
    },

    /** Allocation base converted to USD using cached FX (null if rate missing). */
    shippingAllocBaseUSD(): number | null {
      const jpy = this.shippingAllocBaseJPY
      if (jpy == null) return null
      const fx = useFxStore()
      return fx.fromJPY(jpy)
    },

    /** True if current inputs differ from those that produced lastCalc. */
    isStale(): boolean {
      if (!this.lastCalc) return false
      const s = this.inputSnapshot
      const now = snapHash({ service: s.service, dims: s.dims, actualPlusOverheadKg: s.actualPlusOverheadKg })
      return now !== this.lastCalc.inputHash
    },
  },
  actions: {
    setService(s: Carrier) { this.service = s },
    setIncludeServiceFee(v: boolean) { this.includeServiceFee = !!v },
    resetResults() { this.lastCalc = null },

    /** Run the Tenso estimate and store parsed results */
    async calculate() {
      if (this.isLoading) return this.lastCalc // guard double-clicks

      // Clear old result and start spinner
      this.lastCalc = null
      this.isLoading = true

      const snap = this.inputSnapshot
      const hash = snapHash({ service: snap.service, dims: snap.dims, actualPlusOverheadKg: snap.actualPlusOverheadKg })

      // Build payload using ACTUAL + OVERHEAD (kg → grams, integer)
      const grams = Math.max(1, Math.ceil(snap.actualPlusOverheadKg * 1000))
      const payload: TensoRequest = {
        weight: String(grams),
        length: String(Math.max(1, Math.ceil(snap.dims.L))),
        width:  String(Math.max(1, Math.ceil(snap.dims.W))),
        height: String(Math.max(1, Math.ceil(snap.dims.H))),
        country_id: '231', // USA (make configurable later)
      }

      const fx = useFxStore()
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

      try {
        const [res] = await Promise.all([
          fetch('/proxy/tenso/api/en/estimate', {
            method: 'POST',
            headers: {
              'content-type': 'application/json;charset=UTF-8',
              accept: 'application/json, text/plain, */*',
            },
            body: JSON.stringify(payload),
          }),
          fx.ensureJPYUSD(),   // ensure FX in parallel
          sleep(400),          // keep spinner visible for smoother UX
        ])

        if (!res.ok) {
          const text = await res.text().catch(() => '')
          this.lastCalc = {
            ...snap,
            inputHash: hash,
            tenso: { ok: false, status: res.status, error: text || 'HTTP error' },
          }
          return this.lastCalc
        }

        const data: unknown = await res.json()
        const chosen = pickMethod(data, this.service)

        const picked: Picked | undefined = chosen
          ? {
              methodId: chosen.shipping_method_id ?? -1,
              name: chosen.name ?? '',
              canUse: !!chosen.can_use,
              deliveryDays: String(chosen.delivery_days ?? ''),
              shippingFeeJPY: parseJPY(chosen.original_shipping_fee ?? chosen.shipping_fee),
              serviceFeeJPY:  parseJPY(chosen.original_service_fee  ?? chosen.service_fee),
              totalFeeJPY:    parseJPY(chosen.original_total_fee    ?? chosen.total_fee),
            }
          : undefined

        this.lastCalc = {
          ...snap,
          inputHash: hash,
          tenso: { ok: true, data, picked },
        }
        return this.lastCalc
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Network error'
        this.lastCalc = {
          ...snap,
          inputHash: hash,
          tenso: { ok: false, error: msg },
        }
        return this.lastCalc
      } finally {
        this.isLoading = false
      }
    },
  },
})
