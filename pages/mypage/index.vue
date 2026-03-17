<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '@/stores/member'

definePageMeta({ layout: 'default' })

const router = useRouter()
const memberStore = useMemberStore()
const { userInfo } = storeToRefs(memberStore)
const toastStore = useToastStore()

const myVoucher = ref<any>({
  remainingCount: 0,
  expiredAt: null
})

// 💡 원장님의 날카로운 기획 반영! (사용 가능 조건: 횟수 남음 && 기한 안 지남)
const isVoucherValid = computed(() => {
  // 1. 횟수가 0이하면 무조건 아웃!
  if (myVoucher.value.remainingCount <= 0) return false
  // 2. 만료일 자체가 없어도 아웃!
  if (!myVoucher.value.expiredAt) return false
  
  // 3. 오늘 날짜 구하기 (시간은 빼고 날짜끼리만 딱 비교하기 위해 00:00:00 세팅)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 4. 내 수강권 만료일 구하기
  const expireDate = new Date(myVoucher.value.expiredAt)
  expireDate.setHours(0, 0, 0, 0)

  // 🚀 만료일이 오늘(today)이거나 오늘보다 미래(크면) true! 아니면 false!
  return expireDate >= today
})

onMounted(async () => {
  if (!userInfo.value) {
    toastStore.show('로그인이 필요한 서비스입니다.')
    router.push('/login')
    return
  }

  try {
    const res = await memberStore.fetchMyVoucher(userInfo.value.id)
    myVoucher.value = res // DTO에서 바로 꺼내 쓰기
  } catch (error) {
    console.error('수강권 정보를 불러오지 못했습니다.', error)
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 md:p-6 mt-8">
    
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">
          안녕하세요, <span class="text-purple-600">{{ userInfo?.name || userInfo?.email?.split('@')[0] }}</span> 님!
        </h1>
        <p class="text-gray-500 font-medium mt-1">오늘도 오로라와 함께 활기찬 하루 보내세요!</p>
      </div>
      <!-- <div class="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center border-2 border-purple-200 shadow-sm">
        <span class="text-purple-600 font-extrabold text-xl">
          {{ userInfo?.name ? userInfo.name.substring(0, 1) : 'A' }}
        </span>
      </div> -->
    </div>

    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-lg p-8 mb-8 relative overflow-hidden text-white">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 opacity-20 blur-3xl rounded-full"></div>
      <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500 opacity-20 blur-3xl rounded-full"></div>

      <div class="relative z-10">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-lg font-bold text-gray-300 tracking-wider">🎟️ 나의 수강권</h2>
          
          <span 
            class="px-3 py-1 text-xs font-bold rounded-full"
            :class="isVoucherValid ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'"
          >
            {{ isVoucherValid ? '사용 가능' : '수강권 만료' }}
          </span>
        </div>

        <div class="flex items-end justify-between">
          <div>
            <p class="text-sm font-medium text-gray-400 mb-1">남은 수강 횟수</p>
            <p class="text-2xl font-black" :class="!isVoucherValid ? 'text-gray-500' : ''">
              {{ myVoucher.remainingCount }}<span class="text-2xl font-bold ml-1" :class="!isVoucherValid ? 'text-gray-500' : 'text-gray-400'">회</span>
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-gray-400 mb-1">유효 기간</p>
            <p class="text-sm font-bold text-gray-200" :class="!isVoucherValid ? 'text-gray-400' : ''">
              {{ myVoucher.expiredAt ? `${myVoucher.expiredAt} 까지` : '수강권 없음' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <button 
        @click="router.push('/reservation')"
        class="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition group"
      >
        <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition">
          📅
        </div>
        <span class="text-sm font-bold text-gray-800">수업 예약하기</span>
      </button>

      <button 
        @click="router.push('/mypage/reservation')"
        class="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition group"
      >
        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
          📋
        </div>
        <span class="text-sm font-bold text-gray-800">내 예약 내역</span>
      </button>
    </div>

  </div>
</template>