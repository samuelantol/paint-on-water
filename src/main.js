import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { InlineSvgPlugin } from 'vue-inline-svg'
import VueSimpleSVG from 'vue-simple-svg'
import VueSvgInlinePlugin from "vue-svg-inline-plugin"

import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

app.use(InlineSvgPlugin)
app.use(VueSimpleSVG)
app.use(VueSvgInlinePlugin)

app.mount('#app')
