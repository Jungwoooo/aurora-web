<script setup lang="ts">
import { ref } from 'vue'

// VLog 데이터를 오로라 폴댄스에 맞게 수정!
const teachersData = [
  {
    id: 1,
    name: "장효경",
    role: "원장 / 메인 강사",
    img: "https://picsum.photos/300/300?random=1",
    career: [
      { category: "자격 및 학력", items: ["대한폴댄스연맹 전문가 1급", "생활스포츠지도사 2급"] },
      { category: "수상 내역", items: ["2024 코리아 폴 챔피언십 1위", "2025 국제 폴 아트 페스티벌 대상"] }
    ]
  },
  {
    id: 2,
    name: "박정우",
    role: "초중급 강사",
    img: "https://picsum.photos/300/300?random=2",
    career: [
      { category: "이력", items: ["전) 장효경 남자친구", "현) 장효경 남편"] },
    ]
  },
]

// 모달 상태 관리
const isModalOpen = ref(false)
const selectedTeacher = ref<any>(null)

// 강사 클릭 시 모달 띄우기
const openModal = (teacher: any) => {
  selectedTeacher.value = teacher
  isModalOpen.value = true
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-extrabold text-gray-800 border-l-4 border-purple-600 pl-3 mb-6">DIRECTOR</h2>
    
    <div class="space-y-4">
      <div 
        v-for="teacher in teachersData" :key="teacher.id"
        @click="openModal(teacher)"
        class="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-purple-300 transition"
      >
        <img :src="teacher.img" class="w-16 h-16 rounded-full object-cover shrink-0" />
        <div>
          <h4 class="text-lg font-bold text-gray-800">{{ teacher.name }}</h4>
          <p class="text-sm text-gray-500 font-medium">{{ teacher.role }}</p>
        </div>
      </div>
    </div>

    <TeacherModal 
      :isOpen="isModalOpen" 
      :teacher="selectedTeacher" 
      @close="isModalOpen = false" 
    />
  </div>
</template>