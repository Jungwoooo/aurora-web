<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')

// 임시 로그인 버튼 동작
const handleLogin = () => {
  alert(`입력한 이메일: ${email.value}\n나중에 백엔드랑 연결할게요!`)
}
</script>

<template>
  <div class="flex flex-col justify-center min-h-[70vh] px-4">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-extrabold text-purple-600 mb-2">✨ 오로라 폴댄스</h1>
      <p class="text-gray-500 font-medium">아름다운 비행을 시작해 볼까요?</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-5">
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">이메일</label>
        <input 
          v-model="email" 
          type="email" 
          placeholder="aurora@poledance.com"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">비밀번호</label>
        <input 
          v-model="password" 
          type="password" 
          placeholder="••••••••"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
        />
      </div>

      <button 
        type="submit" 
        class="w-full bg-purple-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-md hover:bg-purple-700 active:scale-[0.98] transition-transform mt-4"
      >
        로그인
      </button>
    </form>

    <div class="mt-8 text-center text-sm text-gray-500">
      아직 오로라 회원이 아니신가요? 
      <NuxtLink to="/signup" class="text-purple-600 font-bold hover:underline ml-1">회원가입</NuxtLink>
    </div>
  </div>
</template>