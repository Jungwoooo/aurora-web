// stores/reservation.ts
import { defineStore } from 'pinia'
// import { useCallApi } from '@/composables/useCallApi'

export const useReservationStore = defineStore('reservation', {
  actions: {
    // 🗓️ 예약 API 찌르기! (memberId와 lessonId를 실어서 보냅니다)
    async createReservation(payload: { memberId: number, lessonId: number }) {
      const response = await useCallApi('/api/reservation/create', {
        method: 'POST',
        body: payload
      })
      return response
    }
  }
})