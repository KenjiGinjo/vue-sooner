<template>
  <div
    data-sonner-toaster
    :data-theme="theme"
    :data-rich-colors="richColors"
    :data-y-position="position.split('-')[0]"
    :data-x-position="position.split('-')[1]"
    :data-hotkey="hotkey?.join(',')"
    :data-expand="expand"
    :data-swipe-direction="swipeDirections?.join(',')"
    :data-toaster-id="id"
    :data-rtl="dir"
    :data-mobile="isMobile"
    :data-invert="invert"
    :data-swipe-to-close="swipeToClose"
    :data-close-on-click="closeOnClick"
    :class="toasterClassName"
    :style="toasterStyle"
    :aria-label="containerAriaLabel"
    @keydown="handleKeyDown"
  >
    <Toast
      v-for="(toast, index) in visibleToasts"
      :key="(toast as unknown as ToastT).id"
      :toast="toast as unknown as ToastT"
      :toasts="toasts"
      :index="index"
      :swipe-directions="swipeDirections"
      :expanded="expanded"
      :invert="invert ?? false"
      :heights="heights"
      :set-heights="setHeights"
      :remove-toast="removeToast"
      :gap="gap"
      :position="position"
      :visible-toasts="visibleToasts"
      :expand-by-default="expandByDefault"
      :close-button="closeButton"
      :interacting="interacting"
      :style="toastOptions?.style"
      :cancel-button-style="toastOptions?.cancelButtonStyle"
      :action-button-style="toastOptions?.actionButtonStyle"
      :duration="duration"
      :class-name="toastOptions?.className"
      :unstyled="toastOptions?.unstyled"
      :description-class-name="toastOptions?.descriptionClassName"
      :loading-icon="icons?.loading"
      :class-names="toastOptions?.classNames"
      :icons="icons"
      :close-button-aria-label="toastOptions?.closeButtonAriaLabel"
      :default-rich-colors="richColors"
      @remove="handleRemoveToast"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { ToasterProps, ToastT, HeightT, Position } from '../types'
import Toast from './Toast.vue'
import { useToast } from '../composables/useToast'

const props = withDefaults(defineProps<ToasterProps>(), {
  position: 'bottom-right',
  theme: 'light',
  richColors: false,
  expand: false,
  duration: 4000,
  gap: 8,
  visibleToasts: 3,
  closeButton: false,
  dir: 'auto',
  swipeDirections: () => ['right'],
  hotkey: () => ['altKey', 'KeyT'],
})

// State
const { toasts } = useToast()
const heights = ref<HeightT[]>([])
const expanded = ref(false)
const interacting = ref(false)
const isMobile = ref(false)

// Computed
const toasterClassName = computed(() => {
  const classes = ['sonner-toaster']
  if (props.className) classes.push(props.className)
  return classes.join(' ')
})

const toasterStyle = computed(() => {
  const style: Record<string, any> = {
    '--width': '356px',
    '--gap': `${props.gap}px`,
    ...props.style,
  }

  // Position styles
  const [y, x] = props.position.split('-') as [string, string]
  if (y === 'top') {
    style.top = typeof props.offset === 'object' ? props.offset?.top || '0px' : '0px'
  } else {
    style.bottom = typeof props.offset === 'object' ? props.offset?.bottom || '0px' : '0px'
  }

  if (x === 'left') {
    style.left = typeof props.offset === 'object' ? props.offset?.left || '0px' : '0px'
  } else if (x === 'right') {
    style.right = typeof props.offset === 'object' ? props.offset?.right || '0px' : '0px'
  } else {
    style.left = '50%'
    style.transform = 'translateX(-50%)'
  }

  return style
})

const visibleToasts = computed((): ToastT[] => {
  return toasts.value.slice(0, props.visibleToasts)
})

const expandByDefault = computed(() => props.expand)

const swipeToClose = computed(() => props.swipeDirections && props.swipeDirections.length > 0)

const closeOnClick = computed(() => true)

// Methods
const setHeights = (newHeights: HeightT[]) => {
  heights.value = newHeights
}

const removeToast = (toast: ToastT) => {
  // This will be handled by the state management
  // No need to manually filter here
}

const handleRemoveToast = (toast: ToastT) => {
  removeToast(toast)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.hotkey && props.hotkey.every((key: string) => {
    if (key.startsWith('Key')) {
      return event.code === key
    }
    return event[key as keyof KeyboardEvent]
  })) {
    event.preventDefault()
    // Handle hotkey action
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 640
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>
