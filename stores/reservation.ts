import { defineStore } from 'pinia'
// import { useCallApi } from '@/composables/useCallApi'

export const useReservationStore = defineStore('reservation', () => {
  // 🗓️ 예약 API 찌르기! (memberId와 lessonId를 실어서 보냅니다)
  const createReservation = async (payload: { memberId: number, lessonId: number }) => {
    const response = await useCallApi('/api/reservation/create', {
      method: 'POST',
      body: payload
    })
    return response
  }

  // 🚀 2. [신규] 내 예약 목록 가져오기
  const fetchMyReservations = async (memberId: number) => {
    return await useCallApi(`/api/reservation/my?memberId=${memberId}`, { method: 'GET' })
  }

  // 🚀 3. [신규] 수강생 본인 예약 취소하기
  const cancelMyReservation = async (reservationId: number, memberId: number) => {
    return await useCallApi(`/api/reservation/${reservationId}?memberId=${memberId}`, { method: 'DELETE' })
  }

  return { 
    createReservation,
    fetchMyReservations,
    cancelMyReservation
  }
})