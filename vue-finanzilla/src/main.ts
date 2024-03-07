import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
import './assets/tailwind.css'
// Import Vuetify styles

const vuetify = createVuetify()

const app = createApp(App)

app.use(vuetify)

app.use(router)

app.mount('#app')
