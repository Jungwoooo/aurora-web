<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '@/stores/member'
import { useReservationStore } from '@/stores/reservation'

// 일반 수강생 화면이므로 기본 레이아웃 사용
definePageMeta({ layout: 'default' })

const router = useRouter()
const memberStore = useMemberStore()
const reservationStore = useReservationStore()
const toastStore = useToastStore()

const { userInfo } = storeToRefs(memberStore)
const myReservations = ref<any>([])

const currentDate = ref(new Date()) 
const selectedDate = ref(currentDate.value.getDate())

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

// 💡 전날 18시가 지났는지 계산하는 센스 만점 로직!
const canCancel = (startDateTimeStr: string) => {
  const lessonDate = new Date(startDateTimeStr)
  const deadline = new Date(lessonDate)
  deadline.setDate(deadline.getDate() - 1) // 하루 전으로 빼고
  deadline.setHours(18, 0, 0, 0) // 시간을 18:00:00으로 셋팅!

  // 현재 시간이 데드라인보다 작아야(이전이어야) true 반환
  return new Date() < deadline
}

// 💡 전날 18시가 지났는지 계산하는 센스 만점 로직!
const isPastLesson = (startTime: string) => {
  const lessonDateTime = new Date(`${startTime}`)
  return lessonDateTime < new Date() // 현재 시간보다 과거면 true!
}

const loadMyReservations = async () => {
  if (!userInfo.value?.id) return
  try {
    myReservations.value = await reservationStore.fetchMyReservations(userInfo.value.id)
  } catch (e) {
    console.error('내 예약 목록 불러오기 실패')
  }
}

const handleCancel = async (reservationId: number, startDateTimeStr: string) => {
  // 1차 방어 (화면에서 미리 컷)
  if (!canCancel(startDateTimeStr)) {
    return toastStore.show('취소 가능 시간(수업 전날 18시)이 지났습니다. 센터로 문의해주세요!')
  }

  if (!confirm('정말 예약을 취소하시겠습니까? (수강권 1회가 복구됩니다)')) return

  try {
    // 2차 방어 (백엔드로 요청)
    await reservationStore.cancelMyReservation(reservationId, userInfo.value.id)
    toastStore.show('예약이 성공적으로 취소되었습니다.')
    await loadMyReservations() // 목록 새로고침
  } catch (e: any) {
    toastStore.show('취소 실패: ' + (e.response?._data?.message || e.message))
  }
}

onMounted(() => {
  // 로그인 안 했으면 쫓아내기
  if (!userInfo.value) {
    toastStore.show('로그인이 필요한 서비스입니다.')
    router.push('/login')
    return
  }
  loadMyReservations()
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 md:p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-extrabold text-gray-900">내 예약 내역</h1>
      <p class="text-gray-500 mt-1">예약하신 수업 목록입니다.</p>
      <p class="text-red-500 font-bold">(취소는 전날 18시까지만 가능!)</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div class="space-y-4">
        
        <div v-for="res in myReservations" :key="res.reservationId" class="flex flex-col md:flex-row justify-between md:items-center p-4 bg-gray-50 border border-gray-200 rounded-xl gap-4">
          <div>
            <p class="font-extrabold text-gray-800 text-lg">{{ res.lessonTitle }} <span class="text-gray-500 font-medium">({{ res.lessonInstructor + (res.lessonInstructor.at(-1) == 'T' ? '' : 'T') }})</span></p>
            <p class="text-sm text-gray-500 font-medium mt-1">{{ res.startDateTime.split('T')[0] }}</p>
            <p class="text-sm text-blue-600 font-bold mt-1">
              {{ res.startDateTime.split('T')[1].substring(0, 5) }} ~ {{ res.endDateTime.split('T')[1].substring(0, 5) }}
            </p>
          </div>

          <button 
            @click="handleCancel(res.reservationId, res.startDateTime)"
            :disabled="!canCancel(res.startDateTime)"
            class="px-5 py-2.5 text-sm font-bold rounded-xl transition shadow-sm w-full md:w-auto"
            :class="canCancel(res.startDateTime) 
              ? 'bg-white text-red-600 border border-red-200 hover:bg-red-50' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
          >
            {{ canCancel(res.startDateTime) ? '예약 취소' : isPastLesson(res.startDateTime) ? '종료' : '취소 불가' }}
          </button>
        </div>

        <div v-if="myReservations.length === 0" class="text-center py-10">
          <p class="text-gray-400 font-bold text-lg mb-2">예약된 수업이 없습니다.</p>
          <button @click="router.push('/reservation')" class="mt-2 px-6 py-2 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition">
            수업 예약하러 가기
          </button>
        </div>

      </div>
    </div>
  </div>
</template>