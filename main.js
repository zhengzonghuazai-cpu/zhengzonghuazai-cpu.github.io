// ✅ 已自动填入你的 Supabase 配置
const SUPABASE_URL = 'https://febjruodvvasfxnxnzbf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DlKosig1z4gokZsV_CRtbw_wrBjChzE';

import { createApp } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const routes = {
  '/': () => import('./views/Home.js'),
  '/forum': () => import('./views/Forum.js'),
  '/login': () => import('./views/Login.js')
};

const app = createApp({
  data() {
    return { currentView: null };
  },
  async mounted() {
    const path = window.location.pathname;
    const loadView = routes[path] || routes['/'];
    const viewModule = await loadView();
    this.currentView = viewModule.default({ supabase });
  },
  template: '<component :is="currentView" />'
});

app.mount('#app');
