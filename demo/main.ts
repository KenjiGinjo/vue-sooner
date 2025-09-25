import { createApp } from 'vue'
import { createVueToast, Toaster } from '../src'
import Demo from './Demo.vue'
import '../src/style.css'

const app = createApp(Demo)
app.use(createVueToast())
app.component('Toaster', Toaster)
app.mount('#app')
