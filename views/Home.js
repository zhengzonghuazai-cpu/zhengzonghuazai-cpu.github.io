export default ({ supabase }) => ({
  template: `
  <div class="max-w-4xl mx-auto px-4 py-8">
    <header class="text-center mb-10">
      <h1 class="text-3xl font-bold text-gray-800">🏡 映园春晓小区业主议事厅</h1>
      <p class="mt-2 text-gray-600">共建透明、和谐的家园</p>
    </header>

    <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
      <p><strong>📌 温馨提示：</strong></p>
      <ul class="list-disc pl-5 mt-1 text-sm">
        <li>请如实填写房号（如：3栋1202），仅认证业主的意见将纳入统计</li>
        <li>本平台为业主自发公益项目，结果仅供参考</li>
        <li>请文明发言，共建和谐社区</li>
      </ul>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <a href="#/forum" class="block bg-white p-6 rounded-lg shadow hover:shadow-md transition">
        <h2 class="text-xl font-semibold mb-2">💬 业主论坛</h2>
        <p>发布建议、反映问题、交流经验</p>
      </a>
      <a href="#/login" class="block bg-white p-6 rounded-lg shadow hover:shadow-md transition">
        <h2 class="text-xl font-semibold mb-2">🔑 登录/注册</h2>
        <p>填写房号后即可参与讨论</p>
      </a>
    </div>

    <footer class="mt-16 text-center text-gray-500 text-sm">
      <p>© 2026 映园春晓小区业主议事厅 · 非商业用途</p>
    </footer>
  </div>
`
});
