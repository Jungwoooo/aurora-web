// stores/member.ts
import { defineStore } from 'pinia'
// 💡 Nuxt 3의 마법의 주머니(useCookie)는 자동으로 import 되므로 그냥 쓰면 됩니다!

export const useMemberStore = defineStore('member', {
  state: () => ({
    userInfo: null as any,
    isAuthenticated: false,
  }),

  actions: {
    async signup(formData: any) {
      return await useCallApi('/api/member/signup', { // 💡 아까 원장님이 고치신 member 유지!
        method: 'POST',
        body: formData
      })
    },

    async login(loginData: any) {
      const result: any = await useCallApi('/api/member/login', {
        method: 'POST',
        body: loginData
      })

      // 1. 내 정보 보관
      this.userInfo = {
        id: result.id,
        name: result.name,
        role: result.role
      }
      this.isAuthenticated = true

      // 🎟️ 2. 핵심! 백엔드가 준 팔찌(accessToken)를 쿠키 주머니에 안전하게 보관하기!
      const tokenCookie = useCookie('accessToken')
      tokenCookie.value = result.accessToken // 쿠키에 저장 완료!

      return result
    },

    logout() {
      // 1. 내 정보 날리기
      this.userInfo = null
      this.isAuthenticated = false
      
      // 🗑️ 2. 쿠키 주머니에 있던 팔찌 찢어버리기!
      const tokenCookie = useCookie('accessToken')
      tokenCookie.value = null 

      alert('안전하게 로그아웃 되었습니다.')
    }
  }
})