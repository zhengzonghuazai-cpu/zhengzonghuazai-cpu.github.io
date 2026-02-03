// ====== 配置区（已填入你的 Supabase）======
const SUPABASE_URL = 'https://febjruodvvasfxnxnzbf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DlKosig1z4gokZsV_CRtbw_wrBjChzE';
// =========================================

import { createApp, ref, onMounted } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====== 视图组件定义（内联，无 import）======
const HomeView = {
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <header class="text-center mb-10">
        <h1 class="text-3xl font-bold text-gray-800">🏡 映园春晓小区业主议事厅</h1>
        <p class="mt-2 text-gray-600">共建透明、和谐的家园</p>
      </header>

      <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8 rounded">
        <p><strong>📌 温馨提示：</strong></p>
        <ul class="list-disc pl-5 mt-1 text-sm space-y-1">
          <li>请如实填写房号（如：3栋1202），仅认证业主的意见将纳入统计</li>
          <li>本平台为业主自发公益项目，结果仅供参考</li>
          <li>请文明发言，共建和谐社区</li>
        </ul>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="#/forum" class="block bg-white p-6 rounded-lg shadow hover:shadow-md transition transform hover:-translate-y-1">
          <h2 class="text-xl font-semibold mb-2 flex items-center">
            <span>💬</span> 业主论坛
          </h2>
          <p class="text-gray-600">发布建议、反映问题、交流经验</p>
        </a>
        <a href="#/login" class="block bg-white p-6 rounded-lg shadow hover:shadow-md transition transform hover:-translate-y-1">
          <h2 class="text-xl font-semibold mb-2 flex items-center">
            <span>🔑</span> 登录/注册
          </h2>
          <p class="text-gray-600">填写房号后即可参与讨论</p>
        </a>
      </div>

      <div class="mt-12 text-center text-gray-500 text-sm">
        <p>© 2026 映园春晓小区业主议事厅 · 非商业用途</p>
      </div>
    </div>
  `
};

const LoginView = {
  setup() {
    const email = ref('');
    const password = ref('');
    const buildingRoom = ref('');
    const isRegister = ref(false);
    const loading = ref(false);

    const handleSubmit = async () => {
      if (!email.value || !password.value || !buildingRoom.value) {
        alert('请填写所有字段');
        return;
      }
      loading.value = true;

      try {
        if (isRegister.value) {
          const { error } = await supabase.auth.signUp({
            email: email.value,
            password: password.value,
            options: { data: { building_room: buildingRoom.value } }
          });
          if (error) throw error;
          alert('注册成功！请查收邮箱验证链接（检查垃圾箱）');
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email: email.value,
            password: password.value
          });
          if (error) throw error;
          window.location.hash = '#/forum';
        }
      } catch (error) {
        alert('操作失败：' + (error.message || '未知错误'));
      }
      loading.value = false;
    };

    return {
      email,
      password,
      buildingRoom,
      isRegister,
      loading,
      handleSubmit
    };
  },
  template: `
    <div class="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold text-center mb-6">{{ isRegister ? '會員註冊' : '用户登录' }}</h2>
      
      <div class="space-y-4">
        <input v-model="email" type="email" placeholder="邮箱（用于登录）" class="w-full p-3 border rounded">
        <input v-model="password" type="password" placeholder="密码（至少6位）" class="w-full p-3 border rounded">
        <input v-model="buildingRoom" placeholder="楼栋+房号（例：3栋1202）" class="w-full p-3 border rounded">
        
        <button @click="handleSubmit" :disabled="loading"
          class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded font-medium disabled:opacity-50">
          {{ loading ? '处理中...' : (isRegister ? '注册账号' : '立即登录') }}
        </button>
      </div>

      <p class="text-center mt-4">
        <button @click="isRegister = !isRegister" class="text-blue-500 hover:underline">
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </button>
      </p>

      <p class="text-xs text-gray-500 mt-6 text-center">
        📌 请如实填写房号，筹备组将人工核对身份。
      </p>
    </div>
  `
};

const ForumView = {
  setup() {
    const user = ref(null);
    const posts = ref([]);
    const newPost = ref({ title: '', content: '', imageFile: null });
    const submitting = ref(false);

    const loadPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) posts.value = data || [];
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      user.value = session?.user;
      if (!user.value) {
        window.location.hash = '#/login';
        return;
      }
      await loadPosts();
    };

    onMounted(checkAuth);

    const handleImageChange = (e) => {
      newPost.value.imageFile = e.target.files[0];
    };

    const submitPost = async () => {
      if (!newPost.value.title.trim() || !newPost.value.content.trim()) {
        alert('标题和内容不能为空');
        return;
      }
      submitting.value = true;

      let imageUrl = null;
      if (newPost.value.imageFile) {
        const fileName = `post_${Date.now()}_${newPost.value.imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, newPost.value.imageFile);
        if (uploadError) {
          alert('图片上传失败');
          submitting.value = false;
          return;
        }
        imageUrl = fileName;
      }

      const { error: insertError } = await supabase.from('posts').insert({
        user_id: user.value.id,
        title: newPost.value.title,
        content: newPost.value.content,
        image_url: imageUrl,
        building_room: user.value.user_metadata?.building_room || '未填写'
      });

      if (insertError) {
        alert('发布失败：' + insertError.message);
      } else {
        newPost.value = { title: '', content: '', imageFile: null };
        document.querySelector('input[type="file"]').value = '';
        await loadPosts();
      }
      submitting.value = false;
    };

    return {
      user,
      posts,
      newPost,
      submitting,
      handleImageChange,
      submitPost
    };
  },
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">💬 业主论坛</h1>
        <button @click="window.location.hash='#/login'" class="text-red-500 text-sm">退出</button>
      </div>

      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <input v-model="newPost.title" placeholder="标题（必填）" class="w-full p-2 border rounded mb-3">
        <textarea v-model="newPost.content" placeholder="说说你的想法...（必填）" rows="4" class="w-full p-2 border rounded mb-3"></textarea>
        <input type="file" @change="handleImageChange" accept="image/*" class="mb-3">
        <button @click="submitPost" :disabled="submitting"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {{ submitting ? '发布中...' : '发布帖子' }}
        </button>
      </div>

      <div v-if="posts.length === 0" class="text-center py-10 text-gray-500">
        暂无帖子，快来发布第一条吧！
      </div>
      
      <div v-for="post in posts" :key="post.id" class="bg-white p-4 rounded-lg shadow mb-4">
        <div class="text-sm text-gray-500 mb-1">
          {{ post.building_room }} · {{ new Date(post.created_at).toLocaleString('zh-CN') }}
        </div>
        <h3 class="font-bold text-lg">{{ post.title }}</h3>
        <p class="mt-2 whitespace-pre-wrap">{{ post.content }}</p>
        <img v-if="post.image_url" 
          :src="'https://febjruodvvasfxnxnzbf.supabase.co/storage/v1/object/public/post-images/' + post.image_url" 
          class="mt-2 max-w-full rounded max-h-60 object-contain">
      </div>
    </div>
  `
};

// ====== Hash 路由核心 ======
const routes = {
  '/': HomeView,
  '/forum': ForumView,
  '/login': LoginView
};

const app = createApp({
  setup() {
    const currentView = ref(HomeView);

    const render = () => {
      const hash = window.location.hash.slice(2) || '/';
      currentView.value = routes[hash] || HomeView;
    };

    onMounted(() => {
      render();
      window.addEventListener('hashchange', render);
    });

    return { currentView };
  },
  template: '<component :is="currentView" />'
});

app.mount('#app');
