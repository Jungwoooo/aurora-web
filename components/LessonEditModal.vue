<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'

const props = defineProps<{
  isOpen: boolean
  lesson: any
  selectedDateStr: string
}>()

const emit = defineEmits(['close', 'refresh'])

const adminStore = useAdminStore()
const toastStore = useToastStore()

// 💡 생성 화면과 동일하게 관리
const form = ref({
  title: '',
  instructor: '',
  startTime: '',
  endTime: '',
  capacity: 7
})

// 💡 모달이 열릴 때 기존 데이터 세팅 (시간에서 : 제거하고 숫자만 보여줄지, 그대로 보여줄지 결정 가능)
// 일단 사용자 편의를 위해 '19:00' 형태로 세팅하되, 입력은 자유롭게 받도록 했습니다.
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.lesson) {
    form.value = {
      title: props.lesson.title,
      instructor: props.lesson.instructor?.replace('T', ''), 
      startTime: props.lesson.startTime?.substring(0, 5).replace(':', ''), // '1900' 형태로 넣어줌
      endTime: props.lesson.endTime?.substring(0, 5).replace(':', ''),     // '2000' 형태로 넣어줌
      capacity: props.lesson.capacity
    }
  }
})

// 💡 원장님의 마법의 로직: "1900" -> "19:00"
const formatTime = (t: string) => {
  if (!t) return ''
  return t.includes(':') ? t : t.slice(0, 2) + ':' + t.slice(2)
}

const handleSubmit = async () => {
  // 1. 빈칸 검사
  if (!form.value.title || !form.value.instructor || !form.value.startTime || !form.value.endTime) {
    return toastStore.show('모든 칸을 채워주세요!')
  }

  // 2. 시간 포맷팅 및 데이터 조립
  // 백엔드에서 LocalDateTime.parse()를 쓰신다면 날짜까지 합쳐서 보내야 하고,
  // 만약 백엔드에서 String으로 받아서 직접 처리하신다면 아래처럼 보냅니다.
  const formattedStart = formatTime(form.value.startTime)
  const formattedEnd = formatTime(form.value.endTime)

  const payload = {
    title: form.value.title,
    instructor: form.value.instructor,
    // 생성 로직과 동일하게 날짜와 합쳐서 백엔드 규격으로 발사!
    startTime: `${props.selectedDateStr}T${formattedStart}:00`,
    endTime: `${props.selectedDateStr}T${formattedEnd}:00`,
    capacity: Number(form.value.capacity)
  }

  try {
    await adminStore.updateLesson(props.lesson.id, payload)
    toastStore.show('수업이 성공적으로 수정되었습니다. ✨')
    emit('refresh')
    emit('close')
  } catch (error: any) {
    toastStore.show('수정 실패: ' + (error.response?._data || '서버 오류'))
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <div class="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all">
      <button @click="$emit('close')" class="absolute top-4 right-5 text-3xl text-gray-400 hover:text-gray-700 z-10">&times;</button>
      
      <div class="p-6 text-center border-b border-gray-100 bg-gray-50">
        <h3 class="text-xl font-extrabold text-gray-900 mt-2">수업 정보 수정</h3>
      </div>
      
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">수업명 (난이도)</label>
          <input v-model="form.title" type="text" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">강사명</label>
          <input v-model="form.instructor" type="text" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">시작 시간</label>
            <input v-model="form.startTime" type="text" placeholder="예: 1900" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-center" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">종료 시간</label>
            <input v-model="form.endTime" type="text" placeholder="예: 2000" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-center" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">정원 (명)</label>
          <input v-model="form.capacity" type="number" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
        </div>
      </div>

      <div class="p-4 bg-gray-50 flex space-x-2 border-t border-gray-100">
        <button @click="$emit('close')" class="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
          취소
        </button>
        <button @click="handleSubmit" class="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md active:scale-[0.98] transition">
          저장하기
        </button>
      </div>
    </div>
  </div>
</template>