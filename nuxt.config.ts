export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // 💡 process.env를 지우고, 기본값(로컬 주소)을 그냥 적어줍니다!
      apiUrl: 'http://localhost:8080' 
    }
  }
})