// composables/useCallApi.ts
export const useCallApi = async (path: string, options: any = {}) => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;
  
  // 🎟️ 1. 무전 치기 전에 쿠키 주머니에서 팔찌(토큰) 꺼내기
  const tokenCookie = useCookie('accessToken')

  // 🛡️ 2. 기본 헤더 설정 (기존 헤더가 있으면 유지하고 덮어쓰기)
  const headers = { ...options.headers }
  
  // 3. 주머니에 팔찌가 있다면? -> 백엔드가 요구하는 'Bearer [토큰]' 형식으로 이마에 딱 붙이기!
  if (tokenCookie.value) {
    headers['Authorization'] = `Bearer ${tokenCookie.value}`
  }

  try {
    const response = await $fetch(path, {
      baseURL,
      ...options,
      headers // 💡 팔찌가 붙은 헤더를 같이 발사!
    })
    return response
  } catch (error: any) {
    console.error('🚨 API 통신 에러:', error.response?._data || error.message)
    throw error 
  }
}