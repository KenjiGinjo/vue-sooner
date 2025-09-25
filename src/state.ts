import type {
  ExternalToast,
  ToastComposable,
  ToastFunction,
  ToastT,
  ToastToDismiss,
  ToastTypes,
} from './types'
import { ref, computed, onUnmounted } from 'vue'

let toastsCounter = 1

type titleT = (() => any) | any

class Observer {
  subscribers: Array<(toast: ExternalToast | ToastToDismiss) => void>
  toasts: Array<ToastT | ToastToDismiss>
  dismissedToasts: Set<string | number>

  constructor() {
    this.subscribers = []
    this.toasts = []
    this.dismissedToasts = new Set()
  }

  // We use arrow functions to maintain the correct `this` reference
  subscribe = (subscriber: (toast: ExternalToast | ToastToDismiss) => void) => {
    this.subscribers.push(subscriber)

    return () => {
      const index = this.subscribers.indexOf(subscriber)
      this.subscribers.splice(index, 1)
    }
  }

  publish = (data: ToastT) => {
    this.subscribers.forEach(subscriber => subscriber(data as ExternalToast))
  }

  addToast = (data: ToastT) => {
    this.publish(data)
    this.toasts = [...this.toasts, data]
  }

  create = (
    data: ExternalToast & {
      message?: titleT
      type?: ToastTypes
      jsx?: any
    },
  ) => {
    const { message, ...rest } = data
    const id = typeof data?.id === 'number' || (data.id && data.id.length > 0) ? data.id : toastsCounter++
    const alreadyExists = this.toasts.find((toast) => {
      return toast.id === id
    })
    const dismissible = data.dismissible === undefined ? true : data.dismissible

    if (this.dismissedToasts.has(id)) {
      this.dismissedToasts.delete(id)
    }

    if (alreadyExists) {
      this.toasts = this.toasts.map((toast) => {
        if (toast.id === id) {
          this.publish({ ...toast, ...data, id, title: message } as ToastT)
          return {
            ...toast,
            ...data,
            id,
            dismissible,
            title: message,
          } as ToastT
        }

        return toast
      })
    }
    else {
      this.addToast({ title: message, ...rest, dismissible, id } as ToastT)
    }

    return id
  }

  dismiss = (id?: number | string) => {
    if (id) {
      this.dismissedToasts.add(id)
      requestAnimationFrame(() => this.subscribers.forEach(subscriber => subscriber({ id, dismiss: true })))
    }
    else {
      this.toasts.forEach((toast) => {
        this.subscribers.forEach(subscriber => subscriber({ id: toast.id, dismiss: true }))
      })
    }

    return id
  }

  message = (message: titleT | any, data?: ExternalToast) => {
    return this.create({ ...data, message })
  }

  error = (message: titleT | any, data?: ExternalToast) => {
    return this.create({ ...data, message, type: 'error' })
  }

  success = (message: titleT | any, data?: ExternalToast) => {
    return this.create({ ...data, type: 'success', message })
  }

  info = (message: titleT | any, data?: ExternalToast) => {
    return this.create({ ...data, type: 'info', message })
  }

  warning = (message: titleT | any, data?: ExternalToast) => {
    return this.create({ ...data, type: 'warning', message })
  }

  loading = (message: titleT | any, data?: ExternalToast) => {
    return this.create({ ...data, type: 'loading', message })
  }


  getActiveToasts = () => {
    return this.toasts.filter(toast => !this.dismissedToasts.has(toast.id))
  }
}

export const ToastState = new Observer()

// bind this to the toast function
function toastFunction(message: titleT, data?: ExternalToast) {
  const id = data?.id || toastsCounter++

  ToastState.addToast({
    title: message,
    ...data,
    id,
  })
  return id
}

const basicToast = toastFunction

const getHistory = () => ToastState.toasts
const getToasts = () => ToastState.getActiveToasts()

// We use `Object.assign` to maintain the correct types as we would lose them otherwise
export const toast = Object.assign(
  basicToast,
  {
    success: ToastState.success,
    info: ToastState.info,
    warning: ToastState.warning,
    error: ToastState.error,
    message: ToastState.message,
    dismiss: ToastState.dismiss,
    loading: ToastState.loading,
  },
  { getHistory, getToasts },
) as ToastFunction

// Vue 3 composable
export function useToast(): ToastComposable {
  const toasts = ref<ToastT[]>([])
  const history = ref<ToastT[]>([])

  // Subscribe to toast state changes
  const unsubscribe = ToastState.subscribe((toast: ExternalToast | ToastToDismiss) => {
    if ('dismiss' in toast && toast.dismiss) {
      // Remove toast
      toasts.value = toasts.value.filter((t: ToastT) => t.id !== toast.id)
    }
    else {
      // Add or update toast
      const existingIndex = toasts.value.findIndex((t: ToastT) => t.id === toast.id)
      if (existingIndex >= 0) {
        toasts.value[existingIndex] = toast as ToastT
      }
      else {
        toasts.value.push(toast as ToastT)
      }
    }
    history.value = ToastState.toasts.filter((t): t is ToastT => !('dismiss' in t)) as ToastT[]
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return {
    toasts: computed(() => toasts.value),
    history: computed(() => history.value),
    toast,
    dismiss: ToastState.dismiss,
    dismissAll: () => ToastState.dismiss(),
  }
}
