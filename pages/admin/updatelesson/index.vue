<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLessonStore } from '@/stores/lesson'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast' 

definePageMeta({ layout: 'admin' })

const lessonStore = useLessonStore()
const adminStore = useAdminStore()
const toastStore = useToastStore()
const memberStore = useMemberStore()

const currentDate = ref(new Date()) 
const selectedDate = ref(currentDate.value.getDate())

const isEditModalOpen = ref(false)
// 💡 TS 에러 해결: null로 시작하지만 나중에 객체(any)가 들어올 수 있다고 알려줌
const selectedLesson = ref<any>(null)

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

const formattedSelectedDate = computed(() => {
  const y = currentYear.value
  const m = String(currentMonth.value).padStart(2, '0')
  const d = String(selectedDate.value).padStart(2, '0')
  return `${y}-${m}-${d}`
})

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

const fetchData = async () => {
  const dateStr = formattedSelectedDate.value
  try {
    realClasses.value = await lessonStore.fetchLessons(dateStr)
  } catch (error) {
    console.error('데이터를 불러오지 못했습니다.', error)
    toastStore.show('수업 목록을 불러오는데 실패했습니다.')
  }
}

watch([selectedDate, currentMonth], fetchData, { immediate: true })

const handleEdit = (cls: any) => {
  if (memberStore.userInfo?.role === 'admin') {
    selectedLesson.value = cls
    isEditModalOpen.value = true
  } else {
    toastStore.show('접근 권한이 없습니다.')
  }
}

const handleDelete = async (lessonId: number) => {
  if (memberStore.userInfo?.role === 'admin') {
    if (confirm('정말로 이 수업을 삭제하시겠습니까?\n이미 예약한 회원이 있다면 취소 처리됩니다.')) {
      try {
        await adminStore.deleteLesson(lessonId) 
        toastStore.show('수업이 삭제되었습니다.')
        await fetchData() 
      } catch (error: any) {
        toastStore.show('삭제 실패 \n이유: ' + (error.response?._data || '서버 오류'))
      }
    }
  } else {
    toastStore.show('접근 권한이 없습니다.')
  }
}
</script>

<template>
  <LessonEditModal 
    :is-open="isEditModalOpen" 
    :lesson="selectedLesson"
    :selected-date-str="formattedSelectedDate"
    @close="isEditModalOpen = false" 
    @refresh="fetchData" 
  />

  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-extrabold text-gray-800">{{ currentYear }}년 {{ currentMonth }}월 수업 관리</h2>
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
            ? 'bg-blue-600 text-white shadow-md' 
            : 'bg-transparent text-gray-700 hover:bg-blue-50'
        ]"
      >
        {{ date }}
      </button>
    </div>

    <div class="mt-8 border-t pt-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4">{{ currentMonth }}월 {{ selectedDate }}일 등록된 수업</h3>
      
      <div v-if="realClasses.length === 0" class="text-center py-8 text-gray-500 font-medium">
        등록된 수업이 없습니다.
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="cls in realClasses" 
          :key="cls.id"
          class="flex justify-between items-center p-4 rounded-xl border bg-white border-gray-200 shadow-sm"
        >
          <div class="flex-1 min-w-0 pr-3">
            <div class="text-lg font-extrabold text-gray-900 leading-none">
              {{ cls.startTime.substring(0, 5) }} ~ {{ cls.endTime.substring(0, 5) }}
            </div>
            <div class="text-blue-600 font-bold text-sm mt-1 truncate">{{ cls.title }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ cls.instructor + (cls.instructor.at(-1) == 'T' ? '' : 'T') }}</div>
          </div>
          
          <div class="flex flex-col items-end shrink-0 gap-2">
            <div class="text-[11px] font-bold text-gray-600">
              현재 예약: <span :class="cls.reserved >= cls.capacity ? 'text-red-500' : 'text-blue-600'">{{ cls.reserved }} / {{ cls.capacity }}명</span>
            </div>
            
            <div class="flex space-x-2">
              <button 
                @click="handleEdit(cls)"
                class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md font-bold text-xs hover:bg-gray-200 transition"
              >
                수정
              </button>
              <button 
                @click="handleDelete(cls.id)"
                class="px-3 py-1.5 bg-red-50 text-red-600 rounded-md font-bold text-xs hover:bg-red-100 transition"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>