import type { ComputedRef, VNode } from 'vue'

export type ToastTypes = 'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default'

export interface ToastClassnames {
  toast?: string
  title?: string
  description?: string
  loader?: string
  closeButton?: string
  cancelButton?: string
  actionButton?: string
  success?: string
  error?: string
  info?: string
  warning?: string
  loading?: string
  default?: string
  content?: string
  icon?: string
}

export interface ToastIcons {
  success?: VNode
  info?: VNode
  warning?: VNode
  error?: VNode
  loading?: VNode
  close?: VNode
}

export interface Action {
  label: VNode | string
  onClick: (event: MouseEvent) => void
  actionButtonStyle?: Record<string, any>
}

export interface ToastT {
  id: number | string
  toasterId?: string
  title?: (() => VNode | string) | VNode | string
  type?: ToastTypes
  icon?: VNode
  jsx?: VNode
  richColors?: boolean
  invert?: boolean
  closeButton?: boolean
  dismissible?: boolean
  description?: (() => VNode | string) | VNode | string
  duration?: number
  delete?: boolean
  action?: Action | VNode
  cancel?: Action | VNode
  onDismiss?: (toast: ToastT) => void
  onAutoClose?: (toast: ToastT) => void
  cancelButtonStyle?: Record<string, any>
  actionButtonStyle?: Record<string, any>
  style?: Record<string, any>
  unstyled?: boolean
  className?: string
  classNames?: ToastClassnames
  descriptionClassName?: string
  position?: Position
  testId?: string
  closeButtonAriaLabel?: string
}

export function isAction(action: Action | VNode): action is Action {
  return (action as Action).label !== undefined
}

export type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'

export interface HeightT {
  height: number
  toastId: number | string
  position: Position
}

interface ToastOptions {
  className?: string
  closeButton?: boolean
  descriptionClassName?: string
  style?: Record<string, any>
  cancelButtonStyle?: Record<string, any>
  actionButtonStyle?: Record<string, any>
  duration?: number
  unstyled?: boolean
  classNames?: ToastClassnames
  closeButtonAriaLabel?: string
  toasterId?: string
}

type Offset
  = | {
    top?: string | number
    right?: string | number
    bottom?: string | number
    left?: string | number
  }
  | string
  | number

export interface ToasterProps {
  id?: string
  invert?: boolean
  theme?: 'light' | 'dark' | 'system'
  position?: Position
  hotkey?: string[]
  richColors?: boolean
  expand?: boolean
  duration?: number
  gap?: number
  visibleToasts?: number
  closeButton?: boolean
  toastOptions?: ToastOptions
  className?: string
  style?: Record<string, any>
  offset?: Offset
  mobileOffset?: Offset
  dir?: 'rtl' | 'ltr' | 'auto'
  swipeDirections?: SwipeDirection[]
  icons?: ToastIcons
  containerAriaLabel?: string
}

export type SwipeDirection = 'top' | 'right' | 'bottom' | 'left'

export interface ToastProps {
  toast: ToastT
  toasts: ToastT[]
  index: number
  swipeDirections?: SwipeDirection[]
  expanded: boolean
  invert: boolean
  heights: HeightT[]
  setHeights: (heights: HeightT[]) => void
  removeToast: (toast: ToastT) => void
  gap?: number
  position: Position
  visibleToasts: number
  expandByDefault: boolean
  closeButton: boolean
  interacting: boolean
  style?: Record<string, any>
  cancelButtonStyle?: Record<string, any>
  actionButtonStyle?: Record<string, any>
  duration?: number
  className?: string
  unstyled?: boolean
  descriptionClassName?: string
  loadingIcon?: VNode
  classNames?: ToastClassnames
  icons?: ToastIcons
  closeButtonAriaLabel?: string
  defaultRichColors?: boolean
  dir?: 'rtl' | 'ltr' | 'auto'
}

export enum SwipeStateTypes {
  SwipedOut = 'SwipedOut',
  SwipedBack = 'SwipedBack',
  NotSwiped = 'NotSwiped',
}

export type Theme = 'light' | 'dark'

export interface ToastToDismiss {
  id: number | string
  dismiss: boolean
}

export type ExternalToast = Omit<ToastT, 'id' | 'type' | 'title' | 'jsx' | 'delete' | 'promise'> & {
  id?: number | string
  toasterId?: string
}


export interface ToastComposable {
  // State
  toasts: ComputedRef<ToastT[]>
  history: ComputedRef<ToastT[]>
  // Methods
  toast: ToastFunction  
  dismiss: (id?: number | string) => number | string | undefined
  dismissAll: () => void
}

export interface ToastFunction {
  (message: VNode | string, data?: ExternalToast): number | string
  success: (message: VNode | string, data?: ExternalToast) => number | string
  error: (message: VNode | string, data?: ExternalToast) => number | string
  info: (message: VNode | string, data?: ExternalToast) => number | string
  warning: (message: VNode | string, data?: ExternalToast) => number | string
  loading: (message: VNode | string, data?: ExternalToast) => number | string
  message: (message: VNode | string, data?: ExternalToast) => number | string
}
