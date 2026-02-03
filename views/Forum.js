export default ({ supabase }) => ({
  data() {
    return {
      user: null,
      posts: [],
      newPost: { title: '', content: '', imageFile: null },
      loading: false,
      submitting: false
    };
  },
  async mounted() {
    // 检查登录状态
    const { data: { session } } = await supabase.auth.getSession();
    this.user = session?.user;

    if (this.user) {
      await this.loadPosts();
    } else {
      // 未登录跳转到登录页
      window.location.href = '/login';
    }
  },
  methods: {
    async loadPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('加载帖子失败:', error);
        alert('加载失败，请刷新重试');
      } else {
        this.posts = data || [];
      }
    },
    handleImageChange(e) {
      this.newPost.imageFile = e.target.files[0];
    },
    async submitPost() {
      if (!this.newPost.title.trim() || !this.newPost.content.trim()) {
        alert('标题和内容不能为空');
        return;
      }
      this.submitting = true;

      let imageUrl = null;
      if (this.newPost.imageFile) {
        const fileName = `post_${Date.now()}_${this.newPost.imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, this.newPost.imageFile);
        if (uploadError) {
          alert('图片上传失败，请重试');
          this.submitting = false;
          return;
        }
        imageUrl = fileName;
      }

      const { error: insertError } = await supabase.from('posts').insert({
        user_id: this.user.id,
        title: this.newPost.title,
        content: this.newPost.content,
        image_url: imageUrl,
        building_room: this.user.user_metadata?.building_room || '未填写'
      });

      if (insertError) {
        alert('发布失败：' + insertError.message);
      } else {
        this.newPost = { title: '', content: '', imageFile: null };
        document.querySelector('input[type="file"]').value = '';
        await this.loadPosts(); // 刷新列表
      }
      this.submitting = false;
    }
  },
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">💬 业主论坛</h1>
        <button @click="window.location.href='/login'" class="text-red-500">退出登录</button>
      </div>

      <!-- 发帖区 -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <input 
          v-model="newPost.title" 
          placeholder="标题（必填）" 
          class="w-full p-2 border rounded mb-3"
        >
        <textarea 
          v-model="newPost.content" 
          placeholder="说说你的想法...（必填）" 
          rows="4" 
          class="w-full p-2 border rounded mb-3"
        ></textarea>
        <input 
          type="file" 
          @change="handleImageChange" 
          accept="image/*" 
          class="mb-3"
        >
        <button 
          @click="submitPost" 
          :disabled="submitting"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {{ submitting ? '发布中...' : '发布帖子' }}
        </button>
      </div>

      <!-- 帖子列表 -->
      <div v-if="posts.length === 0" class="text-center py-10 text-gray-500">
        暂无帖子，快来发布第一条吧！
      </div>
      
      <div v-for="post in posts" :key="post.id" class="bg-white p-4 rounded-lg shadow mb-4">
        <div class="text-sm text-gray-500 mb-1">
          {{ post.building_room }} · {{ new Date(post.created_at).toLocaleString('zh-CN') }}
        </div>
        <h3 class="font-bold text-lg">{{ post.title }}</h3>
        <p class="mt-2 whitespace-pre-wrap">{{ post.content }}</p>
        <img 
          v-if="post.image_url" 
          :src="'https://febjruodvvasfxnxnzbf.supabase.co/storage/v1/object/public/post-images/' + post.image_url" 
          class="mt-2 max-w-full rounded max-h-60 object-contain"
        >
      </div>
    </div>
  `
});
