import { ref } from 'vue'

const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('success')
let toastTimeout: NodeJS.Timeout

export function useToast() {
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    clearTimeout(toastTimeout)
    toastMessage.value = message
    toastType.value = type
    toastVisible.value = true
    
    toastTimeout = setTimeout(() => {
      toastVisible.value = false
    }, 3000)
  }

  const hideToast = () => {
    toastVisible.value = false
  }

  return {
    toastVisible,
    toastMessage,
    toastType,
    showToast,
    hideToast
  }
}