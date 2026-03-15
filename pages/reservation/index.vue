<script setup lang="ts">
import { ref, computed } from 'vue'

// 📅 1. 실제 달력 로직
const currentDate = ref(new Date()) // 현재 날짜 기준
const selectedDate = ref(currentDate.value.getDate())

// 년, 월 계산
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

// 이번 달의 총 일수 (예: 31일)
const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value, 0).getDate())
// 이번 달 1일의 요일 (0: 일요일, 1: 월요일 ...)
const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value - 1, 1).getDay())

// 달력 앞에 비워둘 빈 칸 배열 생성
const blankDays = computed(() => Array.from({ length: firstDayOfMonth.value }, () => ''))
const dates = computed(() => Array.from({ length: daysInMonth.value }, (_, i) => i + 1))

// 이전 달, 다음 달 이동 함수
const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 2, 1)
  selectedDate.value = 1 // 달을 넘기면 1일로 초기화
}
const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value, 1)
  selectedDate.value = 1
}

const days = ['일', '월', '화', '수', '목', '금', '토']

// 💃 2. 가짜 수업 데이터 목록
const mockClasses = [
  { id: 1, time: '19:00', name: '초중급 스핀폴', instructor: '오로라', capacity: 8, booked: 3 },
  { id: 2, time: '20:00', name: '입문반 (처음 오신 분)', instructor: '신가연', capacity: 8, booked: 8 },
  { id: 2, time: '20:00', name: '입문반 (처음 오신 분)', instructor: '신가연', capacity: 8, booked: 8 },
  { id: 2, time: '20:00', name: '입문반 (처음 오신 분)', instructor: '신가연', capacity: 8, booked: 8 },
]
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
      
      <div class="space-y-3">
        <div 
          v-for="cls in mockClasses" 
          :key="cls.id"
          :class="[
            'flex justify-between items-center p-4 rounded-xl border',
            cls.booked >= cls.capacity ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-purple-100 shadow-sm'
          ]"
        >
          <div class="flex-1 min-w-0 pr-3">
            <div class="text-lg font-extrabold text-gray-900 leading-none">{{ cls.time }}</div>
            <div class="text-purple-600 font-bold text-sm mt-1 truncate">{{ cls.name }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ cls.instructor }} 강사</div>
          </div>
          
          <div class="flex flex-col items-end shrink-0">
            <div :class="['text-[11px] font-bold mb-1', cls.booked >= cls.capacity ? 'text-red-500' : 'text-green-600']">
              {{ cls.booked }} / {{ cls.capacity }}명
            </div>
            
            <button 
              :disabled="cls.booked >= cls.capacity"
              :class="[
                'px-3 py-1.5 rounded-md font-bold text-xs whitespace-nowrap',
                cls.booked >= cls.capacity 
                  ? 'bg-gray-200 text-gray-400' 
                  : 'bg-purple-600 text-white active:scale-95'
              ]"
            >
              {{ cls.booked >= cls.capacity ? '마감' : '예약하기' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>