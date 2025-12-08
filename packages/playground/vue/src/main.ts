import { createApp } from 'vue';
import { createPinia } from 'pinia';

import './globals.css';

import App from './App.vue';
import { createToastflow } from 'vue-toastflow';

const app = createApp(App);

app.use(createPinia());
app.use(createToastflow());

app.mount('#app');
