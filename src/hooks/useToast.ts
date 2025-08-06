import { useState } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

type ToastState = {
  type: ToastType
  message: string
  isVisible: boolean
}

// Hook for managing toast state
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (type: ToastType, message: string, duration?: number) => {
    setToast({ type, message, isVisible: true })
    
    if (duration !== 0) {
      setTimeout(() => {
        setToast((prev: ToastState | null) => prev ? { ...prev, isVisible: false } : null)
      }, duration || 3000)
    }
  }

  const hideToast = () => {
    setToast((prev: ToastState | null) => prev ? { ...prev, isVisible: false } : null)
  }

  return {
    toast,
    showToast,
    hideToast,
    success: (message: string, duration?: number) => showToast('success', message, duration),
    error: (message: string, duration?: number) => showToast('error', message, duration),
    warning: (message: string, duration?: number) => showToast('warning', message, duration),
    info: (message: string, duration?: number) => showToast('info', message, duration),
  }
} 