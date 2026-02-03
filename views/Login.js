export default ({ supabase }) => ({
  data() {
    return {
      email: '',
      password: '',
      buildingRoom: '',
      isRegister: false,
      loading: false
    };
  },
  methods: {
    async handleSubmit() {
      if (!this.email || !this.password || !this.buildingRoom) {
        alert('请填写所有字段');
        return;
      }
      this.loading = true;

      try {
        if (this.isRegister) {
          const { error } = await supabase.auth.signUp({
            email: this.email,
            password: this.password,
            options: {
              data: { building_room: this.buildingRoom }
            }
          });
          if (error) throw error;
          alert('注册成功！请查收邮箱验证链接（可能在垃圾箱）');
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: this.email,
            password: this.password
          });
          if (error) throw error;
          // 登录成功后跳转
          window.location.href = '/forum';
        }
      } catch (error) {
        console.error(error);
        alert('操作失败：' + (error.message || '未知错误'));
      }
      this.loading = false;
    }
  },
  template: `
    <div class="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold text-center mb-6">{{ isRegister ? '會員註冊' : '用户登录' }}</h2>
      
      <div class="space-y-4">
        <input 
          v-model="email" 
          type="email" 
          placeholder="邮箱（用于登录）" 
          class="w-full p-3 border rounded"
        >
        <input 
          v-model="password" 
          type="password" 
          placeholder="密码（至少6位）" 
          class="w-full p-3 border rounded"
        >
        <input 
          v-model="buildingRoom" 
          placeholder="楼栋+房号（例：3栋1202）" 
          class="w-full p-3 border rounded"
        >
        
        <button 
          @click="handleSubmit" 
          :disabled="loading"
          class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded font-medium disabled:opacity-50"
        >
          {{ loading ? '处理中...' : (isRegister ? '注册账号' : '立即登录') }}
        </button>
      </div>

      <p class="text-center mt-4">
        <button 
          @click="isRegister = !isRegister" 
          class="text-blue-500 hover:underline"
        >
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </button>
      </p>

      <p class="text-xs text-gray-500 mt-6 text-center">
        📌 请如实填写房号，筹备组将人工核对身份。
      </p>
    </div>
  `
});
