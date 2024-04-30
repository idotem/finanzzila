import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createVuetify } from 'vuetify';
import './assets/tailwind.css';
// Import Vuetify styles
import 'material-design-icons-iconfont/dist/material-design-icons.css'; // Ensure your project is capable of handling css files
import { aliases, md } from 'vuetify/iconsets/md';

const vuetify = createVuetify({
    icons: {
        defaultSet: 'md',
        aliases,
        sets: {
            md
        }
    }
});

const app = createApp(App);

app.use(vuetify);

app.use(router);

app.mount('#app');
