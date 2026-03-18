<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '@/stores/member'
import { useAdminStore } from '@/stores/admin'
import { useLessonStore } from '@/stores/lesson'
import { useReservationStore } from '@/stores/reservation'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const memberId = Number(route.params.id)

// 창고(Stores) 소환
const adminStore = useAdminStore()
const lessonStore = useLessonStore()
const reservationStore = useReservationStore()
const toastStore = useToastStore()

const { memberList } = storeToRefs(adminStore)

const currentMember = computed(() => {
  return memberList.value.find((m: any) => m.memberId === memberId) || null
})

// ------------------------------------------------
// 🎟️ 1. 수강권 관리 (발급/연장) 상태
// ------------------------------------------------
const voucherCount = ref<number | ''>('') 
const selectedPeriod = ref<number | 'custom' | null>(null)
const customDate = ref('')

// 💡 버튼을 클릭했을 때 껐다 켰다 하는 마법의 함수!
const togglePeriod = (value: number | 'custom') => {
  if (selectedPeriod.value === value) {
    selectedPeriod.value = null // 이미 켜진 걸 누르면 끄기(null)
  } else {
    selectedPeriod.value = value // 다른 걸 누르면 그걸로 켜기
  }
}

const handleGrantVoucher = async () => {
  // 💡 핵심 로직: 원장님이 아무것도 안 적었으면(빈칸이면) 0으로 계산해줍니다!
  const finalCount = voucherCount.value === '' ? 0 : Number(voucherCount.value)

  if (finalCount < 0) return toastStore.show('횟수는 차감할 수 없습니다 (0 이상 입력).', 'error')
  
  // 💡 체크할 때도 finalCount 로 검사합니다!
  if (finalCount === 0 && selectedPeriod.value === null) return toastStore.show('추가할 횟수나 연장할 기간을 설정해주세요!', 'error')
  
  if (selectedPeriod.value === 'custom' && !customDate.value) return toastStore.show('만료일을 직접 지정해주세요!', 'error')
  
  try {
    await adminStore.grantVoucher({
      memberId,
      count: finalCount, // 🚀 백엔드로는 예쁘게 숫자(0 또는 입력값)로 발사!
      periodMonths: typeof selectedPeriod.value === 'number' ? selectedPeriod.value : null,
      customExpiredAt: selectedPeriod.value === 'custom' ? customDate.value : null
    })
    
    toastStore.show('수강권이 성공적으로 업데이트되었습니다!', 'success')
    
    // 폼 초기화도 다시 빈칸으로!
    voucherCount.value = '' 
    selectedPeriod.value = null
    customDate.value = ''
    
    await adminStore.fetchMemberList()
  } catch (e: any) {
    toastStore.show('수강권 업데이트 실패: ' + e.message, 'error')
  }
}

// ------------------------------------------------
// 📅 2. 대리 예약 (수업 조회 및 예약) 상태
// ------------------------------------------------
const targetDate = ref('') // 조회할 날짜
const availableLessons = ref<any>([])

const fetchLessonsByDate = async () => {
  if (!targetDate.value) return toastStore.show('날짜를 먼저 선택해주세요!')
  try {
    // 💡 원장님의 기존 SearchLessonReq 배열이 날아옵니다!
    availableLessons.value = await lessonStore.fetchLessons(targetDate.value)
  } catch (e) {
    toastStore.show('수업 목록을 불러오지 못했습니다.')
  }
}

const handleProxyReservation = async (lessonId: number, lessonTitle: string) => {
  if (!confirm(`'${lessonTitle}' 수업을 대리 예약하시겠습니까?`)) return
  try {
    await reservationStore.createReservation({ memberId, lessonId })
    toastStore.show('대리 예약 성공!')
    await fetchMemberReservations() // 예약 목록 갱신!
    if (targetDate.value) {
        await fetchLessonsByDate() // 예약 내역 조회!
    }
    await adminStore.fetchMemberList() // 수강권 횟수 깎인거 갱신!
  } catch (e: any) {
    toastStore.show('예약 실패: ' + (e.response?._data || '서버 오류'))
  }
}

// ------------------------------------------------
// 🚨 3. 예약 내역 조회 및 강제 취소 상태
// ------------------------------------------------
const memberReservations = ref<any>([])

const fetchMemberReservations = async () => {
  try {
    memberReservations.value = await adminStore.fetchMemberReservations(memberId)
  } catch (e) {
    console.error('예약 내역 조회 실패', e)
  }
}

const handleForceCancel = async (reservationId: number) => {
  if (!confirm('정말 이 예약을 강제로 취소하고 수강권 횟수를 1회 돌려주시겠습니까? (노쇼/예외 처리)')) return
  try {
    await adminStore.forceCancelReservation(reservationId)
    toastStore.show('강제 취소 및 횟수 복구 완료!')
    await fetchMemberReservations() // 예약 목록 갱신!
    if (targetDate.value) {
        await fetchLessonsByDate() // 예약 내역 조회!
    }
    await adminStore.fetchMemberList() // 수강권 횟수 늘어난거 갱신!
  } catch (e: any) {
    toastStore.show('취소 실패: ' + e.message)
  }
}

// ------------------------------------------------
// 🚀 화면 켜질 때 초기화
// ------------------------------------------------
onMounted(async () => {
  if (memberList.value.length === 0) await adminStore.fetchMemberList()
  await fetchMemberReservations() // 이 회원의 예약 내역 싹 긁어오기!
})

const goBack = () => router.push('/admin/member')
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 md:p-6">
    <div class="flex items-center mb-6 space-x-4">
      <button @click="goBack" class="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
        <span class="text-xl font-bold text-gray-600">←</span>
      </button>
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">
          <span v-if="currentMember" class="text-purple-600">{{ currentMember.name }}</span> 님 상세 정보
        </h1>
      </div>
    </div>

    <div v-if="currentMember" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col space-y-6">
        <h2 class="text-xl font-extrabold text-gray-800">수강권 관리</h2>
        
        <div class="bg-purple-50 rounded-xl p-4 flex justify-between items-center border border-purple-100">
          <div>
            <p class="text-sm text-purple-800 font-bold mb-1">현재 남은 횟수</p>
            <p class="text-3xl font-black text-purple-900">{{ currentMember.remainingCount }}<span class="text-lg font-bold ml-1">회</span></p>
          </div>
          <div class="text-right">
            <p class="text-sm text-purple-800 font-bold mb-1">만료일</p>
            <p class="text-lg font-bold text-purple-900">{{ currentMember.expiredAt || '없음' }}</p>
          </div>
        </div>

        <form @submit.prevent="handleGrantVoucher" class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">추가/지급할 횟수</label>
            <div class="flex items-center space-x-2">
              <input 
                v-model="voucherCount" 
                type="number" 
                min="0" 
                placeholder="0"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 font-bold text-right" 
              />
              <span class="font-bold text-gray-600">회</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">* 횟수 변동이 없다면 비워두세요.</p>
          </div>

          <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label class="block text-sm font-bold text-gray-700 mb-3">유효기간 설정 </label>
            <!-- <span class="text-xs text-gray-400 font-normal ml-1">(기간 변경이 없으면 선택하지 마세요)</span> -->
            <div class="flex flex-wrap gap-2 mb-3">
              
              <button 
                type="button"
                v-for="months in [1, 2, 3, 6]" :key="months"
                @click="togglePeriod(months)"
                :class="selectedPeriod === months ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50'"
                class="px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition"
              >
                {{ months }}개월
              </button>

              <button 
                type="button"
                @click="togglePeriod('custom')"
                :class="selectedPeriod === 'custom' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50'"
                class="px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition"
              >
                직접 지정
              </button>
            </div>
            
            <input v-if="selectedPeriod === 'custom'" v-model="customDate" type="date" class="w-full px-4 py-2 rounded-lg border border-gray-300 font-bold" />
          </div>

          <button type="submit" class="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition">
            수강권 업데이트 적용
          </button>
        </form>
      </div>

      <div class="space-y-6">
        
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-extrabold text-gray-800 mb-4">대리 예약하기</h2>
          <div class="flex space-x-2 mb-4">
            <input v-model="targetDate" type="date" class="flex-1 px-4 py-2 rounded-lg border border-gray-300 font-bold" />
            <button @click="fetchLessonsByDate" type="button" class="px-4 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-black">조회</button>
          </div>
          
          <div v-if="availableLessons.length > 0" class="space-y-2 max-h-48 overflow-y-auto pr-2">
            <div v-for="lesson in availableLessons" :key="lesson.id" class="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <p class="font-bold text-gray-800 text-sm">{{ lesson.title }} <span class="text-gray-500 font-medium">({{ lesson.instructor + (lesson.instructor.at(-1) == 'T' ? '' : 'T') }})</span></p>
                <p class="text-xs text-blue-600 font-bold mt-1">{{ lesson.startTime }} ~ {{ lesson.endTime }}</p>
                <p class="text-xs text-gray-500 mt-1">정원: {{ lesson.reserved }} / {{ lesson.capacity }}명</p>
              </div>
              <button 
                @click="handleProxyReservation(lesson.id, lesson.title)" 
                :disabled="lesson.reserved >= lesson.capacity"
                class="px-3 py-1 text-white text-xs font-bold rounded-md transition"
                :class="lesson.reserved >= lesson.capacity ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'"
              >
                {{ lesson.reserved >= lesson.capacity ? '마감' : '예약' }}
              </button>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 font-medium text-center py-4">날짜를 선택하고 수업을 조회해주세요.</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-extrabold text-gray-800 mb-4">예약 내역 (강제 취소)</h2>
          <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
            <div v-for="res in memberReservations" :key="res.reservationId" class="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <p class="font-bold text-gray-800 text-sm">{{ res.lessonTitle }} <span class="text-gray-500 font-medium">({{ res.lessonInstructor + (res.lessonInstructor.at(-1) == 'T' ? '' : 'T') }})</span></p>
                <p class="text-xs text-gray-500 font-medium mt-1">{{ res.startDateTime.split('T')[0] }}</p>
                <p class="text-xs text-blue-600 font-bold mt-1">
                  {{ res.startDateTime.split('T')[1].substring(0, 5) }} ~ {{ res.endDateTime.split('T')[1].substring(0, 5) }}
                </p>
              </div>
              
              <button @click="handleForceCancel(res.reservationId)" class="px-3 py-1 bg-white text-red-600 border border-red-200 text-xs font-bold rounded-md hover:bg-red-50 transition shadow-sm">
                강제 취소
              </button>
            </div>
            <p v-if="memberReservations.length === 0" class="text-sm text-gray-400 font-medium text-center py-4">예약된 수업이 없습니다.</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>