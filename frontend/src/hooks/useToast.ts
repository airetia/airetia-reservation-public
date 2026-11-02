// frontend/src/hooks/useToast.ts
// Re-export useToast from ToastProvider for import path compatibility
// → 全ページで @/hooks/useToast または @/contexts/ToastProvider どちらでも使用可
export { useToast } from '@/contexts/ToastProvider'
