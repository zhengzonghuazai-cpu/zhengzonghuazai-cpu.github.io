// ✅ 已自动填入你的 Supabase 配置
const SUPABASE_URL = 'https://febjruodvvasfxnxnzbf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DlKosig1z4gokZsV_CRtbw_wrBjChzE';

import { createApp } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====== Hash 路由核心逻辑 ======
const routes = {
  '/': () => import('./views/Home.js'),
  '/forum': () => import('./views/Forum.js'),
  '/login': () => import('./views/Login.js')
};

// 监听 hash 变化
const renderView = async () => {
  const hash = window.location.hash.slice(2) || '/'; // #/xxx → /xxx
  const loadView = routes[hash] || routes['/'];
  const viewModule = await loadView();
  app.currentView = viewModule.default({ supabase });
};

// 创建 Vue 应用
const app = createApp({
  data() {
    return { currentView: null };
  },
  mounted() {
    renderView();
    window.addEventListener('hashchange', renderView);
  },
  beforeUnmount() {
    window.removeEventListener('hashchange', renderView);
  },
  template: '<component :is="currentView" />'
});

// 挂载
app.mount('#app');
