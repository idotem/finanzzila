import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createVuetify } from 'vuetify';
import './assets/tailwind.css';
import 'vuetify/styles';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import { aliases, md } from 'vuetify/iconsets/md';
import './assets/base.css';

const customDarkTheme = {
    dark: true,
    colors: {
        background: '#12121e', // deep modern dark
        surface: '#1e1e2f',   // elevated dark surface
        primary: '#36ffc1',
        secondary: '#10b981',
        error: '#ef4444',
        info: '#36ffc1',
        success: '#22c55e',
        warning: '#f59e0b',
        'app-bar': '#0f0f1a'
    }
};

const customLightTheme = {
    dark: false,
    colors: {
        background: '#f1f5f9', // soft standard light background
        surface: '#ffffff',    // white surface
        primary: '#36ffc1',
        secondary: '#059669',
        error: '#dc2626',
        info: '#36ffc1',
        success: '#16a34a',
        warning: '#d97706',
        'app-bar': '#ffffff'
    }
};

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'customDarkTheme',
        themes: {
            customDarkTheme,
            customLightTheme
        }
    },
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
