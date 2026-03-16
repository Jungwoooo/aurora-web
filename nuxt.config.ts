export default defineNuxtConfig({
  compatibilityDate: '2026-03-14',
  modules: [
    '@nuxtjs/tailwindcss', // 💡 이 줄을 추가합니다!
    '@pinia/nuxt' // 💡 Pinia 모듈 추가!
  ],
  runtimeConfig: {
    public: {
      apiUrl: 'http://localhost:8080' // 개발할 땐 다시 localhost로!
    }
  }
})