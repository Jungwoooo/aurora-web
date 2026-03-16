<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/member' // 창고 가져오기

const router = useRouter()
const memberStore = useMemberStore()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    // 1. 창고 관리자에게 "이메일/비번 줄 테니까 로그인 좀 해와!" 시키기
    const result = await memberStore.login({
      email: email.value,
      password: password.value
    })

    // 2. 성공하면 환영 인사!
    alert(`${result.name}님 환영합니다!`)

    // 3. ⭐️ 하이라이트: 권한(Role)에 따른 자동문 이동!
    if (result.role === 'admin') {
      router.push('/admin') // 원장님은 까만 지붕 관리자실로 모십니다!
    } else {
      router.push('/') // 수강생은 하얀 지붕 메인 홀로 보냅니다!
    }

  } catch (error: any) {
    // 비밀번호 틀리거나 없는 이메일일 때
    alert('앗! 이메일이나 비밀번호를 다시 확인해 주세요.')
  }
}
</script>

<template>
  <div class="flex flex-col justify-center min-h-[70vh] px-4">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-extrabold text-purple-600 mb-2">오로라 폴댄스</h1>
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