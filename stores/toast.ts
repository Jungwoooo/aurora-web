import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const isVisible = ref(false)
  const message = ref('')
  const type = ref<'success' | 'error'>('success')

  const show = (msg: string, toastType: 'success' | 'error' = 'success') => {
    message.value = msg
    type.value = toastType
    isVisible.value = true
    
    // 💡 3초 뒤에 스르륵 알아서 사라지는 마법!
    setTimeout(() => {
      isVisible.value = false
    }, 3000) 
  }

  return { isVisible, message, type, show }
})