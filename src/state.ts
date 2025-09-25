import type {
  ExternalToast,
  PromiseData,
  PromiseIExtendedResult,
  PromiseT,
  ToastComposable,
  ToastFunction,
  ToastT,
  ToastToDismiss,
  ToastTypes,
} from './types'
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
      promise?: PromiseT
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

  promise = <ToastData>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData>) => {
    if (!data) {
      // Nothing to show
      return
    }

    let id: string | number | undefined
    if (data.loading !== undefined) {
      id = this.create({
        ...data,
        promise,
        type: 'loading',
        message: data.loading,
        description: typeof data.description !== 'function' ? data.description : undefined,
      })
    }

    const p = Promise.resolve(typeof promise === 'function' ? promise() : promise)

    let shouldDismiss = id !== undefined
    let result: ['resolve', ToastData] | ['reject', unknown]

    const originalPromise = p
      .then(async (response) => {
        result = ['resolve', response]
        const isVueElementResponse = response && typeof response === 'object' && '__v_isVNode' in response
        if (isVueElementResponse) {
          shouldDismiss = false
          this.create({ id, type: 'default', message: response })
        }
        else if (isHttpResponse(response) && !response.ok) {
          shouldDismiss = false

          const promiseData
            = typeof data.error === 'function' ? await data.error(`HTTP error! status: ${response.status}`) : data.error

          const description
            = typeof data.description === 'function'
              ? await data.description(`HTTP error! status: ${response.status}`)
              : data.description

          const isExtendedResult = typeof promiseData === 'object' && !isVueElementResponse

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData || '' }

          this.create({ id, type: 'error', description, ...toastSettings })
        }
        else if (response instanceof Error) {
          shouldDismiss = false

          const promiseData = typeof data.error === 'function' ? await data.error(response) : data.error

          const description
            = typeof data.description === 'function' ? await data.description(response) : data.description

          const isExtendedResult = typeof promiseData === 'object' && !isVueElementResponse

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData || '' }

          this.create({ id, type: 'error', description, ...toastSettings })
        }
        else if (data.success !== undefined) {
          shouldDismiss = false
          const promiseData = typeof data.success === 'function' ? await data.success(response) : data.success

          const description
            = typeof data.description === 'function' ? await data.description(response) : data.description

          const isExtendedResult = typeof promiseData === 'object' && !isVueElementResponse

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData || '' }

          this.create({ id, type: 'success', description, ...toastSettings })
        }
      })
      .catch(async (error) => {
        result = ['reject', error]
        if (data.error !== undefined) {
          shouldDismiss = false
          const promiseData = typeof data.error === 'function' ? await data.error(error) : data.error

          const description = typeof data.description === 'function' ? await data.description(error) : data.description

          const isExtendedResult = typeof promiseData === 'object' && !(error && typeof error === 'object' && '__v_isVNode' in error)

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData || '' }

          this.create({ id, type: 'error', description, ...toastSettings })
        }
      })
      .finally(() => {
        if (shouldDismiss) {
          // Toast is still in load state (and will be indefinitely — dismiss it)
          this.dismiss(id)
          id = undefined
        }

        data.finally?.()
      })

    const unwrap = () =>
      new Promise<ToastData>((resolve, reject) =>
        originalPromise.then(() => (result[0] === 'reject' ? reject(result[1]) : resolve(result[1]))).catch(reject),
      )

    if (typeof id !== 'string' && typeof id !== 'number') {
      // cannot Object.assign on undefined
      return { unwrap }
    }
    else {
      return Object.assign(id, { unwrap })
    }
  }

  custom = (jsx: (id: number | string) => any, data?: ExternalToast) => {
    const id = data?.id || toastsCounter++
    this.create({ jsx: jsx(id), id, ...data })
    return id
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

function isHttpResponse(data: any): data is Response {
  return (
    data
    && typeof data === 'object'
    && 'ok' in data
    && typeof data.ok === 'boolean'
    && 'status' in data
    && typeof data.status === 'number'
  )
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
    custom: ToastState.custom,
    message: ToastState.message,
    promise: ToastState.promise,
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

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    // State
    toasts: computed(() => toasts.value),
    history: computed(() => history.value),
    
    // Methods
    toast,
    success: ToastState.success,
    error: ToastState.error,
    info: ToastState.info,
    warning: ToastState.warning,
    loading: ToastState.loading,
    custom: ToastState.custom,
    promise: ToastState.promise as any,
    dismiss: ToastState.dismiss,
    dismissAll: () => ToastState.dismiss(),
    getToasts: () => toasts.value as ToastT[],
    getHistory: () => history.value,
    toastFn: toast,
  }
}
