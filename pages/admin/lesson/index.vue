<script setup lang="ts">
import { ref, computed, watch } from 'vue' // 💡 watch 추가!
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

// 🚀 스마트 줄바꿈 캘린더 배열 계산 (무조건 7등분 그리드)
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
const realClasses = ref<any[]>([]) // 💡 가짜 데이터 치우고 실제 DB 데이터를 담습니다!

const fetchLessons = async () => {
  if (!calendarWeeks.value || calendarWeeks.value.length === 0) return

  // 💡 달력 그리드의 맨 첫 칸(좌측 상단)과 맨 마지막 칸(우측 하단) 날짜 자동 계산!
  const startDate = calendarWeeks.value[0][0].fullDate
  const endDate = calendarWeeks.value[calendarWeeks.value.length - 1][6].fullDate

  try {
    const data: any = await adminStore.fetchLessonsInRange(startDate, endDate)
    realClasses.value = data
  } catch (error) {
    console.error('🚨 수업 목록 조회 실패:', error)
    toastStore.show('수업 목록을 불러오는 데 실패했습니다.')
  }
}

// 💡 [마법의 와처] 달력이 켜지거나 달(Month)이 바뀔 때마다 백엔드에서 42일치 데이터를 새로 땡겨옵니다!
watch(calendarWeeks, () => {
  fetchLessons()
}, { immediate: true })


// ==========================================
// 📋 3. 복사/붙여넣기 (클립보드) 로직
// ==========================================
const clipboard = ref<{
  type: 'single' | 'week' | 'two-weeks' | null,
  label: string,
  data: any
}>({ type: null, label: '', data: null })

const hoveredWeekIndex = ref<number | null>(null)

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

const copyWeek = (index: number) => {
  const week = calendarWeeks.value[index]
  const sourceStartDate = week[0].fullDate
  const sourceEndDate = week[6].fullDate
  
  const targetLessons = getLessonsInRange(sourceStartDate, sourceEndDate)
  if (targetLessons.length === 0) return toastStore.show('이 주(Week)에는 복사할 수업이 없습니다.')

  clipboard.value = { 
    type: 'week', 
    label: `${sourceStartDate} 주간`, 
    data: { sourceStartDate, lessons: targetLessons } 
  }
  toastStore.show(`${targetLessons.length}개의 수업이 복사되었습니다.`)
}

const copyTwoWeeks = (index: number) => {
  const week1 = calendarWeeks.value[index]
  const week2 = calendarWeeks.value[index + 1]
  if (!week2) return toastStore.show('마지막 주에서는 2주 복사를 할 수 없습니다.')

  const sourceStartDate = week1[0].fullDate
  const sourceEndDate = week2[6].fullDate
  const targetLessons = getLessonsInRange(sourceStartDate, sourceEndDate)

  if (targetLessons.length === 0) return toastStore.show('복사할 수업이 없습니다.')

  clipboard.value = { 
    type: 'two-weeks', 
    label: `2주간 (${sourceStartDate} ~)`, 
    data: { sourceStartDate, lessons: targetLessons } 
  }
  toastStore.show(`${targetLessons.length}개의 수업이 복사되었습니다.`)
}

const copySingle = (cls: any) => {
  clipboard.value = { type: 'single', label: `'${cls.title}' 수업`, data: cls }
  toastStore.show('수업이 복사되었습니다.')
}

const clearClipboard = () => {
  clipboard.value = { type: null, label: '', data: null }
}

const pasteWeeks = async (targetIndex: number) => {
  if (clipboard.value.type === 'two-weeks' && targetIndex === calendarWeeks.value.length - 1) {
    return toastStore.show('마지막 주에는 2주치를 붙여넣을 공간이 부족합니다.')
  }

  const sourceStartDate = clipboard.value.data.sourceStartDate
  const targetStartDate = calendarWeeks.value[targetIndex][0].fullDate
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
      await fetchLessons() // 🚀 복사 후 화면 데이터 즉시 자동 갱신!
    } else {
      toastStore.show('수업 대량 등록에 실패했습니다.')
    }
  } else {
    toastStore.show('adminStore에 bulkCreateLessons 함수를 먼저 추가해주세요!')
  }
}

const pasteSingle = async () => {
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
    toastStore.show(`✨ 성공! 수업이 ${targetDate}일에 추가되었습니다.`)
    clearClipboard()
    await fetchLessons() // 🚀 복사 후 화면 데이터 즉시 자동 갱신!
  }
}

// ==========================================
// 📝 4. 단건 수업 개설 모달 (Modal) 상태
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
      await fetchLessons() // 🚀 개설 후 화면 데이터 즉시 자동 갱신!
    }
  } catch (error) {
    toastStore.show('수업 개설에 실패했습니다.')
  }
}
</script>

<template>
  <div class="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 pb-24">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h2 class="text-xl font-extrabold text-gray-800">{{ currentYear }}년 {{ currentMonth }}월 수업 관리</h2>
      <div class="flex space-x-2">
        <button @click="prevMonth" class="p-2 bg-gray-50 rounded-lg hover:bg-gray-200 transition">⬅️</button>
        <button @click="nextMonth" class="p-2 bg-gray-50 rounded-lg hover:bg-gray-200 transition">➡️</button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 mb-2 text-xs">
      <div v-for="day in days" :key="day" :class="day === '일' ? 'text-red-400' : day === '토' ? 'text-blue-400' : ''">
        {{ day }}
      </div>
    </div>

    <div class="flex flex-col gap-1 mb-8 relative">
      <div 
        v-for="(week, index) in calendarWeeks" 
        :key="index"
        @mouseenter="hoveredWeekIndex = index"
        @mouseleave="hoveredWeekIndex = null"
        class="relative group grid grid-cols-7 gap-1 p-1 -mx-1 rounded-xl transition-all duration-200"
        :class="{
          'bg-purple-50/60 ring-1 ring-purple-100': !clipboard.type && hoveredWeekIndex === index
        }"
      >
        <div 
          v-if="
            (clipboard.type === 'week' && hoveredWeekIndex === index) ||
            (clipboard.type === 'two-weeks' && hoveredWeekIndex !== null && (index === hoveredWeekIndex || index === hoveredWeekIndex + 1))
          "
          @click="pasteWeeks(hoveredWeekIndex !== null ? hoveredWeekIndex : index)"
          class="absolute inset-0 z-10 bg-purple-100/90 border-2 border-dashed border-purple-500 rounded-xl flex items-center justify-center cursor-pointer shadow-sm transition-all"
        >
          <span v-if="index === hoveredWeekIndex" class="text-purple-700 font-extrabold text-sm shadow-md bg-white px-5 py-2 rounded-full animate-bounce-short">
            여기에 {{ clipboard.type === 'two-weeks' ? '2주치' : '1주치' }} 스케줄 붙여넣기
          </span>
        </div>

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

        <div 
          v-if="!clipboard.type" 
          class="absolute -right-[120px] top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex space-x-1.5 z-20"
        >
          <button @click="copyWeek(index)" class="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-600 text-[11px] font-bold rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-200 shadow-sm transition whitespace-nowrap">
            1주 복사
          </button>
          <button @click="copyTwoWeeks(index)" class="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-600 text-[11px] font-bold rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-sm transition whitespace-nowrap">
            2주 복사
          </button>
        </div>
      </div>
    </div>

    <div class="border-t pt-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-gray-800">{{ displaySelectedDate }} 등록된 수업</h3>
        
        <button 
          @click="openCreateModal" 
          class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-gray-800 transition flex items-center gap-1"
        >
          <span class="text-lg leading-none">+</span> 수업 추가
        </button>
      </div>
      
      <div v-if="clipboard.type === 'single'" class="mb-4 p-4 rounded-xl border-2 border-dashed border-purple-400 bg-purple-50 flex justify-between items-center">
        <div class="text-sm font-bold text-purple-800">📍 현재 선택된 날짜에 붙여넣기 할까요?</div>
        <button @click="pasteSingle" class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-purple-700 transition">여기에 붙여넣기</button>
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

  <div v-if="clipboard.type" class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] bg-gray-900/95 backdrop-blur shadow-2xl rounded-full px-6 py-3 flex items-center space-x-4 animate-fade-in-up">
    <div class="text-white text-sm font-medium whitespace-nowrap">
      <span class="text-purple-300 font-bold mr-1">📋 {{ clipboard.label }}</span> 복사됨
    </div>
    <div class="w-px h-4 bg-gray-600"></div>
    <button @click="clearClipboard" class="text-gray-400 hover:text-white text-sm font-bold transition">취소</button>
  </div>

  <div v-if="isCreateModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all animate-slide-up">
      <div class="flex justify-between items-center p-5 md:p-6 border-b border-gray-100">
        <div>
          <h2 class="text-xl font-extrabold text-gray-800">새 수업 개설</h2>
          <p class="text-gray-500 text-sm mt-1">스케줄표에 올라갈 수업을 만들어주세요.</p>
        </div>
        <button @click="closeCreateModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <div class="p-5 md:p-6">
        <form @submit.prevent="handleCreateLesson" class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">수업명 (난이도)</label>
            <input v-model="title" type="text" placeholder="예: 입문반 (폴린이 환영)" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" />
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">강사명</label>
            <input v-model="instructor" type="text" placeholder="예: 오로라" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">날짜</label>
              <input v-model="formDate" type="date" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">시작 시간</label>
              <input v-model="startTime" type="text" placeholder="1900" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-bold" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">종료 시간</label>
              <input v-model="endTime" type="text" placeholder="2000" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-bold" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">정원 (명)</label>
            <input v-model="capacity" type="number" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" />
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full bg-purple-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-md hover:bg-purple-700 active:scale-[0.98] transition-transform">
              스케줄에 올리기!
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
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

.animate-fade-in { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>