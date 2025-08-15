import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './style.css'
import { useShippingStore } from './stores/shipping'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPersist)

const ship = useShippingStore(pinia)
ship.resetResults()

app.use(pinia)

import { useThemeStore } from './stores/theme'
const theme = useThemeStore()
theme.init()

app.mount('#app')
