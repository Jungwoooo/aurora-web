<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLessonStore } from '@/stores/lesson'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'

definePageMeta({ layout: 'admin' })

const lessonStore = useLessonStore()
const adminStore = useAdminStore()
const toastStore = useToastStore()

// ==========================================
// 📅 1. 캘린더 기본 상태 관리
// ==========================================
const currentDate = ref(new Date()) 

const formatYYYYMMDD = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const selectedDate = ref(formatYYYYMMDD(currentDate.value))

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

const displaySelectedDate = computed(() => {
  const parts = selectedDate.value.split('-')
  return `${parseInt(parts[1])}월 ${parseInt(parts[2])}일`
})

const prevMonth = () => {
  const target = new Date(currentYear.value, currentMonth.value - 2, 1)
  currentDate.value = target
  selectedDate.value = formatYYYYMMDD(target)
}
const nextMonth = () => {
  const target = new Date(currentYear.value, currentMonth.value, 1)
  currentDate.value = target
  selectedDate.value = formatYYYYMMDD(target)
}

const days = ['일', '월', '화', '수', '목', '금', '토']

// 스마트 줄바꿈 캘린더 배열 계산
const calendarWeeks = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  
  const firstDay = new Date(year, month - 1, 1).getDay()
  const lastDate = new Date(year, month, 0).getDate()
  const prevMonthLastDate = new Date(year, month - 1, 0).getDate()
  
  const daysArray = []
  
  for (let i = firstDay - 1; i >= 0; i--) {
    daysArray.push({ 
      date: prevMonthLastDate - i, type: 'prev',
      fullDate: `${month === 1 ? year - 1 : year}-${String(month === 1 ? 12 : month - 1).padStart(2, '0')}-${String(prevMonthLastDate - i).padStart(2, '0')}`
    })
  }
  
  for (let i = 1; i <= lastDate; i++) {
    daysArray.push({ 
      date: i, type: 'current', 
      fullDate: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    })
  }
  
  const remaining = daysArray.length % 7
  if (remaining > 0) {
    const daysToAdd = 7 - remaining
    for (let i = 1; i <= daysToAdd; i++) {
      daysArray.push({ 
        date: i, type: 'next',
        fullDate: `${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      })
    }
  }

  const weeks = []
  for (let i = 0; i < daysArray.length; i += 7) {
    weeks.push(daysArray.slice(i, i + 7))
  }
  return weeks
})

const handleDayClick = (dayObj: any) => {
  selectedDate.value = dayObj.fullDate
}

// ==========================================
// 📡 2. 진짜 백엔드 데이터 불러오기 (API 연동)
// ==========================================
const realClasses = ref<any[]>([])

const fetchLessons = async () => {
  if (!calendarWeeks.value || calendarWeeks.value.length === 0) return

  const startDate = calendarWeeks.value[0][0].fullDate
  const endDate = calendarWeeks.value[calendarWeeks.value.length - 1][6].fullDate

  try {
    const data: any = await adminStore.fetchLessonsInRange(startDate, endDate)
    realClasses.value = data
  } catch (error) {
    console.error('수업 목록 조회 실패:', error)
    toastStore.show('수업 목록을 불러오는 데 실패했습니다.')
  }
}

watch(calendarWeeks, () => {
  fetchLessons()
}, { immediate: true })


// ==========================================
// 📋 3. 복사/붙여넣기 (클립보드) 로직
// ==========================================
const clipboard = ref<{
  type: 'single' | 'day' | 'week' | 'two-weeks' | null,
  label: string,
  data: any
}>({ type: null, label: '', data: null })

const isCopyOptionModalOpen = ref(false)
const isPasteConfirmModalOpen = ref(false)

const shiftDateTime = (dateTimeStr: string, daysToAdd: number) => {
  const d = new Date(dateTimeStr)
  d.setDate(d.getDate() + daysToAdd)
  
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`
}

const getLessonsInRange = (startDate: string, endDate: string) => {
  return realClasses.value.filter((cls: any) => {
    const lessonDate = cls.startTime.split('T')[0]
    return lessonDate >= startDate && lessonDate <= endDate
  })
}

// 현재 선택된 날짜가 포함된 주(Week)의 정보 가져오기
const getWeekInfoOfSelectedDate = () => {
  const weekIndex = calendarWeeks.value.findIndex(week => 
    week.some(day => day.fullDate === selectedDate.value)
  )
  if (weekIndex === -1) return null
  
  const week = calendarWeeks.value[weekIndex]
  return {
    index: weekIndex,
    startDate: week[0].fullDate,
    endDate: week[6].fullDate,
    week
  }
}

const clearClipboard = () => {
  clipboard.value = { type: null, label: '', data: null }
}

// [스케줄 복사 버튼 클릭] - 하루, 1주, 2주 복사 처리
const handleCopyOption = (option: 'day' | 'week' | 'two-weeks') => {
  isCopyOptionModalOpen.value = false
  
  if (option === 'day') {
    const lessons = getLessonsInRange(selectedDate.value, selectedDate.value)
    if (lessons.length === 0) return toastStore.show('이 날짜에는 복사할 수업이 없습니다.')
    
    clipboard.value = {
      type: 'day',
      label: `${selectedDate.value} (하루)`,
      data: { sourceStartDate: selectedDate.value, lessons }
    }
    toastStore.show(`${lessons.length}개의 하루 수업 스케줄이 복사되었습니다.`)
  } 
  else if (option === 'week') {
    const weekInfo = getWeekInfoOfSelectedDate()
    if (!weekInfo) return
    
    const lessons = getLessonsInRange(weekInfo.startDate, weekInfo.endDate)
    if (lessons.length === 0) return toastStore.show('이 주간에는 복사할 수업이 없습니다.')
    
    clipboard.value = {
      type: 'week',
      label: `${weekInfo.startDate} 주간`,
      data: { sourceStartDate: weekInfo.startDate, lessons }
    }
    toastStore.show(`${lessons.length}개의 1주치 수업 스케줄이 복사되었습니다.`)
  } 
  else if (option === 'two-weeks') {
    const weekInfo = getWeekInfoOfSelectedDate()
    if (!weekInfo) return
    
    const nextWeek = calendarWeeks.value[weekInfo.index + 1]
    if (!nextWeek) return toastStore.show('마지막 주에서는 2주 복사를 할 수 없습니다.')
    
    const endDate = nextWeek[6].fullDate
    const lessons = getLessonsInRange(weekInfo.startDate, endDate)
    if (lessons.length === 0) return toastStore.show('복사할 수업이 없습니다.')
    
    clipboard.value = {
      type: 'two-weeks',
      label: `${weekInfo.startDate} ~ 2주간`,
      data: { sourceStartDate: weekInfo.startDate, lessons }
    }
    toastStore.show(`${lessons.length}개의 2주치 수업 스케줄이 복사되었습니다.`)
  }
}

// 개별 단건 수업 복사
const copySingle = (cls: any) => {
  clipboard.value = { type: 'single', label: `'${cls.title}' 단건 수업`, data: cls }
  toastStore.show('단건 수업이 복사되었습니다.')
}

// 붙여넣기 정보 요약 계산기 (확인 모달용)
const pasteDetails = computed(() => {
  if (!clipboard.value.type || !clipboard.value.data) return null

  const count = clipboard.value.type === 'single' ? 1 : clipboard.value.data.lessons.length
  let sourceInfo = ''
  let targetInfo = ''

  if (clipboard.value.type === 'single') {
    sourceInfo = clipboard.value.data.startTime.split('T')[0]
    targetInfo = selectedDate.value
  } else if (clipboard.value.type === 'day') {
    sourceInfo = clipboard.value.data.sourceStartDate
    targetInfo = selectedDate.value
  } else {
    // 1주 / 2주 복사
    sourceInfo = `${clipboard.value.data.sourceStartDate} 시작 주간`
    const targetWeekInfo = getWeekInfoOfSelectedDate()
    targetInfo = targetWeekInfo ? `${targetWeekInfo.startDate} 시작 주간` : selectedDate.value
  }

  return { count, sourceInfo, targetInfo }
})

// 진짜 붙여넣기 실행 로직
const executePaste = async () => {
  if (!clipboard.value.type) return
  isPasteConfirmModalOpen.value = false

  // 1. 단건 수업 붙여넣기
  if (clipboard.value.type === 'single') {
    const sourceDate = clipboard.value.data.startTime.split('T')[0]
    const targetDate = selectedDate.value
    const diffDays = Math.round((new Date(targetDate).getTime() - new Date(sourceDate).getTime()) / (1000 * 60 * 60 * 24))

    const payload = {
      title: clipboard.value.data.title,
      instructor: clipboard.value.data.instructor,
      capacity: clipboard.value.data.capacity,
      startTime: shiftDateTime(clipboard.value.data.startTime, diffDays),
      endTime: shiftDateTime(clipboard.value.data.endTime, diffDays)
    }

    const success = await adminStore.createLesson(payload)
    if (success) {
      toastStore.show(`성공! 수업이 ${targetDate}일에 복사되었습니다.`)
      clearClipboard()
      await fetchLessons()
    }
  } 
  // 2. 하루 스케줄 통째로 붙여넣기
  else if (clipboard.value.type === 'day') {
    const sourceDate = clipboard.value.data.sourceStartDate
    const targetDate = selectedDate.value
    const diffDays = Math.round((new Date(targetDate).getTime() - new Date(sourceDate).getTime()) / (1000 * 60 * 60 * 24))

    const payload = clipboard.value.data.lessons.map((lesson: any) => ({
      title: lesson.title,
      instructor: lesson.instructor,
      capacity: lesson.capacity,
      startTime: shiftDateTime(lesson.startTime, diffDays),
      endTime: shiftDateTime(lesson.endTime, diffDays)
    }))

    if (adminStore.copyCreateLessons) {
      const success = await adminStore.copyCreateLessons(payload)
      if (success) {
        toastStore.show(`성공! ${payload.length}개의 수업이 복사되었습니다.`)
        clearClipboard()
        await fetchLessons()
      } else {
        toastStore.show('수업 대량 등록에 실패했습니다.')
      }
    }
  } 
  // 3. 1주 / 2주 스케줄 대량 붙여넣기
  else {
    const targetWeekInfo = getWeekInfoOfSelectedDate()
    if (!targetWeekInfo) return toastStore.show('선택된 날짜의 주간 정보를 찾을 수 없습니다.')

    if (clipboard.value.type === 'two-weeks' && targetWeekInfo.index === calendarWeeks.value.length - 1) {
      return toastStore.show('마지막 주에는 2주치를 붙여넣을 공간이 부족합니다.')
    }

    const sourceStartDate = clipboard.value.data.sourceStartDate
    const targetStartDate = targetWeekInfo.startDate
    const diffDays = Math.round((new Date(targetStartDate).getTime() - new Date(sourceStartDate).getTime()) / (1000 * 60 * 60 * 24))

    const payload = clipboard.value.data.lessons.map((lesson: any) => ({
      title: lesson.title,
      instructor: lesson.instructor,
      capacity: lesson.capacity,
      startTime: shiftDateTime(lesson.startTime, diffDays),
      endTime: shiftDateTime(lesson.endTime, diffDays)
    }))

    if (adminStore.copyCreateLessons) {
      const success = await adminStore.copyCreateLessons(payload)
      if (success) {
        toastStore.show(`✨ 성공! ${payload.length}개의 수업이 복사되었습니다.`)
        clearClipboard()
        await fetchLessons()
      } else {
        toastStore.show('수업 대량 등록에 실패했습니다.')
      }
    } else {
      toastStore.show('adminStore에 copyCreateLessons 함수를 추가해 주세요!')
    }
  }
}

// ==========================================
// 📝 4. 단건 수업 개설 모달 상태
// ==========================================
const isCreateModalOpen = ref(false)

const title = ref('')
const instructor = ref('')
const formDate = ref('') 
const startTime = ref('') 
const endTime = ref('')  
const capacity = ref(7)

const openCreateModal = () => {
  formDate.value = selectedDate.value
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
  title.value = ''
  instructor.value = ''
  startTime.value = ''
  endTime.value = ''
  capacity.value = 7
}

const handleCreateLesson = async () => {
  if (!title.value || !instructor.value || !formDate.value || !startTime.value || !endTime.value) {
    return toastStore.show('모든 칸을 채워주세요!')
  }

  try {
    const formatTime = (t: string) => t.includes(':') ? t : t.slice(0, 2) + ':' + t.slice(2)
    const formattedStart = formatTime(startTime.value)
    const formattedEnd = formatTime(endTime.value)

    const startDateTime = `${formDate.value}T${formattedStart}:00`
    const endDateTime = `${formDate.value}T${formattedEnd}:00`

    const success = await adminStore.createLesson({
      title: title.value,
      instructor: instructor.value,
      startTime: startDateTime,
      endTime: endDateTime,
      capacity: Number(capacity.value)
    })

    if (success) {
      toastStore.show('수업이 성공적으로 개설되었습니다!')
      closeCreateModal() 
      await fetchLessons()
    }
  } catch (error) {
    toastStore.show('수업 개설에 실패했습니다.')
  }
}
</script>

<template>
  <div class="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 pb-24">
    
    <div class="flex items-center justify-center mb-8 gap-6">
      <button @click="prevMonth" class="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all active:scale-95">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight select-none">
        {{ currentYear }}.{{ String(currentMonth).padStart(2, '0') }}
      </h2>
      
      <button @click="nextMonth" class="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all active:scale-95">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 mb-2 text-xs">
      <div v-for="day in days" :key="day" :class="day === '일' ? 'text-red-400' : day === '토' ? 'text-blue-400' : ''">
        {{ day }}
      </div>
    </div>

    <div class="flex flex-col gap-1 mb-8">
      <div 
        v-for="(week, index) in calendarWeeks" 
        :key="index"
        class="grid grid-cols-7 gap-1 p-1 rounded-xl transition-all duration-200"
      >
        <div v-for="dayObj in week" :key="dayObj.fullDate" class="flex justify-center items-center py-1">
          <button 
            @click="handleDayClick(dayObj)"
            :class="[
              'w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all relative cursor-pointer',
              selectedDate === dayObj.fullDate ? 'bg-blue-600 text-white shadow-md z-0' : 
              (dayObj.type === 'current' ? 'bg-transparent text-gray-700 hover:bg-blue-50' : 
              'text-gray-300 font-medium hover:bg-gray-100')
            ]"
          >
            {{ dayObj.date }}
          </button>
        </div>
      </div>
    </div>

    <div class="border-t pt-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 class="text-lg font-bold text-gray-800">{{ displaySelectedDate }} 등록된 수업</h3>
        
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button 
            v-if="clipboard.type"
            @click="isPasteConfirmModalOpen = true" 
            class="flex-1 sm:flex-none px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-purple-700 transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            붙여넣기
          </button>
          
          <button 
            @click="isCopyOptionModalOpen = true" 
            class="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            복사
          </button>
          
          <button 
            @click="openCreateModal" 
            class="flex-1 sm:flex-none px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-gray-800 transition flex items-center justify-center gap-1 active:scale-95"
          >
            <span class="text-lg leading-none"></span>추가
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <div v-for="cls in getLessonsInRange(selectedDate, selectedDate)" :key="cls.id" class="flex justify-between items-center p-4 rounded-xl border bg-white border-gray-200 shadow-sm">
          <div class="flex-1 min-w-0 pr-3">
            <div class="text-lg font-extrabold text-gray-900 leading-none">
              {{ cls.startTime.substring(11, 16) }} ~ {{ cls.endTime.substring(11, 16) }}
            </div>
            <div class="text-blue-600 font-bold text-sm mt-1">
              {{ cls.title }} <span class="text-gray-400 font-medium text-xs">({{ cls.instructor }} 강사)</span>
            </div>
            <div class="text-xs font-bold mt-1" :class="cls.reserved >= cls.capacity ? 'text-red-500' : 'text-gray-500'">
              정원: {{ cls.reserved }} / {{ cls.capacity }}명 {{ cls.reserved >= cls.capacity ? '[마감]' : '' }}
            </div>
          </div>
          <div class="flex space-x-2">
            <button @click="copySingle(cls)" class="px-3 py-1.5 bg-green-50 text-green-700 rounded-md font-bold text-xs hover:bg-green-100">복사</button>
          </div>
        </div>
        
        <div v-if="getLessonsInRange(selectedDate, selectedDate).length === 0" class="p-6 text-center text-gray-400 text-sm">
          이 날짜에는 등록된 수업이 없습니다.
        </div>
      </div>
    </div>
  </div>

  <div v-if="clipboard.type" class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] bg-gray-900/95 backdrop-blur shadow-2xl rounded-full px-6 py-3 flex items-center space-x-4 animate-fade-in-up w-[90%] sm:w-auto justify-between sm:justify-start">
    <div class="text-white text-xs sm:text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
      <span class="text-purple-300 font-bold mr-1">{{ clipboard.label }}</span> 복사됨
    </div>
    <div class="w-px h-4 bg-gray-600 hidden sm:block"></div>
    <button @click="clearClipboard" class="text-gray-400 hover:text-white text-xs sm:text-sm font-bold transition">취소</button>
  </div>

  <BaseModal :isOpen="isCopyOptionModalOpen" title="수업 스케줄 복사" @close="isCopyOptionModalOpen = false">
    <p class="text-gray-500 text-xs mb-5">현재 선택된 날짜(<span class="text-blue-600 font-extrabold">{{ displaySelectedDate }}</span>)를 기준으로 복사할 범위를 선택하세요.</p>
    
    <div class="space-y-3">
      <button @click="handleCopyOption('day')" class="w-full p-4 text-left border border-gray-100 rounded-2xl hover:border-purple-300 hover:bg-purple-50/30 transition group">
        <div class="font-extrabold text-sm text-gray-800 group-hover:text-purple-700 flex items-center justify-between">
          <span>하루 복사</span>
          <!-- <span class="text-xs font-normal text-gray-400">Today only</span> -->
        </div>
        <p class="text-xs text-gray-400 mt-1">이 날짜에 개설된 모든 수업들을 복사합니다.</p>
      </button>

      <button @click="handleCopyOption('week')" class="w-full p-4 text-left border border-gray-100 rounded-2xl hover:border-purple-300 hover:bg-purple-50/30 transition group">
        <div class="font-extrabold text-sm text-gray-800 group-hover:text-purple-700 flex items-center justify-between">
          <span>1주 복사</span>
          <!-- <span class="text-xs font-normal text-gray-400">1 Week</span> -->
        </div>
        <p class="text-xs text-gray-400 mt-1">선택된 날짜가 포함된 한 주간의 모든 수업들을 복사합니다.</p>
      </button>

      <button @click="handleCopyOption('two-weeks')" class="w-full p-4 text-left border border-gray-100 rounded-2xl hover:border-purple-300 hover:bg-purple-50/30 transition group">
        <div class="font-extrabold text-sm text-gray-800 group-hover:text-purple-700 flex items-center justify-between">
          <span>2주 복사</span>
          <!-- <span class="text-xs font-normal text-gray-400">2 Weeks</span> -->
        </div>
        <p class="text-xs text-gray-400 mt-1">선택된 날짜가 포함된 주부터 2주간의 수업을 통째로 복사합니다.</p>
      </button>
    </div>
  </BaseModal>

  <BaseModal :isOpen="isPasteConfirmModalOpen" title="스케줄 붙여넣기 확인" @close="isPasteConfirmModalOpen = false">
    <div v-if="pasteDetails" class="space-y-4">
      <div class="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center space-x-3">
        <!-- <span class="text-2xl"></span> -->
        <div>
          <h4 class="text-purple-900 font-extrabold text-sm">스케줄 일괄 생성</h4>
          <p class="text-purple-700 text-xs mt-0.5">선택한 일정 기반으로 수업을 일괄 복사합니다.</p>
        </div>
      </div>

      <div class="space-y-2 border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 font-medium">대상 수업 개수</span>
          <span class="text-gray-900 font-extrabold">{{ pasteDetails.count }}개 수업</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 font-medium">복사 원본 정보</span>
          <span class="text-gray-900 font-bold">{{ pasteDetails.sourceInfo }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 font-medium">붙여넣어질 대상</span>
          <span class="text-blue-600 font-extrabold">➔ {{ pasteDetails.targetInfo }}</span>
        </div>
      </div>

      <p class="text-xs text-red-400 text-center">※ 기존 일정이 있는 경우 겹칠 수 있으니 타겟 일자를 꼭 확인해 주세요!</p>

      <div class="pt-2 flex space-x-2">
        <button type="button" @click="isPasteConfirmModalOpen = false" class="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition">
          취소
        </button>
        <button type="button" @click="executePaste" class="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 transition text-sm">
          확인 및 복사 실행
        </button>
      </div>
    </div>
  </BaseModal>

  <BaseModal :isOpen="isCreateModalOpen" title="새 수업 개설" @close="closeCreateModal">
    <form @submit.prevent="handleCreateLesson" class="space-y-4">
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">수업명 (난이도)</label>
        <input v-model="title" type="text" placeholder="예: 입문반 (폴린이 환영)" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition text-sm" />
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">강사명</label>
        <input v-model="instructor" type="text" placeholder="예: 오로라" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition text-sm" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">날짜</label>
          <input v-model="formDate" type="date" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition text-sm" />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">시작 시간</label>
          <input v-model="startTime" type="text" placeholder="1900" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-sm" />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">종료 시간</label>
          <input v-model="endTime" type="text" placeholder="2000" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-sm" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">정원 (명)</label>
        <input v-model="capacity" type="number" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition text-sm" />
      </div>

      <div class="pt-4 flex space-x-2">
        <button type="button" @click="closeCreateModal" class="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition">
          취소
        </button>
        <button type="submit" class="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 transition text-sm">
          스케줄에 올리기
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
@keyframes fade-in-up {
  0% { opacity: 0; transform: translate(-50%, 20px); }
  100% { opacity: 1; transform: translate(-50%, 0); }
}

.animate-bounce-short { animation: bounce-short 1s infinite; }
@keyframes bounce-short {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>