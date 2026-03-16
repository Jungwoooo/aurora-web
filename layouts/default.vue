<script setup lang="ts">
import { ref } from 'vue'
import { useMemberStore } from '@/stores/member' // 💡 창고 소환!
const memberStore = useMemberStore();
const isMenuOpen = ref(false);
const closeMenu = () => { isMenuOpen.value = false }
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
        <NuxtLink to="/" class="text-xl font-extrabold text-purple-600" @click="closeMenu">오로라 폴 스튜디오</NuxtLink>
        <button @click="isMenuOpen = !isMenuOpen" class="text-gray-600">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </header>

    <div v-if="isMenuOpen" @click="closeMenu" class="fixed inset-0 bg-black/50 z-50"></div>
    
    <div :class="isMenuOpen ? 'translate-x-0' : 'translate-x-full'"
         class="fixed top-0 right-0 h-full w-[180px] bg-white shadow-2xl z-50 transition-transform duration-300 flex flex-col">
      <div class="p-5 flex justify-end border-b"><button @click="closeMenu" class="text-2xl text-gray-400">&times;</button></div>
      <nav class="flex flex-col p-5 space-y-6 text-lg font-bold">
        <NuxtLink to="/" @click="closeMenu">홈</NuxtLink>
        <NuxtLink to="/teacher" @click="closeMenu">강사 소개</NuxtLink>
        <NuxtLink to="/reservation" @click="closeMenu">수강 예약</NuxtLink>

        <hr class="border-gray-200" />

        <NuxtLink v-if="!memberStore.isAuthenticated" to="/login" @click="closeMenu" class="text-purple-600">로그인</NuxtLink>

        <div v-else class="flex flex-col space-y-6">
          <NuxtLink v-if="memberStore.userInfo?.role === 'admin'" to="/admin" @click="closeMenu" class="text-blue-600 bg-blue-50 px-4 py-2 rounded-lg inline-block text-center">
            관리자 모드 가기
          </NuxtLink>
          
          <button @click="() => { memberStore.logout(); closeMenu(); $router.push('/') }" class="text-red-500 text-left">
            로그아웃
          </button>
        </div>
      </nav>
    </div>

    <main class="flex-grow max-w-md w-full mx-auto p-4"><slot /></main>
  </div>
</template>