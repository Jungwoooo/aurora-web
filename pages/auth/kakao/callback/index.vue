<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/member'
import { useToastStore } from '@/stores/toast' // 🍞 예쁜 알림창 소환!

definePageMeta({ layout: 'empty' })

const route = useRoute()
const router = useRouter()
const memberStore = useMemberStore()
const toastStore = useToastStore()

onMounted(async () => {
  // 1. 주소창에서 카카오가 준 암호(code) 빼오기
  const code = route.query.code
  
  if (code) {
    try {
      // 2. 창고(Store)에 일 시키기: "백엔드 다녀와!"
      await memberStore.kakaoLogin(code as string)
      
      // 3. 무사히 다녀왔다면 환영 인사 띄우고 메인 화면으로 이동!
      toastStore.show('카카오로 1초 만에 로그인되었습니다! 🎉', 'success')
      router.push('/') // 🚀 (원장님이 원하시는 로그인 후 첫 화면으로 변경 가능)
      
    } catch (e: any) {
      console.error('카카오 로그인 에러:', e)
      toastStore.show('카카오 로그인에 실패했습니다.', 'error')
      router.push('/login') // 실패하면 다시 로그인 창으로 쫓아내기
    }
  } else {
    toastStore.show('비정상적인 접근입니다.', 'error')
    router.push('/login')
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FEE500] mb-6"></div>
    <h2 class="text-2xl font-extrabold text-gray-800">카카오 로그인 중입니다...</h2>
    <p class="text-gray-500 font-medium mt-2">잠시만 기다려주세요! 💛</p>
  </div>
</template>