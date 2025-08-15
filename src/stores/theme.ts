// src/stores/theme.ts
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

function prefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

function applyHtmlClass(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'system' as ThemeMode,
  }),
  getters: {
    resolvedMode(state): ThemeMode {
      if (state.mode !== 'system') return state.mode
      return prefersDark() ? 'dark' : 'light'
    },
    isDark(): boolean {
      return this.resolvedMode === 'dark'
    },
  },
  actions: {
    apply() {
      // <-- this is the key line
      applyHtmlClass(this.isDark)
    },
    setMode(mode: ThemeMode) {
      this.mode = mode
      localStorage.setItem(STORAGE_KEY, mode)
      this.apply()
    },
    init() {
      // Apply immediately on load
      this.apply()

      // When in system mode, follow OS changes
      const media = window.matchMedia?.('(prefers-color-scheme: dark)')
      const handler = () => { if (this.mode === 'system') this.apply() }
      if (media?.addEventListener) media.addEventListener('change', handler)
      else if ((media as any)?.addListener) (media as any).addListener(handler) // older Safari
    },
  },
  // If you want pinia-persistedstate as well, keep it:
  persist: { key: 'theme' } as any,
})
