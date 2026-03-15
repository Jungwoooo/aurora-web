<template>
  <div class="animate-fade-in text-center py-6">
    <div class="bg-purple-100 rounded-2xl p-8 mb-8 shadow-sm">
      <h1 class="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
        당신의 가장 <br/>
        <span class="text-purple-600">아름다운 순간</span>
      </h1>
      <p class="text-gray-600 font-medium">오로라 폴댄스가 기록합니다.</p>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-10">
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div class="text-2xl mb-2">✨</div>
        <h3 class="font-bold text-gray-800 text-sm mb-1">프리미엄 시설</h3>
        <p class="text-xs text-gray-500">최고급 폴과 넓은 연습실</p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div class="text-2xl mb-2">🤝</div>
        <h3 class="font-bold text-gray-800 text-sm mb-1">밀착 코칭</h3>
        <p class="text-xs text-gray-500">소수 정예 맞춤형 수업</p>
      </div>
    </div>

    <NuxtLink to="/reservation" class="block w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition">
      이번 주 수업 예약하러 가기 &rarr;
    </NuxtLink>
  </div>
</template>