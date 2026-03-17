import { defineStore } from 'pinia'
import { ref } from 'vue'
// 💡 Nuxt 3의 마법의 주머니(useCookie)는 자동으로 import 되므로 그냥 쓰면 됩니다!

export const useMemberStore = defineStore('member', () => {

  const toastStore = useToastStore()

  // 🗄️ 1. 데이터 보관함 (State) -> 모두 ref() 로 감싸줍니다!
  const userInfo = ref<any>(null)
  const isAuthenticated = ref(false)

  // 🛠️ 2. 행동 대장들 (Actions)
  const signup = async (formData: any) => {
    return await useCallApi('/api/member/signup', { 
      method: 'POST',
      body: formData
    })
  }

  const login = async (loginData: any) => {
    const result: any = await useCallApi('/api/member/login', {
      method: 'POST',
      body: loginData
    })

    // 1. 내 정보 보관 (this. 대신 .value 를 사용합니다!)
    userInfo.value = {
      id: result.id,
      name: result.name,
      role: result.role
    }
    isAuthenticated.value = true

    // 🎟️ 2. 핵심! 백엔드가 준 팔찌(accessToken)를 쿠키 주머니에 안전하게 보관하기!
    const tokenCookie = useCookie('accessToken')
    tokenCookie.value = result.accessToken 

    return result
  }

  const logout = () => {
    // 1. 내 정보 날리기
    userInfo.value = null
    isAuthenticated.value = false
    
    // 🗑️ 2. 쿠키 주머니에 있던 팔찌 찢어버리기!
    const tokenCookie = useCookie('accessToken')
    tokenCookie.value = null 

    toastStore.show('안전하게 로그아웃 되었습니다.')
  }

  // 🚀 [신규 추가] 내 수강권 정보 가져오기!
  const fetchMyVoucher = async (memberId: number) => {
    return await useCallApi(`/api/voucher/my?memberId=${memberId}`, { 
      method: 'GET' 
    })
  }

  // 💛 카카오 로그인 처리
  const kakaoLogin = async (code: string) => {
    // 1. 백엔드로 카카오 암호(code)를 냅다 던집니다!
    const result: any = await useCallApi(`/api/member/kakao?code=${code}`, {
      method: 'GET'
    })

    // 2. 백엔드가 정보와 팔찌(accessToken)를 정상적으로 줬다면?
    if (result && result.accessToken) {
      
      // 💡 일반 로그인과 똑같이 내 정보 보관!
      userInfo.value = {
        id: result.id,
        name: result.name,
        role: result.role
      }
      isAuthenticated.value = true

      // 🎟️ 원장님의 마법 주머니(쿠키)에 팔찌 저장!
      const tokenCookie = useCookie('accessToken')
      tokenCookie.value = result.accessToken 
    }
  }

  // 💡 Setup API는 밖에서 쓸 것들을 무조건 return 해줘야 합니다!
  return {
    userInfo,
    isAuthenticated,
    signup,
    login,
    logout,
    fetchMyVoucher,
    kakaoLogin,
  }
})