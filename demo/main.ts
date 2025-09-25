import { createApp } from 'vue'
import { createVueToast, Toaster } from '../src'
import Template from './template.vue'
import '../src/style.css'

const app = createApp(Template)
app.use(createVueToast())
app.component('Toaster', Toaster)
app.mount('#app')
