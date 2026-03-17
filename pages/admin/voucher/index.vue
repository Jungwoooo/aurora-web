<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

const toastStore = useToastStore()

const memberId = ref('') 
const count = ref(10) 
const selectedPeriod = ref<number | 'custom'>(1)
const customDate = ref('')

const handleGrant = async () => {
  if (!memberId.value || !count.value) {
    return toastStore.show('회원 번호와 횟수를 모두 입력해주세요!')
  }
  if (selectedPeriod.value === 'custom' && !customDate.value) {
    return toastStore.show('직접 지정할 날짜를 선택해주세요!')
  }

  try {
    // 🚀 바뀐 DTO 모양에 맞춰서 쏴줍니다!
    const response = await useCallApi('/api/voucher/grant', {
      method: 'POST',
      body: {
        memberId: Number(memberId.value),
        count: Number(count.value),
        // 라디오 버튼이면 periodMonths에, 직접 지정이면 customExpiredAt에 쏙!
        periodMonths: selectedPeriod.value !== 'custom' ? Number(selectedPeriod.value) : null,
        customExpiredAt: selectedPeriod.value === 'custom' ? customDate.value : null
      }
    })

    toastStore.show(`성공! ${memberId.value}번 회원님께 ${count.value}회 수강권이 지급/연장되었습니다!`)
    
    memberId.value = ''
    count.value = 10
    selectedPeriod.value = 1
    customDate.value = ''

  } catch (error: any) {
    toastStore.show('앗! 지급 실패 (이유: ' + (error.response?._data || '서버 오류') + ')')
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 mt-4 border border-gray-200 max-w-2xl mx-auto">
    <h2 class="text-xl font-extrabold text-gray-800 mb-2">수강권 발급/연장</h2>
    <p class="text-gray-500 text-sm mb-6">회원에게 수강권을 지급하거나 기존 수강권의 횟수/기간을 연장합니다.</p>
    
    <form @submit.prevent="handleGrant" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">수강생 고유 번호 (ID)</label>
          <input v-model="memberId" type="number" placeholder="예: 1" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">지급할 횟수</label>
          <div class="flex items-center space-x-2">
            <input v-model="count" type="number" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition text-right font-bold" />
            <span class="font-bold text-gray-600">회</span>
          </div>
        </div>
      </div>

      <div class="p-4 bg-purple-50 rounded-xl border border-purple-100">
        <label class="block text-sm font-extrabold text-purple-900 mb-3">유효기간 설정</label>
        
        <div class="flex flex-wrap gap-3 mb-3">
          <label v-for="months in [1, 2, 3, 6]" :key="months" class="cursor-pointer">
            <input type="radio" v-model="selectedPeriod" :value="months" class="peer sr-only" />
            <div class="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all peer-checked:bg-purple-600 peer-checked:text-white peer-checked:border-purple-600 peer-hover:bg-purple-100 bg-white text-gray-600 border-gray-200">
              {{ months }}개월
            </div>
          </label>
          <label class="cursor-pointer">
            <input type="radio" v-model="selectedPeriod" value="custom" class="peer sr-only" />
            <div class="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all peer-checked:bg-purple-600 peer-checked:text-white peer-checked:border-purple-600 peer-hover:bg-purple-100 bg-white text-gray-600 border-gray-200">
              직접 지정
            </div>
          </label>
        </div>

        <div v-if="selectedPeriod === 'custom'" class="mt-2">
          <input v-model="customDate" type="date" class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none font-bold text-gray-700" />
        </div>

        <p class="text-xs font-medium text-purple-700 mt-3">
          <span v-if="selectedPeriod !== 'custom'">
            💡 신규 회원은 <b>오늘부터 {{ selectedPeriod }}개월</b>, 기존 회원은 <b>남은 만료일에서 {{ selectedPeriod }}개월</b>이 합산되어 연장됩니다.
          </span>
          <span v-else>
            💡 기존 만료일과 상관없이 <b>선택하신 날짜({{ customDate || '?' }})</b>로 만료일이 덮어씌워집니다.
          </span>
        </p>
      </div>

      <button type="submit" class="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-black active:scale-[0.98] transition-transform">
        수강권 발급/연장 확정하기
      </button>
    </form>
  </div>
</template>