<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMemberStore } from '@/stores/member'
import { useReservationStore } from '@/stores/reservation'
import { useLessonStore } from '@/stores/lesson'

const memberStore = useMemberStore()
const reservationStore = useReservationStore()
const lessonStore = useLessonStore()
const toastStore = useToastStore()

// 📅 1. 원장님이 만드셨던 실제 달력 로직
const currentDate = ref(new Date()) 
const selectedDate = ref(currentDate.value.getDate())

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value, 0).getDate())
const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value - 1, 1).getDay())

const blankDays = computed(() => Array.from({ length: firstDayOfMonth.value }, () => ''))
const dates = computed(() => Array.from({ length: daysInMonth.value }, (_, i) => i + 1))

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 2, 1)
  selectedDate.value = 1 
}
const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value, 1)
  selectedDate.value = 1
}

const days = ['일', '월', '화', '수', '목', '금', '토']

const realClasses = ref<any>([])
const myReservations = ref<any>([]) // 💡 내가 예약한 내역 보관용!

// 🚀 2. 백엔드에서 날짜별 수업 + 내 예약 정보 가져오기
const fetchData = async () => {
  const year = currentYear.value
  const month = String(currentMonth.value).padStart(2, '0')
  const day = String(selectedDate.value).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`

  try {
    // 1) 해당 날짜의 전체 수업 목록 가져오기
    realClasses.value = await lessonStore.fetchLessons(dateStr)

    // 2) 로그인했다면? 내 예약 내역도 가져와서 비교할 준비!
    if (memberStore.userInfo?.id) {
      myReservations.value = await reservationStore.fetchMyReservations(memberStore.userInfo.id)
    }
  } catch (error) {
    console.error('데이터를 불러오지 못했습니다.', error)
  }
}

// 💡 날짜가 바뀔 때마다 무조건 다시 불러오기!
watch([selectedDate, currentMonth], fetchData, { immediate: true })

// 🚨 3. 상태 체크 로직 (과거인가? 이미 예약했나?)
// 1) 이미 예약한 수업인지 확인
const isAlreadyBooked = (lessonId: number) => {
  return myReservations.value.some((res: any) => res.lessonId === lessonId)
}

// 2) 이미 시간이 지나간 수업인지 확인
const isPastLesson = (startTime: string) => {
  const year = currentYear.value
  const month = String(currentMonth.value).padStart(2, '0')
  const day = String(selectedDate.value).padStart(2, '0')
  // 백엔드에서 온 "19:00" 등을 조합해서 진짜 Date 객체로 만듦
  const lessonDateTime = new Date(`${year}-${month}-${day}T${startTime}`)
  return lessonDateTime < new Date() // 현재 시간보다 과거면 true!
}

// 🚀 4. 진짜 예약 로직
const handleBooking = async (lessonId: number) => {
  const myMemberId = memberStore.userInfo?.id
  if (!myMemberId) return toastStore.show('로그인 먼저 해주세요!')

  if (confirm('이 수업을 예약하시겠습니까? (수강권 1회가 차감됩니다.)')) {
    try {
      await reservationStore.createReservation({
        memberId: Number(myMemberId),
        lessonId: Number(lessonId)
      })
      toastStore.show('예약이 완벽하게 확정되었습니다!')
      await fetchData() // 🔄 예약 성공하면 목록 다시 싹 새로고침!

    } catch (error: any) {
      toastStore.show('예약 실패 \n이유: ' + (error.response?._data || '서버 오류'))
    }
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
    
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-extrabold text-gray-800">{{ currentYear }}년 {{ currentMonth }}월</h2>
      <div class="flex space-x-2">
        <button @click="prevMonth" class="p-2 bg-gray-50 rounded-lg hover:bg-gray-200">⬅️</button>
        <button @click="nextMonth" class="p-2 bg-gray-50 rounded-lg hover:bg-gray-200">➡️</button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 mb-2 text-xs">
      <div v-for="day in days" :key="day" :class="day === '일' ? 'text-red-400' : day === '토' ? 'text-blue-400' : ''">
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center">
      <div v-for="(blank, index) in blankDays" :key="'blank-'+index"></div>
      
      <button 
        v-for="date in dates" 
        :key="date"
        @click="selectedDate = date"
        :class="[
          'py-2 rounded-lg font-medium text-sm transition',
          selectedDate === date 
            ? 'bg-purple-600 text-white shadow-md' 
            : 'bg-transparent text-gray-700 hover:bg-purple-50'
        ]"
      >
        {{ date }}
      </button>
    </div>

    <div class="mt-8 border-t pt-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4">{{ currentMonth }}월 {{ selectedDate }}일 일정</h3>
      
      <div v-if="realClasses.length === 0" class="text-center py-8 text-gray-500 font-medium">
        예정된 수업이 없습니다.
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="cls in realClasses" 
          :key="cls.id"
          :class="[
            'flex justify-between items-center p-4 rounded-xl border',
            (isPastLesson(cls.startTime) || isAlreadyBooked(cls.id) || cls.reserved >= cls.capacity) ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-purple-100 shadow-sm'
          ]"
        >
          <div class="flex-1 min-w-0 pr-3">
            <div class="text-lg font-extrabold text-gray-900 leading-none">
              {{ cls.startTime.substring(0, 5) }} ~ {{ cls.endTime.substring(0, 5) }}
            </div>
            <div class="text-purple-600 font-bold text-sm mt-1 truncate">{{ cls.title }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ cls.instructor + (cls.instructor.at(-1) == 'T' ? '' : 'T') }}</div>
          </div>
          
          <div class="flex flex-col items-end shrink-0">
            <div :class="['text-[11px] font-bold mb-1', cls.reserved >= cls.capacity ? 'text-red-500' : 'text-green-600']">
              {{ cls.reserved }} / {{ cls.capacity }}명
            </div>
            
            <button 
              @click="handleBooking(cls.id)"
              :disabled="isPastLesson(cls.startTime) || isAlreadyBooked(cls.id) || cls.reserved >= cls.capacity"
              :class="[
                'px-3 py-1.5 rounded-md font-bold text-xs whitespace-nowrap transition',
                (isPastLesson(cls.startTime) || cls.reserved >= cls.capacity || isAlreadyBooked(cls.id)) ? 'bg-gray-200 text-gray-400' : 
                'bg-purple-600 text-white active:scale-95 hover:bg-purple-700'
              ]"
            >
              {{ 
                isPastLesson(cls.startTime) ? '종료' : 
                isAlreadyBooked(cls.id) ? '예약 완료' : 
                cls.reserved >= cls.capacity ? '정원 마감' : '예약하기' 
              }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>