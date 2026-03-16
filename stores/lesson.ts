// stores/lesson.ts
import { defineStore } from 'pinia'

export const useLessonStore = defineStore('lesson', {
  actions: {
    // 🗓️ 특정 날짜의 수업 목록 가져오기
    async fetchLessons(date: string) {
      const response = await useCallApi(`/api/lesson/list?date=${date}`, {
        method: 'GET'
      })
      return response // LessonResponseDto 배열이 날아옵니다!
    }
  }
})