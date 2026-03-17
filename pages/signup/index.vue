<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/member' // 💡 창고 관리자 호출!

const router = useRouter()
const memberStore = useMemberStore() // 창고 쓰겠다고 선언
const toastStore = useToastStore()

const email = ref('')
const password = ref('')
const name = ref('')
const phone = ref('')

const handleSignup = async () => {
  try {
    // 💡 더럽고 길었던 $fetch 코드가 이렇게 우아해집니다!
    await memberStore.signup({
      email: email.value,
      password: password.value,
      name: name.value,
      phone: phone.value
    })

    toastStore.show('회원가입 성공! 로그인해주세요.')
    router.push('/login')

  } catch (error: any) {
    toastStore.show('앗! 이미 가입된 이메일이거나 오류가 발생했습니다.')
  }
}
</script>

<template>
  <div class="flex flex-col justify-center min-h-[80vh] px-4">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-extrabold text-gray-900 mb-2">회원가입</h2>
      <p class="text-sm text-gray-500">오로라의 가족이 되어주세요!</p>
    </div>

    <form @submit.prevent="handleSignup" class="space-y-4">
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">이메일 (아이디)</label>
        <input v-model="email" type="email" required placeholder="aurora@pole.com" class="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" />
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">비밀번호</label>
        <input v-model="password" type="password" required placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" />
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">이름</label>
        <input v-model="name" type="text" required placeholder="오로라" class="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" />
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">연락처</label>
        <input v-model="phone" type="tel" required placeholder="010-1234-5678" class="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" />
      </div>

      <button type="submit" class="w-full bg-gray-900 text-white font-bold text-lg py-3.5 rounded-xl shadow-md hover:bg-black active:scale-[0.98] transition-transform mt-6">
        가입하기
      </button>
    </form>
  </div>
</template>