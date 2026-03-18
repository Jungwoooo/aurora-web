import { defineStore } from 'pinia'
// import { useCallApi } from '@/composables/useCallApi'

export const useAdminStore = defineStore('admin', () => {
  
  const memberList = ref<any[]>([]) // 💡 여기에 회원 목록 쫙 담을 겁니다!

  // 🚀 [신규 추가!] 백엔드에 무전 쳐서 관리자용 회원 목록 싹 다 가져오기!
  const fetchMemberList = async () => {
    try {
      const response: any = await useCallApi('/api/admin/member/list', {
        method: 'GET'
      })
      memberList.value = response // 백엔드가 준 목록을 보관함에 쏙!
    } catch (error) {
      console.error('🚨 회원 목록 불러오기 실패:', error)
      throw error 
    }
  }

  // 💳 1. 수강권 지급 및 연장 액션 (만료일 파라미터 추가!)
  const grantVoucher = async (payload: { 
    memberId: number, 
    count: number, 
    periodMonths?: number | null, 
    customExpiredAt?: string | null 
  }) => {
    const response = await useCallApi('/api/admin/voucher/grant', {
      method: 'POST',
      body: payload
    })
    return response
  }

  // 📅 2. 수업 개설 액션 (기존 유지)
  const createLesson = async (lessonData: any) => {
    const response = await useCallApi('/api/admin/lesson/create', {
      method: 'POST',
      body: lessonData
    })
    return response
  }

  // 🚨 3. (관리자용) 특정 회원 예약 내역 조회
  const fetchMemberReservations = async (memberId: number) => {
    const response = await useCallApi(`/api/admin/reservation/${memberId}`, { 
      method: 'GET' 
    })
    return response
  }

  // 🗑️ 4. (관리자용) 예약 강제 취소 (노쇼 방어!)
  const forceCancelReservation = async (reservationId: number) => {
    const response = await useCallApi(`/api/admin/reservation/${reservationId}`, { 
      method: 'DELETE' 
    })
    return response
  }

  const fetchDailySchedule = async (date: string) => {
    const response = await useCallApi(`/api/admin/today?date=${date}`, { 
      method: 'GET' 
    })
    return response
  }

  // ✏️ 수업 수정
  const updateLesson = async (id: number, payload: any) => {
    const response = await useCallApi(`/api/admin/lesson/${id}`, { 
      method: 'PUT',
      body: payload
    })
    return response
  }

  // 🗑️ 수업 삭제 (Soft Delete)
  const deleteLesson = async (id: number) => {
    const response = await useCallApi(`/api/admin/lesson/${id}`, { 
      method: 'DELETE',
    })
    return response
  }

  // 💡 밖에서 쓸 수 있게 전부 return 해줍니다!
  return {
    memberList,

    fetchMemberList,
    grantVoucher, 
    createLesson,
    fetchMemberReservations,
    forceCancelReservation,
    fetchDailySchedule,
    updateLesson,
    deleteLesson,
  }
})