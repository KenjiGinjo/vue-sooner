// Vue 3 Assets
// Vue 3 Plugin
import type { App } from 'vue'
import Toaster from './components/Toaster.vue'
import { useToast } from './composables/useToast'

export { CloseIcon, getAsset, isAction, Loader } from './assets'
// Vue 3 Toast Components
export { default as Toast } from './components/Toast.vue'

export { default as Toaster } from './components/Toaster.vue'

// Vue 3 Composables
export { useToast, useToastAnimations, useToastConfig } from './composables/useToast'

// Vue 3 State Management
export { toast, ToastState } from './state'

// Vue 3 Types
export type {
  Action,
  ExternalToast,
  HeightT,
  Position,
  SwipeDirection,
  SwipeStateTypes,
  Theme,
  ToastClassnames,
  ToastComposable,
  ToasterProps,
  ToastFunction,
  ToastIcons,
  ToastProps,
  ToastT,
  ToastToDismiss,
  ToastTypes,
} from './types'

export interface VueToastOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
  theme?: 'light' | 'dark' | 'system'
  duration?: number
  gap?: number
  visibleToasts?: number
  closeButton?: boolean
  richColors?: boolean
  expand?: boolean
  className?: string
  style?: Record<string, any>
  offset?: {
    top?: string | number
    right?: string | number
    bottom?: string | number
    left?: string | number
  }
  mobileOffset?: {
    top?: string | number
    right?: string | number
    bottom?: string | number
    left?: string | number
  }
  dir?: 'rtl' | 'ltr' | 'auto'
  swipeDirections?: ('top' | 'right' | 'bottom' | 'left')[]
  hotkey?: string[]
  containerAriaLabel?: string
}

export function createVueToast(options: VueToastOptions = {}) {
  return {
    install(app: App) {
      // Register global components
      app.component('VueToast', Toaster)

      // Provide toast composable globally
      app.provide('vueToast', useToast())

      // Add global properties
      app.config.globalProperties.$toast = useToast().toast
    },
  }
}

// Default export for Vue 3 plugin
export default createVueToast

// Named exports for individual usage
export { createVueToast as VueToastPlugin }
