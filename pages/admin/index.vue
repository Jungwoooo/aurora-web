<script setup lang="ts">
// 💡 이 마법의 한 줄이 "이 방은 까만색 관리자 지붕(admin.vue)을 씌워줘!" 라고 명령합니다!
definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 mt-4 border border-gray-200">
    <h2 class="text-xl font-extrabold text-gray-800 mb-2">원장님, 환영합니다! 🎉</h2>
    <p class="text-gray-500 text-sm mb-6">오늘의 학원 현황을 한눈에 확인하세요.</p>
    
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-purple-50 p-4 rounded-xl text-center border border-purple-100">
        <div class="text-xs font-bold text-purple-600 mb-1">오늘 예약</div>
        <div class="text-2xl font-extrabold text-gray-900">12명</div>
      </div>
      <div class="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
        <div class="text-xs font-bold text-blue-600 mb-1">신규 가입</div>
        <div class="text-2xl font-extrabold text-gray-900">3명</div>
      </div>
    </div>
  </div>
</template>