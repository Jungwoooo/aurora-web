<script setup lang="ts">
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'

definePageMeta({ layout: 'admin' })

const adminStore = useAdminStore()

const title = ref('')
const instructor = ref('')
const date = ref('') // YYYY-MM-DD
const time = ref('') // HH:mm
const capacity = ref(8) // 기본 정원 8명

const handleCreateLesson = async () => {
  if (!title.value || !instructor.value || !date.value || !time.value) {
    return alert('모든 칸을 채워주세요!')
  }

  try {
    // 💡 날짜와 시간을 합쳐서 백엔드가 좋아하는 "2026-03-20T19:00:00" 모양으로 조립!
    const startDateTime = `${date.value}T${time.value}:00`

    // 아까 만든 창고(Store)에 일 시키기!
    await adminStore.createLesson({
      title: title.value,
      instructor: instructor.value,
      startTime: startDateTime,
      capacity: Number(capacity.value)
    })

    alert('수업이 성공적으로 개설되었습니다!')
    
    // 폼 초기화
    title.value = ''
    instructor.value = ''
    date.value = ''
    time.value = ''

  } catch (error) {
    alert('수업 개설에 실패했습니다.')
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 mt-4 border border-gray-200">
    <h2 class="text-xl font-extrabold text-gray-800 mb-2">새 수업 개설</h2>
    <p class="text-gray-500 text-sm mb-6">스케줄표에 올라갈 수업을 만들어주세요.</p>
    
    <form @submit.prevent="handleCreateLesson" class="space-y-4">
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">수업명 (난이도)</label>
        <input v-model="title" type="text" placeholder="예: 입문반 (폴린이 환영)" class="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" />
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">강사명</label>
        <input v-model="instructor" type="text" placeholder="예: 오로라" class="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">날짜</label>
          <input v-model="date" type="date" class="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">시간</label>
          <input v-model="time" type="time" class="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">정원 (명)</label>
        <input v-model="capacity" type="number" class="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" />
      </div>

      <button type="submit" class="w-full bg-purple-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-md hover:bg-purple-700 active:scale-[0.98] transition-transform mt-6">
        스케줄에 올리기!
      </button>
    </form>
  </div>
</template>