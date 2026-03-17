<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

definePageMeta({ layout: 'admin' })

const adminStore = useAdminStore()
const todaySchedule = ref<any>([])

// 💡 오늘 날짜를 "YYYY-MM-DD" 형태로 예쁘게 뽑는 함수
const getTodayString = () => {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const todayDateStr = ref(getTodayString())

const loadTodaySchedule = async () => {
  try {
    todaySchedule.value = await adminStore.fetchDailySchedule(todayDateStr.value)
  } catch (error) {
    console.error('오늘의 스케줄을 불러오지 못했습니다.', error)
  }
}

onMounted(() => {
  loadTodaySchedule()
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 md:p-6">
    <div class="mb-8">
      <h2 class="text-2xl md:text-2xl font-extrabold text-gray-900 mb-2">오로라 원장님, 환영합니다!</h2>
      <p class="text-gray-500 font-medium">오늘 <span class="text-purple-600 font-bold">({{ todayDateStr }})</span> 예정된 수업과 예약자 명단입니다.</p>
    </div>
    
    <div v-if="todaySchedule.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
      <p class="text-l font-bold text-gray-400 mb-2">오늘은 예정된 수업이 없습니다!</p>
      <!-- <p class="text-sm text-gray-400">푹 쉬시거나 밀린 업무를 처리하세요!</p> -->
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <div 
        v-for="lesson in todaySchedule" 
        :key="lesson.lessonId" 
        class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-200"
      >
        <div class="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
          <div>
            <h3 class="text-xl font-extrabold text-gray-900">{{ lesson.title }}</h3>
            <p class="text-sm font-bold text-purple-600 mt-1">{{ lesson.startTime.substring(0,5) }} ~ {{ lesson.endTime.substring(0,5) }}</p>
            <p class="text-xs text-gray-500 mt-1">담당 강사: {{ lesson.instructor }}</p>
          </div>
          <div class="text-right">
            <span 
              class="px-3 py-1 text-xs font-bold rounded-full"
              :class="lesson.reservedCount >= lesson.capacity ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
            >
              {{ lesson.reservedCount >= lesson.capacity ? '정원 마감' : '예약 가능' }}
            </span>
            <p class="text-sm font-bold text-gray-700 mt-2">{{ lesson.reservedCount }} / {{ lesson.capacity }} 명</p>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-bold text-gray-800 mb-3 flex items-center">
            예약자 명단
          </h4>
          
          <div v-if="lesson.reservedMembers && lesson.reservedMembers.length > 0" class="flex flex-wrap gap-2">
            <span 
              v-for="(memberEmail, idx) in lesson.reservedMembers" 
              :key="idx" 
              class="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg"
            >
              {{ memberEmail }}
            </span>
          </div>
          
          <p v-else class="text-xs font-bold text-gray-400 bg-gray-50 p-3 rounded-lg text-center border border-dashed border-gray-200">
            아직 예약한 수강생이 없습니다.
          </p>
        </div>
      </div>

    </div>
  </div>
</template>