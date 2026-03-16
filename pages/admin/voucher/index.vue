<script setup lang="ts">
import { ref } from 'vue'
// 💡 아까 만들어둔 공통 API 무전기 소환! (자동 import 안 되면 직접 import 해주세요)
// import { useCallApi } from '@/composables/useCallApi'

// 👑 이 페이지는 무조건 까만 지붕(관리자 레이아웃)을 덮어씁니다!
definePageMeta({
  layout: 'admin'
})

const memberId = ref('') // 수강생 DB 번호 (예: 1, 2, 3...)
const count = ref(10) // 지급할 횟수 (기본 10회 세팅)

const adminStore = useAdminStore()

const handleGrant = async () => {
  if (!memberId.value || !count.value) {
    return alert('회원 번호와 횟수를 모두 입력해주세요!')
  }

  try {
    // 🚀 백엔드로 횟수 쏴주기!
    const response = await useCallApi('/api/voucher/grant', {
      method: 'POST',
      body: {
        memberId: Number(memberId.value),
        count: Number(count.value)
      }
    })

    alert(`성공! ${memberId.value}번 회원님께 ${count.value}회 수강권이 지급되었습니다!`)
    memberId.value = '' // 입력창 초기화
    count.value = 10

  } catch (error: any) {
    alert('앗! 지급 실패 😭 (없는 회원 번호이거나 서버 에러입니다.)')
    console.error(error)
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 mt-4 border border-gray-200">
    <h2 class="text-xl font-extrabold text-gray-800 mb-2">수강권 지급 (임시)</h2>
    <p class="text-gray-500 text-sm mb-6">수강생의 고유 번호(ID)를 입력해 횟수를 부여하세요.</p>
    
    <form @submit.prevent="handleGrant" class="space-y-5">
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">수강생 고유 번호 (Member ID)</label>
        <input 
          v-model="memberId" 
          type="number" 
          placeholder="예: 1"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition"
        />
        <p class="text-xs text-red-400 mt-1">* DB(member 테이블)에 있는 실제 id 값을 넣어주세요.</p>
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">지급할 횟수</label>
        <div class="flex items-center space-x-2">
          <input 
            v-model="count" 
            type="number" 
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition"
          />
          <span class="font-bold text-gray-600">회</span>
        </div>
      </div>

      <button 
        type="submit" 
        class="w-full bg-blue-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-md hover:bg-blue-700 active:scale-[0.98] transition-transform mt-4"
      >
        수강권 횟수 쏘기!
      </button>
    </form>
  </div>
</template>