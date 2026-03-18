<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/member' // 창고 가져오기

const router = useRouter()
const memberStore = useMemberStore()
const toastStore = useToastStore()

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
    toastStore.show(`${result.name}님 환영합니다!`)

    // 3. ⭐️ 하이라이트: 권한(Role)에 따른 자동문 이동!
    if (result.role === 'admin') {
      router.push('/admin') // 원장님은 까만 지붕 관리자실로 모십니다!
    } else {
      router.push('/') // 수강생은 하얀 지붕 메인 홀로 보냅니다!
    }

  } catch (error: any) {
    // 비밀번호 틀리거나 없는 이메일일 때
    toastStore.show('앗! 이메일이나 비밀번호를 다시 확인해 주세요.')
  }
}




// 🚨 아까 메모장에 복사해둔 원장님의 REST API 키를 여기에 쏙! 넣어주세요!
const KAKAO_REST_API_KEY = '5a730b1cdcf4bf10888cee090b81f9af' 

// 카카오 버튼을 눌렀을 때 실행되는 함수!
const loginWithKakao = () => {
  const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`
  // 카카오 로그인 전용 창으로 슝~ 날려보냅니다.
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`
  window.location.href = kakaoAuthUrl 
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

    <div class="mt-8 mb-6 relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-3 bg-white text-gray-400 font-bold">또는</span>
        </div>
      </div>

      <button 
        @click="loginWithKakao" 
        type="button" 
        class="w-full flex justify-center items-center py-3.5 border border-transparent rounded-xl shadow-sm text-base font-extrabold text-black bg-[#FEE500] hover:bg-[#FDD800] active:scale-[0.98] transition"
      >
        <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.477 3 2 6.358 2 10.5c0 2.656 1.764 4.985 4.417 6.136-.217.784-1.396 4.966-1.428 5.127-.043.218.156.241.284.156.101-.067 4.922-3.328 6.852-4.634.288.026.582.04.875.04 5.523 0 10-3.358 10-7.5S17.523 3 12 3z"/>
        </svg>
        카카오로 1초 만에 시작하기
      </button>

    <div class="mt-8 text-center text-sm text-gray-500">
      아직 오로라 회원이 아니신가요? 
      <NuxtLink to="/signup" class="text-purple-600 font-bold hover:underline ml-1">회원가입</NuxtLink>
    </div>
  </div>
</template>