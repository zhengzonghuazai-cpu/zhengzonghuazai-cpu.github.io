// ========== 配置区域（请替换为你的 Supabase 信息）==========
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'; // ← 替换
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // ← 替换
// ========================================================

import { createApp, ref, onMounted, computed } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== 组件定义 ====================
const HomeView = {
  props: ['user'],
  setup(props) {
    const featuredPosts = ref([]);

    const loadFeaturedPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .limit(6)
        .order('created_at', { ascending: false });
      if (!error) featuredPosts.value = data || [];
    };

    onMounted(loadFeaturedPosts);

    return { featuredPosts };
  },
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- 英雄区域 -->
      <section class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white mb-8">
        <h2 class="text-3xl font-bold mb-4">欢迎来到邻里社区</h2>
        <p class="text-lg mb-6">分享生活点滴，参与社区决策，共建美好家园</p>
        <div class="flex space-x-4">
          <a href="#/forum" class="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100">开始发帖</a>
          <a href="#/polls" class="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600">参与投票</a>
        </div>
      </section>

      <!-- 热门帖子 -->
      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-6 text-gray-800">🔥 热门帖子</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="post in featuredPosts" :key="post.id" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h4 class="font-semibold text-lg mb-2">{{ post.title }}</h4>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ post.content.substring(0, 100) }}...</p>
            <div class="flex justify-between items-center text-xs text-gray-500">
              <span>{{ post.author_name || '匿名用户' }}</span>
              <span>{{ new Date(post.created_at).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 功能介绍 -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white p-6 rounded-lg shadow text-center">
          <div class="text-4xl mb-4">💬</div>
          <h3 class="text-xl font-semibold mb-2">社区论坛</h3>
          <p class="text-gray-600">分享话题，交流观点，结识邻居</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow text-center">
          <div class="text-4xl mb-4">📊</div>
          <h3 class="text-xl font-semibold mb-2">在线投票</h3>
          <p class="text-gray-600">参与社区决策，表达你的意见</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow text-center">
          <div class="text-4xl mb-4">🔒</div>
          <h3 class="text-xl font-semibold mb-2">身份核实</h3>
          <p class="text-gray-600">真实业主认证，营造可信环境</p>
        </div>
      </section>
    </div>
  `
};

const ForumView = {
  props: ['user', 'supabase'],
  setup(props) {
    const posts = ref([]);
    const newPost = ref({ title: '', content: '', category: 'general' });
    const categories = [
      { value: 'general', label: '综合讨论' },
      { value: 'news', label: '社区新闻' },
      { value: 'help', label: '求助建议' },
      { value: 'events', label: '活动组织' }
    ];

    const loadPosts = async () => {
      const { data, error } = await props.supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) posts.value = data || [];
    };

    const submitPost = async () => {
      if (!props.user) {
        alert('请先登录');
        window.location.hash = '#/login';
        return;
      }
      if (!newPost.value.title.trim() || !newPost.value.content.trim()) {
        alert('请输入标题和内容');
        return;
      }

      const { error } = await props.supabase.from('posts').insert({
        title: newPost.value.title,
        content: newPost.value.content,
        category: newPost.value.category,
        author_id: props.user.id,
        author_name: props.user.user_metadata?.name || '匿名用户',
        building_room: props.user.user_metadata?.building_room || '未填写'
      });

      if (!error) {
        newPost.value = { title: '', content: '', category: 'general' };
        await loadPosts();
      } else {
        alert('发布失败：' + error.message);
      }
    };

    onMounted(loadPosts);

    return {
      posts,
      newPost,
      categories,
      submitPost
    };
  },
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-6">💬 社区论坛</h2>
        
        <!-- 发帖表单 -->
        <div v-if="user" class="bg-white p-6 rounded-lg shadow mb-6">
          <h3 class="font-semibold mb-4">发布新帖子</h3>
          <input v-model="newPost.title" placeholder="帖子标题" class="w-full p-3 border rounded mb-3">
          <select v-model="newPost.category" class="w-full p-3 border rounded mb-3">
            <option v-for="cat in categories" :value="cat.value">{{ cat.label }}</option>
          </select>
          <textarea v-model="newPost.content" placeholder="分享你的想法..." rows="4" class="w-full p-3 border rounded mb-3"></textarea>
          <button @click="submitPost" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">发布帖子</button>
        </div>

        <div v-else class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p>请 <a href="#/login" class="text-blue-500 hover:underline">登录</a> 后参与讨论</p>
        </div>
      </div>

      <!-- 帖子列表 -->
      <div class="space-y-6">
        <div v-for="post in posts" :key="post.id" class="bg-white p-6 rounded-lg shadow">
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-semibold">{{ post.title }}</h3>
            <span class="text-xs bg-gray-100 px-2 py-1 rounded">{{ post.category_label || '综合讨论' }}</span>
          </div>
          <p class="text-gray-700 mb-4 whitespace-pre-wrap">{{ post.content }}</p>
          <div class="flex justify-between items-center text-sm text-gray-500">
            <span>{{ post.author_name }} • {{ post.building_room }}</span>
            <span>{{ new Date(post.created_at).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  `
};

const PollsView = {
  props: ['user', 'supabase'],
  setup(props) {
    const polls = ref([]);
    const newPoll = ref({ question: '', options: ['', ''], type: 'single' });

    const loadPolls = async () => {
      const { data, error } = await props.supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) polls.value = data || [];
    };

    const submitPoll = async () => {
      if (!props.user) {
        alert('请先登录');
        window.location.hash = '#/login';
        return;
      }
      if (!newPoll.value.question.trim() || newPoll.value.options.some(opt => !opt.trim())) {
        alert('请填写完整投票信息');
        return;
      }

      const { error } = await props.supabase.from('polls').insert({
        question: newPoll.value.question,
        options: newPoll.value.options.filter(opt => opt.trim()),
        type: newPoll.value.type,
        created_by: props.user.id
      });

      if (!error) {
        newPoll.value = { question: '', options: ['', ''], type: 'single' };
        await loadPolls();
      } else {
        alert('创建失败：' + error.message);
      }
    };

    const vote = async (pollId, optionIndex) => {
      if (!props.user) {
        alert('请先登录');
        window.location.hash = '#/login';
        return;
      }

      const { error } = await props.supabase.from('poll_votes').insert({
        poll_id: pollId,
        option_index: optionIndex,
        user_id: props.user.id
      });

      if (!error) {
        await loadPolls();
      } else {
        alert('投票失败：' + error.message);
      }
    };

    onMounted(loadPolls);

    return {
      polls,
      newPoll,
      submitPoll,
      vote
    };
  },
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h2 class="text-2xl font-bold mb-6">📊 社区投票</h2>
      
      <div v-if="user" class="bg-white p-6 rounded-lg shadow mb-8">
        <h3 class="font-semibold mb-4">创建新投票</h3>
        <input v-model="newPoll.question" placeholder="投票问题" class="w-full p-3 border rounded mb-3">
        <select v-model="newPoll.type" class="w-full p-3 border rounded mb-3">
          <option value="single">单选</option>
          <option value="multiple">多选</option>
        </select>
        <div class="space-y-2 mb-3">
          <input v-for="(opt, i) in newPoll.options" 
                 v-model="newPoll.options[i]" 
                 :placeholder="'选项 ' + (i + 1)" 
                 class="w-full p-2 border rounded">
          <button @click="newPoll.options.push('')" class="text-blue-500 text-sm">+ 添加选项</button>
        </div>
        <button @click="submitPoll" class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">创建投票</button>
      </div>

      <div v-for="poll in polls" :key="poll.id" class="bg-white p-6 rounded-lg shadow mb-6">
        <h3 class="font-semibold text-lg mb-4">{{ poll.question }}</h3>
        <div class="space-y-2">
          <div v-for="(option, idx) in poll.options" :key="idx" class="flex items-center">
            <input type="radio" 
                   :name="'poll_' + poll.id" 
                   :value="idx" 
                   @change="vote(poll.id, idx)"
                   class="mr-2">
            <span class="flex-1">{{ option }}</span>
            <span class="text-sm text-gray-500">{{ poll.vote_counts?.[idx] || 0 }} 票</span>
          </div>
        </div>
        <div class="mt-4 text-sm text-gray-500">
          创建者：{{ poll.created_by_name || '匿名' }} • {{ new Date(poll.created_at).toLocaleDateString() }}
        </div>
      </div>
    </div>
  `
};

const LoginView = {
  props: ['supabase'],
  setup(props) {
    const email = ref('');
    const password = ref('');
    const name = ref('');
    const buildingRoom = ref('');
    const isRegister = ref(false);
    const loading = ref(false);

    const handleSubmit = async () => {
      if (!email.value || !password.value) {
        alert('请填写邮箱和密码');
        return;
      }
      loading.value = true;

      try {
        if (isRegister.value) {
          // 注册
          const { error } = await props.supabase.auth.signUp({
            email: email.value,
            password: password.value,
            options: {
              data: { 
                name: name.value,
                building_room: buildingRoom.value 
              }
            }
          });
          if (error) throw error;
          alert('注册成功！请查收邮箱验证链接');
        } else {
          // 登录
          const { error } = await props.supabase.auth.signInWithPassword({
            email: email.value,
            password: password.value
          });
          if (error) throw error;
          window.location.hash = '#/';
        }
      } catch (error) {
        alert('操作失败：' + error.message);
      }
      loading.value = false;
    };

    return {
      email,
      password,
      name,
      buildingRoom,
      isRegister,
      loading,
      handleSubmit
    };
  },
  template: `
    <div class="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold text-center mb-6">{{ isRegister ? '用户注册' : '用户登录' }}</h2>
      
      <div class="space-y-4">
        <input v-model="email" type="email" placeholder="邮箱地址" class="w-full p-3 border rounded">
        <input v-model="password" type="password" placeholder="密码" class="w-full p-3 border rounded">
        
        <div v-if="isRegister">
          <input v-model="name" placeholder="真实姓名（选填）" class="w-full p-3 border rounded mb-2">
          <input v-model="buildingRoom" placeholder="楼栋房号（如：3栋1202）" class="w-full p-3 border rounded">
        </div>
        
        <button @click="handleSubmit" :disabled="loading" 
                class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-medium disabled:opacity-50">
          {{ loading ? '处理中...' : (isRegister ? '注册账号' : '登录') }}
        </button>
      </div>

      <p class="text-center mt-4">
        <button @click="isRegister = !isRegister" class="text-blue-500 hover:underline">
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </button>
      </p>
    </div>
  `
};

// ==================== 路由系统 ====================
const routes = {
  '/': HomeView,
  '/forum': ForumView,
  '/polls': PollsView,
  '/login': LoginView
};

const app = createApp({
  setup() {
    const currentView = ref(routes['/']);
    const user = ref(null);

    const render = async () => {
      const hash = window.location.hash.slice(2) || '/';
      const routeComponent = routes[hash] || routes['/'];
      currentView.value = routeComponent;
    };

    const logout = async () => {
      await supabase.auth.signOut();
      user.value = null;
      window.location.hash = '#/';
    };

    onMounted(async () => {
      // 检查登录状态
      const { data: { session } } = await supabase.auth.getSession();
      user.value = session?.user;

      render();
      window.addEventListener('hashchange', render);
    });

    return {
      currentView,
      user,
      supabase,
      logout
    };
  }
});

app.mount('#app');
