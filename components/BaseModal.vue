<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
        <div class="absolute inset-0" @click="$emit('close')"></div>

        <Transition name="zoom">
          <div 
            v-if="isOpen" 
            class="bg-white rounded-2xl shadow-2xl w-full overflow-hidden transform transition-all relative z-10"
            :class="sizeClass"
          >
            <div class="flex justify-between items-center p-5 md:p-6 border-b border-gray-100">
              <h3 class="text-lg font-extrabold text-gray-900">
                <slot name="title">{{ title }}</slot>
              </h3>
              <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="p-5 md:p-6">
              <slot></slot>
            </div>

            <div v-if="$slots.footer" class="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' } // sm, md, lg 지원
})

defineEmits(['close'])

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'max-w-sm'
    case 'lg': return 'max-w-2xl'
    case 'md':
    default: return 'max-w-md'
  }
})
</script>

<style scoped>
/* 배경 서서히 어두워지는 효과 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 모달창이 아래서 위로 부드럽게 뿅 나타나는 효과 */
.zoom-enter-active, .zoom-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.zoom-enter-from, .zoom-leave-to {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>