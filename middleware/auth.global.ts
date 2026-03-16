// middleware/auth.global.ts
import { useMemberStore } from '@/stores/member'

export default defineNuxtRouteMiddleware((to, from) => {
  const tokenCookie = useCookie('accessToken')
  const memberStore = useMemberStore()

  // 🔄 1. 새로고침 방어 로직! (쿠키엔 팔찌가 있는데, 창고가 비어있다면?)
  if (tokenCookie.value && !memberStore.isAuthenticated) {
    try {
      // JWT 팔찌는 '.' 으로 3등분 되어있고, 가운데가 정보(Payload)입니다.
      // 프론트엔드에서 이걸 해독(atob)해서 내 권한을 다시 창고에 넣습니다!
      const payload = JSON.parse(atob(tokenCookie.value.split('.')[1] || ''))
      
      memberStore.userInfo = {
        id: payload.id,    // 💡 이제 팔찌에서 내 번호도 꺼낼 수 있습니다!
        email: payload.sub,
        role: payload.role // 'USER' 또는 'ADMIN'
      }
      memberStore.isAuthenticated = true
    } catch (e) {
      // 팔찌가 썩었거나 조작됐다면 버립니다.
      tokenCookie.value = null
    }
  }

  const isLoggedIn = memberStore.isAuthenticated
  const isAdmin = memberStore.userInfo?.role === 'admin'

  // 🔒 2. 로그인한 사람은 로그인/회원가입 화면 접근 금지! (메인으로 튕겨내기)
  if (isLoggedIn && (to.path === '/login' || to.path === '/signup')) {
    return navigateTo('/')
  }

  // 👑 3. 관리자(Admin) 전용 화면 보호
  if (to.path.startsWith('/admin')) {
    if (!isLoggedIn) return navigateTo('/login')
    
    if (!isAdmin) {
      // 💡 서버(SSR) 환경에서는 alert가 없으므로 브라우저일 때만 띄웁니다.
      if (import.meta.client) alert('원장님만 들어갈 수 있는 비밀의 방입니다!')
      return navigateTo('/')
    }
  }

  // 🗓️ 4. 로그인해야 쓸 수 있는 기능들 보호 (예: 예약 화면)
  const protectedRoutes = ['/reservation'] // 나중에 마이페이지 등 추가
  if (protectedRoutes.includes(to.path) && !isLoggedIn) {
    if (import.meta.client) alert('로그인 먼저 해주세요!')
    return navigateTo('/login')
  }
})