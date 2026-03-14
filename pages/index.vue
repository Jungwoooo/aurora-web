<script setup lang="ts">
// 환경 변수(주소) 가져오기
const config = useRuntimeConfig()

// 대못(하드코딩) 뽑아내고 baseURL을 사용합니다!
const { data, pending, error, refresh } = await useFetch('/test', {
  baseURL: config.public.apiUrl, // 로컬에선 localhost:8080, 배포하면 AWS IP!
  method: 'GET'
})

const fetchData = () => {
  refresh()
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h1>✨ 오로라 폴댄스 메인 페이지 (로컬 연동 테스트)</h1>
    <hr />

    <div v-if="pending"><p>로딩 중...</p></div>
    
    <div v-else-if="error">
      <p style="color: red;">❌ 에러 발생!</p>
      <pre>{{ error }}</pre>
    </div>

    <div v-else>
      <p style="color: blue; font-size: 1.5rem;">
        ✅ 로컬 백엔드 응답: <strong>{{ data }}</strong>
      </p>
    </div>

    <button @click="fetchData" style="padding: 10px 20px; cursor: pointer;">
      다시 불러오기
    </button>
  </div>
</template>