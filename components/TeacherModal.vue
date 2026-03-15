<script setup lang="ts">
// 부모(선생님 목록 페이지)로부터 선생님 데이터를 전달받습니다.
defineProps({
  teacher: Object,
  isOpen: Boolean
})

// 부모에게 "모달 닫아줘!" 라고 신호를 보내는 함수입니다.
defineEmits(['close'])
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/75" @click="$emit('close')"></div>
    
    <div class="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh] transform transition-all">
      <button @click="$emit('close')" class="absolute top-4 right-5 text-3xl text-gray-400 hover:text-gray-700 z-10">&times;</button>
      
      <div class="p-6 text-center border-b border-gray-100 shrink-0 mt-4">
        <img :src="teacher?.img" alt="강사 사진" class="w-24 h-24 rounded-full mx-auto object-cover border-4 border-purple-50 mb-3 shadow-sm" />
        <h3 class="text-xl font-extrabold text-gray-900">{{ teacher?.name }}</h3>
        <p class="text-purple-600 font-medium text-sm">{{ teacher?.role }}</p>
      </div>
      
      <div class="p-6 overflow-y-auto grow bg-gray-50">
        <h4 class="text-md font-bold text-gray-800 border-b-2 border-purple-200 pb-2 mb-4">주요 경력</h4>
        
        <div v-for="(group, index) in teacher?.career" :key="index" class="mb-5">
          <span class="inline-block bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded mb-2">
            [{{ group.category }}]
          </span>
          <ul class="list-disc list-inside text-sm text-gray-600 space-y-1 ml-1">
            <li v-for="(item, i) in group.items" :key="i">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>