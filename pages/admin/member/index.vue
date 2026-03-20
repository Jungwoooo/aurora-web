<script setup lang="ts">
// 💡 ref 추가 임포트!
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '@/stores/member'
import { useAdminStore } from '@/stores/admin' // (기존에 누락된 임포트 추가)
import { useToastStore } from '@/stores/toast' // (기존에 누락된 임포트 추가)

definePageMeta({ layout: 'admin' })

const router = useRouter()
const adminStore = useAdminStore()
const memberStore = useMemberStore()
const toastStore = useToastStore()

// members = 전체 원본 데이터
const { memberList: members } = storeToRefs(adminStore)

onMounted(async () => {
  await adminStore.fetchMemberList()
})

// 🔍 1. 검색어를 담을 빈 그릇 (실시간 반응형)
const searchQuery = ref('')

// 🚀 [추가] 한글 입력 즉시 반영을 위한 함수!
const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
}

// 🧠 2. 마법의 검색 필터링 로직! (검색어나 멤버 목록이 바뀔 때마다 알아서 재계산)
const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value

  let query = searchQuery.value.toLowerCase()

  // 🚀 핵심 마법 로직: 마지막 글자가 '자음(ㄱ-ㅎ)' 또는 '모음(ㅏ-ㅣ)' 혼자 있는 경우
  // 예: "박ㅈ" -> "박", "오ㄹ" -> "오"
  // 치고 있는 중인 불완전한 글자를 임시로 떼어내고 검색합니다!
  if (query.length > 1 && /[ㄱ-ㅎㅏ-ㅣ]$/.test(query)) {
    query = query.slice(0, -1)
  }

  // 만약 떼어냈더니 검색어가 다 날아갔다면 다시 전체 목록 보여주기
  if (!query) return members.value

  return members.value.filter((member: any) => {
    // 타겟: "오로라(aurora@test.com)" 형태로 조합
    const searchTarget = `${member.name}(${member.email})`.toLowerCase()
    return searchTarget.includes(query)
  })
})

const goToDetail = (id: number) => {
  if (memberStore.userInfo?.role === 'admin') {
    router.push(`/admin/member/${id}`)
  } else {
    toastStore.show('접근 권한이 없습니다.')
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 md:p-6">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">전체 회원 관리</h1>
        <p class="text-gray-500 mt-1 text-sm md:text-base">회원을 클릭하여 상세 정보를 관리하세요.</p>
      </div>

      <div class="w-full md:w-72">
        <input 
          :value="searchQuery" 
          @input="handleSearchInput"
          type="text" 
          placeholder="이름 또는 이메일 검색..." 
          class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition shadow-sm"
        />
      </div>
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
            v-for="member in filteredMembers" 
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

          <tr v-if="filteredMembers.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-400 font-medium">
              {{ searchQuery ? `'${searchQuery}' 검색 결과가 없습니다.` : '등록된 회원이 없습니다.' }}
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  </div>
</template>