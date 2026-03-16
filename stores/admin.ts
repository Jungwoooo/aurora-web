// stores/admin.ts
import { defineStore } from 'pinia'
// import { useCallApi } from '@/composables/useCallApi'

export const useAdminStore = defineStore('admin', {
  actions: {
    // 💳 1. 수강권 지급 액션 (화면에서 이사 옴!)
    async grantVoucher(payload: { memberId: number, count: number }) {
      const response = await useCallApi('/api/voucher/grant', {
        method: 'POST',
        body: payload
      })
      return response
    },

    // 2. 수업 개설 액션 (미리 만들어두기!)
    async createLesson(lessonData: any) {
      const response = await useCallApi('/api/lesson/create', {
        method: 'POST',
        body: lessonData
      })
      return response
    }
  }
})