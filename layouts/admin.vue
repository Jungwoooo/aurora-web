<script setup lang="ts">
import { useMemberStore } from '@/stores/member'
const memberStore = useMemberStore()
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col font-sans">
    <header class="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div class="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
        <NuxtLink to="/admin" class="text-xl font-extrabold text-purple-400">
          오로라 관리자
        </NuxtLink>
        
        <div class="flex space-x-3">
          <NuxtLink to="/" class="text-sm font-bold bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition">
            홈으로
          </NuxtLink>
          <button @click="() => { memberStore.logout(); $router.push('/login') }" class="text-sm font-bold bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition">
            로그아웃
          </button>
        </div>
      </div>
    </header>

    <nav class="bg-gray-800 text-gray-300 text-sm font-medium overflow-x-auto whitespace-nowrap scrollbar-hide">
      <div class="max-w-md mx-auto px-2 flex">
        <NuxtLink to="/admin/member" class="px-4 py-3 hover:text-white hover:bg-gray-700 transition">회원 관리</NuxtLink>
        <NuxtLink to="/admin/lesson" class="px-4 py-3 hover:text-white hover:bg-gray-700 transition">수업 스케줄</NuxtLink>
        <NuxtLink to="/admin/voucher" class="px-4 py-3 hover:text-white hover:bg-gray-700 transition">수강권 관리</NuxtLink>
      </div>
    </nav>

    <main class="flex-grow max-w-md w-full mx-auto p-4">
      <slot />
    </main>
  </div>
</template>