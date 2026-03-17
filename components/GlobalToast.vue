<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import { storeToRefs } from 'pinia'

const toastStore = useToastStore()
const { isVisible, message, type } = storeToRefs(toastStore)
</script>

<template>
  <Transition name="toast">
    <div 
      v-if="isVisible" 
      class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] flex items-center px-6 py-3.5 bg-white border-2 rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.1)] font-bold text-sm text-gray-900"
    >
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
/* 💡 bottom에 맞춰서, 아래에서 위로 뿅! 하고 나타나는 애니메이션 */
.toast-enter-active, .toast-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }
</style>