<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '@/stores/member'

definePageMeta({ layout: 'admin' })

const router = useRouter()
const adminStore = useAdminStore()
const { memberList: members } = storeToRefs(adminStore)

onMounted(async () => {
  await adminStore.fetchMemberList()
})

// 🚀 줄(Row)을 클릭하면 상세 페이지로 이동! (Nuxt의 동적 라우팅)
const goToDetail = (id: number) => {
  router.push(`/admin/member/${id}`)
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 md:p-6">
    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">전체 회원 관리</h1>
      <p class="text-gray-500 mt-1 text-sm md:text-base">회원을 클릭하여 상세 정보를 관리하세요.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
      <table class="w-full min-w-[600px] text-left border-collapse whitespace-nowrap">
        <thead class="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
          <tr>
            <th class="p-4 font-bold">ID</th>
            <th class="p-4 font-bold">이름(이메일)</th>
            <th class="p-4 font-bold text-center">남은 횟수</th>
            <th class="p-4 font-bold text-center">만료일</th>
            <th class="p-4 font-bold text-center">상세</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr 
            v-for="member in members" 
            :key="member.memberId" 
            @click="goToDetail(member.memberId)"
            class="hover:bg-purple-50 cursor-pointer transition"
          >
            <td class="p-4 text-gray-500 font-medium">{{ member.memberId }}</td>
            <td class="p-4 font-bold text-gray-800">{{ member.name + '(' + member.email + ')' }}</td>
            <td class="p-4 text-center">
              <span class="px-3 py-1 rounded-full text-sm font-bold" 
                    :class="member.remainingCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'">
                {{ member.remainingCount }}회
              </span>
            </td>
            <td class="p-4 text-center text-sm font-medium text-gray-500">
              {{ member.expiredAt ? member.expiredAt : '수강권 없음' }}
            </td>
            <td class="p-4 text-center text-gray-400">
              <span class="font-bold text-lg">›</span>
            </td>
          </tr>
          <tr v-if="members.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-400">등록된 회원이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>