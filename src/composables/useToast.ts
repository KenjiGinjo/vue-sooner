import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast as useToastState } from '../state'
import type { ToastComposable, ToastT, ExternalToast } from '../types'

/**
 * Vue 3 composable for toast functionality
 * Provides reactive toast state and methods
 */
export function useToast(): ToastComposable {
  return useToastState()
}

/**
 * Composable for toast positioning and configuration
 */
export function useToastConfig() {
  const position = ref<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'>('bottom-right')
  const theme = ref<'light' | 'dark' | 'system'>('light')
  const duration = ref(4000)
  const gap = ref(8)
  const visibleToasts = ref(3)
  const closeButton = ref(false)
  const richColors = ref(false)
  const expand = ref(false)
  
  return {
    position,
    theme,
    duration,
    gap,
    visibleToasts,
    closeButton,
    richColors,
    expand,
  }
}

/**
 * Composable for toast animations and interactions
 */
export function useToastAnimations() {
  const isAnimating = ref(false)
  const isInteracting = ref(false)
  
  const startAnimation = () => {
    isAnimating.value = true
  }
  
  const endAnimation = () => {
    isAnimating.value = false
  }
  
  const startInteraction = () => {
    isInteracting.value = true
  }
  
  const endInteraction = () => {
    isInteracting.value = false
  }
  
  return {
    isAnimating,
    isInteracting,
    startAnimation,
    endAnimation,
    startInteraction,
    endInteraction,
  }
}
